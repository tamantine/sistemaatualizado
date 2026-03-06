// =============================================
// Serviço Firebase — Camada de acesso ao banco
// Usa Firestore para armazenar dados
// =============================================
import { 
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Categoria, Produto, Fornecedor, Cliente, Caixa, Venda } from '../types';

function getCurrentTimestamp() {
  return new Date().toISOString();
}

// =============================================
// CATEGORIAS
// =============================================
export const categoriasService = {
  async listar(): Promise<Categoria[]> {
    try {
      const q = query(collection(db, 'categorias'), orderBy('nome'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Categoria[];
    } catch (error) {
      console.error('[Firebase] Erro ao listar categorias:', error);
      return [];
    }
  },

  async criar(cat: Omit<Categoria, 'id' | 'created_at' | 'updated_at'>): Promise<Categoria | undefined> {
    try {
      const docRef = await addDoc(collection(db, 'categorias'), {
        ...cat,
        created_at: getCurrentTimestamp(),
        updated_at: getCurrentTimestamp(),
      });
      return { id: docRef.id, ...cat } as Categoria;
    } catch (error) {
      console.error('[Firebase] Erro ao criar categoria:', error);
      return undefined;
    }
  },

  async atualizar(id: string, cat: Partial<Categoria>): Promise<Categoria | undefined> {
    try {
      await updateDoc(doc(db, 'categorias', id), {
        ...cat,
        updated_at: getCurrentTimestamp(),
      });
      return { id, ...cat } as Categoria;
    } catch (error) {
      console.error('[Firebase] Erro ao atualizar categoria:', error);
      return undefined;
    }
  },

  async remover(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'categorias', id));
    } catch (error) {
      console.error('[Firebase] Erro ao remover categoria:', error);
    }
  },
};

// =============================================
// FORNECEDORES
// =============================================
export const fornecedoresService = {
  async listar(): Promise<Fornecedor[]> {
    try {
      const q = query(collection(db, 'fornecedores'), orderBy('razao_social'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Fornecedor[];
    } catch (error) {
      console.error('[Firebase] Erro ao listar fornecedores:', error);
      return [];
    }
  },

  async criar(forn: Omit<Fornecedor, 'id' | 'created_at' | 'updated_at'>): Promise<Fornecedor | undefined> {
    try {
      const docRef = await addDoc(collection(db, 'fornecedores'), {
        ...forn,
        created_at: getCurrentTimestamp(),
        updated_at: getCurrentTimestamp(),
      });
      return { id: docRef.id, ...forn } as Fornecedor;
    } catch (error) {
      console.error('[Firebase] Erro ao criar fornecedor:', error);
      return undefined;
    }
  },

  async atualizar(id: string, forn: Partial<Fornecedor>): Promise<Fornecedor | undefined> {
    try {
      await updateDoc(doc(db, 'fornecedores', id), {
        ...forn,
        updated_at: getCurrentTimestamp(),
      });
      return { id, ...forn } as Fornecedor;
    } catch (error) {
      console.error('[Firebase] Erro ao atualizar fornecedor:', error);
      return undefined;
    }
  },

  async remover(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'fornecedores', id));
    } catch (error) {
      console.error('[Firebase] Erro ao remover fornecedor:', error);
    }
  },
};

// =============================================
// PRODUTOS
// =============================================
export const produtosService = {
  async listar(): Promise<Produto[]> {
    try {
      const q = query(collection(db, 'produtos'), orderBy('nome'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Produto[];
    } catch (error) {
      console.error('[Firebase] Erro ao listar produtos:', error);
      return [];
    }
  },

  async buscarPorId(id: string): Promise<Produto | undefined> {
    try {
      const docSnap = await getDoc(doc(db, 'produtos', id));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Produto;
      }
      return undefined;
    } catch (error) {
      console.error('[Firebase] Erro ao buscar produto:', error);
      return undefined;
    }
  },

  async criar(prod: Omit<Produto, 'id' | 'created_at' | 'updated_at'>): Promise<Produto | undefined> {
    try {
      const docRef = await addDoc(collection(db, 'produtos'), {
        ...prod,
        created_at: getCurrentTimestamp(),
        updated_at: getCurrentTimestamp(),
      });
      return { id: docRef.id, ...prod } as Produto;
    } catch (error) {
      console.error('[Firebase] Erro ao criar produto:', error);
      return undefined;
    }
  },

  async atualizar(id: string, prod: Partial<Produto>): Promise<Produto | undefined> {
    try {
      await updateDoc(doc(db, 'produtos', id), {
        ...prod,
        updated_at: getCurrentTimestamp(),
      });
      return { id, ...prod } as Produto;
    } catch (error) {
      console.error('[Firebase] Erro ao atualizar produto:', error);
      return undefined;
    }
  },

  async remover(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'produtos', id));
    } catch (error) {
      console.error('[Firebase] Erro ao remover produto:', error);
    }
  },

  async atualizarEstoque(id: string, novoEstoque: number): Promise<void> {
    try {
      await updateDoc(doc(db, 'produtos', id), {
        estoque_atual: novoEstoque,
        updated_at: getCurrentTimestamp(),
      });
    } catch (error) {
      console.error('[Firebase] Erro ao atualizar estoque:', error);
    }
  },
};

// =============================================
// CLIENTES
// =============================================
export const clientesService = {
  async listar(): Promise<Cliente[]> {
    try {
      const q = query(collection(db, 'clientes'), orderBy('nome'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Cliente[];
    } catch (error) {
      console.error('[Firebase] Erro ao listar clientes:', error);
      return [];
    }
  },

  async criar(cli: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>): Promise<Cliente | undefined> {
    try {
      const docRef = await addDoc(collection(db, 'clientes'), {
        ...cli,
        created_at: getCurrentTimestamp(),
        updated_at: getCurrentTimestamp(),
      });
      return { id: docRef.id, ...cli } as Cliente;
    } catch (error) {
      console.error('[Firebase] Erro ao criar cliente:', error);
      return undefined;
    }
  },

  async atualizar(id: string, cli: Partial<Cliente>): Promise<Cliente | undefined> {
    try {
      await updateDoc(doc(db, 'clientes', id), {
        ...cli,
        updated_at: getCurrentTimestamp(),
      });
      return { id, ...cli } as Cliente;
    } catch (error) {
      console.error('[Firebase] Erro ao atualizar cliente:', error);
      return undefined;
    }
  },

  async remover(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'clientes', id));
    } catch (error) {
      console.error('[Firebase] Erro ao remover cliente:', error);
    }
  },
};

// =============================================
// CAIXAS
// =============================================
export const caixasService = {
  async buscarAberto(): Promise<Caixa | null> {
    try {
      const q = query(collection(db, 'caixas'), where('status', '==', 'aberto'));
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Caixa;
    } catch (error) {
      console.error('[Firebase] Erro ao buscar caixa aberto:', error);
      return null;
    }
  },

  async abrir(caixa: Omit<Caixa, 'id' | 'created_at'>): Promise<Caixa | undefined> {
    try {
      const docRef = await addDoc(collection(db, 'caixas'), {
        ...caixa,
        created_at: getCurrentTimestamp(),
      });
      return { id: docRef.id, ...caixa } as Caixa;
    } catch (error) {
      console.error('[Firebase] Erro ao abrir caixa:', error);
      return undefined;
    }
  },

  async atualizar(id: string, dados: Partial<Caixa>): Promise<Caixa | undefined> {
    try {
      await updateDoc(doc(db, 'caixas', id), dados);
      return { id, ...dados } as Caixa;
    } catch (error) {
      console.error('[Firebase] Erro ao atualizar caixa:', error);
      return undefined;
    }
  },

  async fechar(id: string, dados: { valor_fechamento: number }): Promise<void> {
    try {
      await updateDoc(doc(db, 'caixas', id), {
        status: 'fechado',
        valor_fechamento: dados.valor_fechamento,
        fechado_em: getCurrentTimestamp(),
      });
    } catch (error) {
      console.error('[Firebase] Erro ao fechar caixa:', error);
    }
  },
};

// =============================================
// MOVIMENTAÇÕES DE CAIXA
// =============================================
export const movimentacoesCaixaService = {
  async criar(mov: {
    caixa_id: string;
    tipo: 'sangria' | 'suprimento';
    valor: number;
    motivo?: string;
    operador_nome?: string;
  }): Promise<void> {
    try {
      await addDoc(collection(db, 'caixa_movimentacoes'), {
        ...mov,
        created_at: getCurrentTimestamp(),
      });
    } catch (error) {
      console.error('[Firebase] Erro ao criar movimentação de caixa:', error);
    }
  },

  async listarPorCaixa(caixaId: string): Promise<any[]> {
    try {
      const q = query(
        collection(db, 'caixa_movimentacoes'),
        where('caixa_id', '==', caixaId),
        orderBy('created_at', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('[Firebase] Erro ao listar movimentações de caixa:', error);
      return [];
    }
  },
};

// =============================================
// VENDAS
// =============================================
export const vendasService = {
  async listar(limite = 50): Promise<Venda[]> {
    try {
      const q = query(collection(db, 'vendas'), orderBy('created_at', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.slice(0, limite).map(doc => ({ id: doc.id, ...doc.data() })) as Venda[];
    } catch (error) {
      console.error('[Firebase] Erro ao listar vendas:', error);
      return [];
    }
  },

  async criar(venda: Omit<Venda, 'id' | 'created_at' | 'numero_venda'>): Promise<Venda | undefined> {
    try {
      const docRef = await addDoc(collection(db, 'vendas'), {
        ...venda,
        created_at: getCurrentTimestamp(),
      });
      return { id: docRef.id, ...venda } as Venda;
    } catch (error) {
      console.error('[Firebase] Erro ao criar venda:', error);
      return undefined;
    }
  },

  async criarCompleta(
    vendaData: {
      caixa_id?: string;
      cliente_id?: string;
      operador_nome: string;
      subtotal: number;
      desconto_valor: number;
      desconto_percentual: number;
      total: number;
      forma_pagamento: 'dinheiro' | 'debito' | 'credito' | 'pix' | 'multiplo';
      valor_pago: number;
      troco: number;
      status: 'em_andamento' | 'finalizada' | 'cancelada' | 'em_espera';
      observacoes?: string;
    },
    itens: {
      produto_id: string;
      produto_nome: string;
      quantidade: number;
      preco_unitario: number;
      desconto: number;
      subtotal: number;
      unidade?: string;
    }[],
    pagamentos: {
      forma_pagamento: 'dinheiro' | 'debito' | 'credito' | 'pix';
      valor: number;
    }[]
  ): Promise<Venda | undefined> {
    try {
      const vendaRef = await addDoc(collection(db, 'vendas'), {
        ...vendaData,
        created_at: getCurrentTimestamp(),
      });

      for (const item of itens) {
        await addDoc(collection(db, 'venda_itens'), {
          venda_id: vendaRef.id,
          ...item,
          created_at: getCurrentTimestamp(),
        });
      }

      for (const pag of pagamentos) {
        await addDoc(collection(db, 'venda_pagamentos'), {
          venda_id: vendaRef.id,
          ...pag,
          created_at: getCurrentTimestamp(),
        });
      }

      return { id: vendaRef.id, ...vendaData } as Venda;
    } catch (error) {
      console.error('[Firebase] Erro ao criar venda completa:', error);
      return undefined;
    }
  },

  async vendasHoje(): Promise<Venda[]> {
    try {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const q = query(
        collection(db, 'vendas'),
        where('created_at', '>=', hoje.toISOString()),
        orderBy('created_at', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Venda[];
    } catch (error) {
      console.error('[Firebase] Erro ao listar vendas de hoje:', error);
      return [];
    }
  },
};

// =============================================
// CONTAS A PAGAR
// =============================================
export const contasPagarService = {
  async listar(): Promise<any[]> {
    try {
      const q = query(collection(db, 'contas_pagar'), orderBy('data_vencimento'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('[Firebase] Erro ao listar contas a pagar:', error);
      return [];
    }
  },

  async criar(conta: any): Promise<any | undefined> {
    try {
      const docRef = await addDoc(collection(db, 'contas_pagar'), {
        ...conta,
        created_at: getCurrentTimestamp(),
        updated_at: getCurrentTimestamp(),
      });
      return { id: docRef.id, ...conta };
    } catch (error) {
      console.error('[Firebase] Erro ao criar conta a pagar:', error);
      return undefined;
    }
  },

  async atualizar(id: string, dados: any): Promise<any | undefined> {
    try {
      await updateDoc(doc(db, 'contas_pagar', id), {
        ...dados,
        updated_at: getCurrentTimestamp(),
      });
      return { id, ...dados };
    } catch (error) {
      console.error('[Firebase] Erro ao atualizar conta a pagar:', error);
      return undefined;
    }
  },

  async remover(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'contas_pagar', id));
    } catch (error) {
      console.error('[Firebase] Erro ao remover conta a pagar:', error);
    }
  },

  async confirmarPagamento(id: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'contas_pagar', id), {
        status: 'pago',
        data_pagamento: new Date().toISOString().split('T')[0],
        updated_at: getCurrentTimestamp(),
      });
    } catch (error) {
      console.error('[Firebase] Erro ao confirmar pagamento:', error);
    }
  },
};

// =============================================
// CONTAS A RECEBER
// =============================================
export const contasReceberService = {
  async listar(): Promise<any[]> {
    try {
      const q = query(collection(db, 'contas_receber'), orderBy('data_vencimento'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('[Firebase] Erro ao listar contas a receber:', error);
      return [];
    }
  },

  async criar(conta: any): Promise<any | undefined> {
    try {
      const docRef = await addDoc(collection(db, 'contas_receber'), {
        ...conta,
        created_at: getCurrentTimestamp(),
        updated_at: getCurrentTimestamp(),
      });
      return { id: docRef.id, ...conta };
    } catch (error) {
      console.error('[Firebase] Erro ao criar conta a receber:', error);
      return undefined;
    }
  },

  async atualizar(id: string, dados: any): Promise<any | undefined> {
    try {
      await updateDoc(doc(db, 'contas_receber', id), {
        ...dados,
        updated_at: getCurrentTimestamp(),
      });
      return { id, ...dados };
    } catch (error) {
      console.error('[Firebase] Erro ao atualizar conta a receber:', error);
      return undefined;
    }
  },

  async remover(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'contas_receber', id));
    } catch (error) {
      console.error('[Firebase] Erro ao remover conta a receber:', error);
    }
  },

  async confirmarRecebimento(id: string, valor: number): Promise<void> {
    try {
      await updateDoc(doc(db, 'contas_receber', id), {
        status: 'recebido',
        valor_recebido: valor,
        data_recebimento: new Date().toISOString().split('T')[0],
        updated_at: getCurrentTimestamp(),
      });
    } catch (error) {
      console.error('[Firebase] Erro ao confirmar recebimento:', error);
    }
  },
};

// =============================================
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
};

// =============================================
// HORTIFRUTI
// =============================================
export const qualidadeService = {
  async listar(): Promise<any[]> {
    try {
      const q = query(collection(db, 'registros_qualidade'), orderBy('created_at', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('[Firebase] Erro ao listar registros de qualidade:', error);
      return [];
    }
  },

  async criar(reg: any): Promise<any | undefined> {
    try {
      const docRef = await addDoc(collection(db, 'registros_qualidade'), {
        ...reg,
        created_at: getCurrentTimestamp(),
      });
      return { id: docRef.id, ...reg };
    } catch (error) {
      console.error('[Firebase] Erro ao criar registro de qualidade:', error);
      return undefined;
    }
  },
};

export const perdasService = {
  async listar(): Promise<any[]> {
    try {
      const q = query(collection(db, 'perdas'), orderBy('data_registro', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('[Firebase] Erro ao listar perdas:', error);
      return [];
    }
  },

  async criar(reg: any): Promise<any | undefined> {
    try {
      const docRef = await addDoc(collection(db, 'perdas'), {
        ...reg,
        created_at: getCurrentTimestamp(),
      });
      return { id: docRef.id, ...reg };
    } catch (error) {
      console.error('[Firebase] Erro ao criar registro de perda:', error);
      return undefined;
    }
  },
};

export const rastreiosService = {
  async listar(): Promise<any[]> {
    try {
      const q = query(collection(db, 'rastreios'), orderBy('data_chegada', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('[Firebase] Erro ao listar rastreios:', error);
      return [];
    }
  },
};

export const sazonalidadeService = {
  async listar(): Promise<any[]> {
    try {
      const q = query(collection(db, 'sazonalidade'), orderBy('mes_num'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('[Firebase] Erro ao listar sazonalidade:', error);
      return [];
    }
  },
};

// =============================================
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
};

// =============================================
// DASHBOARD
// =============================================
export const dashboardService = {
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
        vendasHojeList = snapshotVendasHoje.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter((v: any) => v.status === 'finalizada');
      } catch (err) { console.error('[Dashboard] Erro index vendas hoje', err); }

      try {
        const qUltimas = query(
          collection(db, 'vendas'),
          orderBy('created_at', 'desc'),
          limit(20)
        );
        const snapshotUltimas = await getDocs(qUltimas);
        ultimasVendas = snapshotUltimas.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter((v: any) => v.status === 'finalizada')
          .slice(0, 5);
      } catch (err) { console.error('[Dashboard] Erro index ultimas vendas', err); }

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
            detalhe: `${p.estoque_atual ?? 0}/${p.estoque_minimo ?? 0}`,
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
          .filter((v: any) => v.status === 'finalizada');
      } catch (err) {
        console.error('[Dashboard] Erro index vendas semana', err);
        // fallback: pelo menos preenche o gráfico com o que já carregou hoje
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
