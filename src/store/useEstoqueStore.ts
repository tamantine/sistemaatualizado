// =============================================
// Store: Estoque — Integrado com Firebase (Firestore)
//
// COMPORTAMENTO:
//  • Carrega dados do Firebase na inicialização
//  • Firebase vazio → arrays [] → permite cadastros normalmente
//  • Firebase com dados → exibe os dados do cliente
//  • Em caso de erro de conexão → arrays [] sem dados de exemplo
// =============================================

import { create } from 'zustand';
import type { Produto, Categoria, Fornecedor } from '../types';
import { produtosService, categoriasService, fornecedoresService } from '../services/database';

const ITENS_POR_PAGINA = 15;

// ─────────────────────────────────────────────
// Interface do estado
// ─────────────────────────────────────────────

interface EstoqueState {
  produtos: Produto[];
  categorias: Categoria[];
  fornecedores: Fornecedor[];
  carregando: boolean;
  erro: string | null;
  /** true somente quando há falha de conexão com Firebase */
  offlineFallback: boolean;
  busca: string;
  filtroCategoria: string;
  paginaAtual: number;

  // Ações de dados
  carregarDados: () => Promise<void>;
  adicionarProduto: (
    p: Omit<Produto, 'id' | 'created_at' | 'updated_at' | 'categoria' | 'fornecedor'>
  ) => Promise<void>;
  atualizarProduto: (id: string, dados: Partial<Produto>) => Promise<void>;
  removerProduto: (id: string) => Promise<void>;

  // Ações de UI
  setBusca: (busca: string) => void;
  setFiltroCategoria: (filtro: string) => void;
  setPaginaAtual: (p: number) => void;

  // Getters computados
  produtosFiltrados: () => Produto[];
  produtosPaginados: () => Produto[];
  totalPaginas: () => number;
}

// ─────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────

export const useEstoqueStore = create<EstoqueState>((set, get) => ({
  // Estado inicial — sempre vazio, aguarda carregamento do Firebase
  produtos: [],
  categorias: [],
  fornecedores: [],
  carregando: false,
  erro: null,
  offlineFallback: false,
  busca: '',
  filtroCategoria: '',
  paginaAtual: 1,

  // ─────────────────────────────────────────
  // Carregamento de dados do Firebase
  // ─────────────────────────────────────────

  carregarDados: async () => {
    set({ carregando: true, erro: null });
    try {
      const [produtos, categorias, fornecedores] = await Promise.all([
        produtosService.listar(),
        categoriasService.listar(),
        fornecedoresService.listar(),
      ]);

      // Firebase retornou (mesmo que vazio) → usa os dados reais
      set({
        produtos,
        categorias,
        fornecedores,
        carregando: false,
        offlineFallback: false,
        erro: null,
      });

      console.log(
        `[Estoque] ✅ Dados carregados — ${produtos.length} produto(s), ` +
        `${categorias.length} categoria(s), ${fornecedores.length} fornecedor(es).`
      );
    } catch (err) {
      // Falha de conexão — inicia vazio, sem dados de exemplo
      const mensagem =
        err instanceof Error ? err.message : 'Erro desconhecido ao conectar ao Firebase';

      console.error('[Estoque] ❌ Falha ao carregar dados do Firebase:', mensagem);

      set({
        produtos: [],
        categorias: [],
        fornecedores: [],
        carregando: false,
        offlineFallback: true,
        erro: 'Não foi possível conectar ao Firebase. Verifique sua conexão.',
      });
    }
  },

  // ─────────────────────────────────────────
  // CRUD de Produtos
  // ─────────────────────────────────────────

  adicionarProduto: async (prod) => {
    try {
      const novoProduto = await produtosService.criar(prod);
      if (novoProduto) {
        set((s) => ({ produtos: [novoProduto, ...s.produtos] }));
        console.log('[Estoque] ✅ Produto adicionado:', novoProduto.nome);
      }
    } catch (err) {
      console.error('[Estoque] ❌ Erro ao criar produto:', err);
      throw err;
    }
  },

  atualizarProduto: async (id, dados) => {
    try {
      const prodAtualizado = await produtosService.atualizar(id, dados);
      if (prodAtualizado) {
        set((s) => ({
          produtos: s.produtos.map((p) =>
            p.id === id ? { ...p, ...prodAtualizado } : p
          ),
        }));
      }
    } catch (err) {
      console.error('[Estoque] ❌ Erro ao atualizar produto:', err);
      throw err;
    }
  },

  removerProduto: async (id) => {
    try {
      await produtosService.remover(id);
      set((s) => ({ produtos: s.produtos.filter((p) => p.id !== id) }));
    } catch (err) {
      console.error('[Estoque] ❌ Erro ao remover produto:', err);
      throw err;
    }
  },

  // ─────────────────────────────────────────
  // Ações de UI
  // ─────────────────────────────────────────

  setBusca: (busca) => set({ busca, paginaAtual: 1 }),
  setFiltroCategoria: (filtroCategoria) => set({ filtroCategoria, paginaAtual: 1 }),
  setPaginaAtual: (paginaAtual) => set({ paginaAtual }),

  // ─────────────────────────────────────────
  // Getters computados
  // ─────────────────────────────────────────

  produtosFiltrados: () => {
    const { produtos, busca, filtroCategoria } = get();
    return produtos.filter((p) => {
      const matchBusca =
        !busca ||
        p.nome.toLowerCase().includes(busca.toLowerCase()) ||
        (p.codigo ?? '').toLowerCase().includes(busca.toLowerCase()) ||
        (p.codigo_barras ?? '').includes(busca);
      const matchCategoria = !filtroCategoria || p.categoria_id === filtroCategoria;
      return matchBusca && matchCategoria;
    });
  },

  produtosPaginados: () => {
    const filtrados = get().produtosFiltrados();
    const { paginaAtual } = get();
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    return filtrados.slice(inicio, inicio + ITENS_POR_PAGINA);
  },

  totalPaginas: () => {
    const filtrados = get().produtosFiltrados();
    return Math.max(1, Math.ceil(filtrados.length / ITENS_POR_PAGINA));
  },
}));
