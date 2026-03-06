const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/services/firebaseService.ts');
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('listarPorCaixa')) {
    const listCall = \`
  async listarPorCaixa(caixaId: string): Promise<Venda[]> {
    try {
      const q = query(
        collection(db, 'vendas'),
        where('caixa_id', '==', caixaId)
      );
      const snapshot = await getDocs(q);
      const vendas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Venda[];
      return vendas.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } catch (error) {
      console.error('[Firebase] Erro ao listar vendas por caixa:', error);
      return [];
    }
  },\`;

    content = content.replace(
        /async vendasHoje\(\): Promise<Venda\[\]> \{[\s\S]*?catch \(error\) \{[\s\S]*?return \[\];\s*\}\s*\},\s*\};/g,
        (match) => match.replace('},', '},' + listCall)
    );
    
    fs.writeFileSync(file, content, 'utf8');
}
