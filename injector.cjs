const fs = require('fs');
const file = 'src/services/firebaseService.ts';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('listarPorCaixa')) {
    const fn = \`
  async listarPorCaixa(caixaId: string): Promise<Venda[]> {
    try {
      const q = query(collection(db, 'vendas'), where('caixa_id', '==', caixaId));
      const snapshot = await getDocs(q);
      const vendas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Venda[];
      return vendas.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } catch (error) {
      console.error('[Firebase] Erro ao listar vendas por caixa:', error);
      return [];
    }
  },\`;

    // acha o inicio de CONTAS A PAGAR
    const marker = '// CONTAS A PAGAR';
    const markerIndex = content.indexOf(marker);
    if (markerIndex !== -1) {
        // acha a ultima ocorrencia de '};' antes do CONTAS A PAGAR
        const lastBrace = content.lastIndexOf('};', markerIndex);
        if (lastBrace !== -1) {
            // Insere o codigo antes desse last brace
            content = content.slice(0, lastBrace) + fn + '\\n' + content.slice(lastBrace);
            fs.writeFileSync(file, content, 'utf8');
            console.log('Firebase Service injetado com sucesso!');
        } else {
            console.log('Não achei lastBrace');
        }
    } else {
        console.log('Nao achei marcador');
    }
}
