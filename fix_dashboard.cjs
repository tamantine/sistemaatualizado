const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/services/firebaseService.ts');
let content = fs.readFileSync(filePath, 'utf8');

const regexDashboardService = /export const dashboardService = \{[\s\S]*?\n\};\n\n/m;
const match = content.match(regexDashboardService);

const newDashboardService = \`export const dashboardService = {
  async obterMetricas() {
    try {
      // Buscar vendas de hoje
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const hojeISO = hoje.toISOString();

      let vendasHojeList: any[] = [];
      let ultimasVendas: any[] = [];

      try {
        const qVendasHoje = query(
          collection(db, 'vendas'),
          where('created_at', '>=', hojeISO),
          orderBy('created_at', 'desc')
        );
        const snapshotVendasHoje = await getDocs(qVendasHoje);
        // Filtragem in-memory para evitar erros de Composite Index no Firebase
        vendasHojeList = snapshotVendasHoje.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(v => v.status === 'finalizada');
      } catch (err) {
        console.error('[Firebase] Erro na query de Vendas Hoje:', err);
      }

      try {
        const qUltimas = query(
          collection(db, 'vendas'),
          orderBy('created_at', 'desc'),
          limit(20)
        );
        const snapshotUltimas = await getDocs(qUltimas);
        ultimasVendas = snapshotUltimas.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(v => v.status === 'finalizada')
          .slice(0, 5);
      } catch (err) {
        console.error('[Firebase] Erro na query de Ultimas Vendas:', err);
      }

      const totalVendasHoje = vendasHojeList.reduce((acc: number, v: any) => acc + (v.total || 0), 0);
      const qtdVendasHoje = vendasHojeList.length;
      const ticketMedio = qtdVendasHoje > 0 ? totalVendasHoje / qtdVendasHoje : 0;

      // Buscar produtos com estoque baixo (retorna no formato esperado pela UI)
      let alertasEstoque: any[] = [];
      try {
        const snapshotProdutos = await getDocs(collection(db, 'produtos'));
        const todosProdutos = snapshotProdutos.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
        alertasEstoque = todosProdutos
          .filter((p: any) => p.ativo && (p.estoque_atual ?? 0) <= (p.estoque_minimo ?? 0))
          .map((p: any) => ({
            produto: p.nome,
            tipo: 'ruptura',
            detalhe: \`\${p.estoque_atual ?? 0}/\${p.estoque_minimo ?? 0}\`,
          }))
          .slice(0, 10);
      } catch { /* ignora */ }

      // Vendas da semana (últimos 7 dias) — tenta buscar no Firebase; se falhar, calcula com as vendas de hoje
      const vendasSemana: { dia: string; valor: number }[] = [];
      const inicioSemana = new Date();
      inicioSemana.setDate(inicioSemana.getDate() - 6);
      inicioSemana.setHours(0, 0, 0, 0);

      let vendasUltimos7Dias: any[] = [];
      try {
        const qSemana = query(
          collection(db, 'vendas'),
          where('created_at', '>=', inicioSemana.toISOString()),
          orderBy('created_at', 'asc')
        );
        const snapSemana = await getDocs(qSemana);
        vendasUltimos7Dias = snapSemana.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(v => v.status === 'finalizada');
      } catch (err) {
        console.error('[Firebase] Erro na query de Vendas da Semana:', err);
        vendasUltimos7Dias = vendasHojeList;
      }

      for (let i = 6; i >= 0; i--) {
        const dia = new Date();
        dia.setDate(dia.getDate() - i);
        dia.setHours(0, 0, 0, 0);
        const diaFim = new Date(dia);
        diaFim.setHours(23, 59, 59, 999);
        const label = dia.toLocaleDateString('pt-BR', { weekday: 'short' });
        const totalDia = vendasUltimos7Dias
          .filter((v: any) => {
            const vData = new Date(v.created_at);
            return vData >= dia && vData <= diaFim;
          })
          .reduce((acc: number, v: any) => acc + (v.total || 0), 0);
        vendasSemana.push({ dia: label, valor: totalDia });
      }

      return {
        vendasHoje: totalVendasHoje,
        ticketMedio,
        produtosVendidos: qtdVendasHoje,
        alertasAtivos: alertasEstoque.length,
        ultimasVendas,
        alertasEstoque,
        vendasSemana,
        vendasPorCategoria: [],
        topProdutos: [],
      };
    } catch (error) {
      console.error('[Firebase] Erro ao obter métricas:', error);
      return {
        vendasHoje: 0,
        ticketMedio: 0,
        produtosVendidos: 0,
        alertasAtivos: 0,
        ultimasVendas: [],
        alertasEstoque: [],
        vendasSemana: [],
        vendasPorCategoria: [],
        topProdutos: [],
      };
    }
  },
};

\`;

if (match) {
  content = content.replace(regexDashboardService, newDashboardService);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('dashboardService atualizado com sucesso!');
} else {
  // alternative regex just matching start
  const regexAlt = /export const dashboardService = \{[\s\S]*?\n\};\n/m;
  if(content.match(regexAlt)) {
    content = content.replace(regexAlt, newDashboardService);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('dashboardService atualizado com alt regex!');
  } else {
    console.log('Erro: dashboardService não encontrado.');
  }
}
