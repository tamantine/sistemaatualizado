const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/services/firebaseService.ts');
let content = fs.readFileSync(filePath, 'utf8');

const replacementPedidos = `// =============================================
// PEDIDOS DE COMPRA
// =============================================
export const pedidosCompraService = {
  async listar(): Promise<any[]> {
    try {
      const q = query(collection(db, 'pedidos_compra'), orderBy('created_at', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('[Firebase] Erro ao listar pedidos de compra:', error);
      return [];
    }
  },

  async criar(pedido: any): Promise<any | undefined> {
    try {
      const docRef = await addDoc(collection(db, 'pedidos_compra'), {
        ...pedido,
        created_at: getCurrentTimestamp(),
        updated_at: getCurrentTimestamp(),
      });
      return { id: docRef.id, ...pedido };
    } catch (error) {
      console.error('[Firebase] Erro ao criar pedido de compra:', error);
      return undefined;
    }
  },

  async atualizar(id: string, dados: any): Promise<any | undefined> {
    try {
      await updateDoc(doc(db, 'pedidos_compra', id), {
        ...dados,
        updated_at: getCurrentTimestamp(),
      });
      return { id, ...dados };
    } catch (error) {
      console.error('[Firebase] Erro ao atualizar pedido de compra:', error);
      return undefined;
    }
  },

  async remover(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'pedidos_compra', id));
    } catch (error) {
      console.error('[Firebase] Erro ao remover pedido de compra:', error);
    }
  },
};

// =============================================
// COTAÇÕES
// =============================================
export const cotacoesService = {
  async listar(): Promise<any[]> {
    try {
      const q = query(collection(db, 'cotacoes'), orderBy('created_at', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('[Firebase] Erro ao listar cotações:', error);
      return [];
    }
  },

  async criar(cotacao: any): Promise<any | undefined> {
    try {
      const docRef = await addDoc(collection(db, 'cotacoes'), {
        ...cotacao,
        created_at: getCurrentTimestamp(),
        updated_at: getCurrentTimestamp(),
      });
      return { id: docRef.id, ...cotacao };
    } catch (error) {
      console.error('[Firebase] Erro ao criar cotação:', error);
      return undefined;
    }
  },

  async atualizar(id: string, dados: any): Promise<any | undefined> {
    try {
      await updateDoc(doc(db, 'cotacoes', id), {
        ...dados,
        updated_at: getCurrentTimestamp(),
      });
      return { id, ...dados };
    } catch (error) {
      console.error('[Firebase] Erro ao atualizar cotação:', error);
      return undefined;
    }
  },

  async remover(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'cotacoes', id));
    } catch (error) {
      console.error('[Firebase] Erro ao remover cotação:', error);
    }
  },
};`;

const targetPedidosREGEX = /\/\/ =============================================\r?\n\/\/ PEDIDOS DE COMPRA\r?\n\/\/ =============================================\r?\nexport const pedidosCompraService = \{\r?\n  async listar\(\): Promise<any\[\]> \{\r?\n    try \{\r?\n      const q = query\(collection\(db, 'pedidos_compra'\), orderBy\('created_at', 'desc'\)\);\r?\n      const snapshot = await getDocs\(q\);\r?\n      return snapshot\.docs\.map\(doc => \(\{ id: doc\.id, \.\.\.doc\.data\(\) \}\)\);\r?\n    \} catch \(error\) \{\r?\n      console\.error\('\[Firebase\] Erro ao listar pedidos de compra:', error\);\r?\n      return \[\];\r?\n    \}\r?\n  \},\r?\n\};/g;

content = content.replace(targetPedidosREGEX, replacementPedidos);

const replacementPromocoes = `// =============================================
// PROMOÇÕES
// =============================================
export const promocoesService = {
  async listar(): Promise<any[]> {
    try {
      const q = query(collection(db, 'promocoes'), orderBy('data_inicio', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('[Firebase] Erro ao listar promoções:', error);
      return [];
    }
  },

  async criar(promocao: any): Promise<any | undefined> {
    try {
      const docRef = await addDoc(collection(db, 'promocoes'), {
        ...promocao,
        created_at: getCurrentTimestamp(),
        updated_at: getCurrentTimestamp(),
      });
      return { id: docRef.id, ...promocao };
    } catch (error) {
      console.error('[Firebase] Erro ao criar promoção:', error);
      return undefined;
    }
  },

  async atualizar(id: string, dados: any): Promise<any | undefined> {
    try {
      await updateDoc(doc(db, 'promocoes', id), {
        ...dados,
        updated_at: getCurrentTimestamp(),
      });
      return { id, ...dados };
    } catch (error) {
      console.error('[Firebase] Erro ao atualizar promoção:', error);
      return undefined;
    }
  },

  async remover(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'promocoes', id));
    } catch (error) {
      console.error('[Firebase] Erro ao remover promoção:', error);
    }
  },
};

// =============================================
// TABELAS DE PREÇO
// =============================================
export const tabelasPrecoService = {
  async listar(): Promise<any[]> {
    try {
      const q = query(collection(db, 'tabelas_preco'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('[Firebase] Erro ao listar tabelas de preço:', error);
      return [];
    }
  },

  async criar(tabela: any): Promise<any | undefined> {
    try {
      const docRef = await addDoc(collection(db, 'tabelas_preco'), {
        ...tabela,
        created_at: getCurrentTimestamp(),
        updated_at: getCurrentTimestamp(),
      });
      return { id: docRef.id, ...tabela };
    } catch (error) {
      console.error('[Firebase] Erro ao criar tabela de preço:', error);
      return undefined;
    }
  },

  async atualizar(id: string, dados: any): Promise<any | undefined> {
    try {
      await updateDoc(doc(db, 'tabelas_preco', id), {
        ...dados,
        updated_at: getCurrentTimestamp(),
      });
      return { id, ...dados };
    } catch (error) {
      console.error('[Firebase] Erro ao atualizar tabela de preço:', error);
      return undefined;
    }
  },

  async remover(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'tabelas_preco', id));
    } catch (error) {
      console.error('[Firebase] Erro ao remover tabela de preço:', error);
    }
  },
};`;

const targetPromocoesREGEX = /\/\/ =============================================\r?\n\/\/ PROMOÇÕES\r?\n\/\/ =============================================\r?\nexport const promocoesService = \{\r?\n  async listar\(\): Promise<any\[\]> \{\r?\n    try \{\r?\n      const q = query\(collection\(db, 'promocoes'\), orderBy\('data_inicio', 'desc'\)\);\r?\n      const snapshot = await getDocs\(q\);\r?\n      return snapshot\.docs\.map\(doc => \(\{ id: doc\.id, \.\.\.doc\.data\(\) \}\)\);\r?\n    \} catch \(error\) \{\r?\n      console\.error\('\[Firebase\] Erro ao listar promoções:', error\);\r?\n      return \[\];\r?\n    \}\r?\n  \},\r?\n\};/g;

content = content.replace(targetPromocoesREGEX, replacementPromocoes);

fs.writeFileSync(filePath, content, 'utf8');
console.log('firebaseService.ts updated via regex script successfully!');
