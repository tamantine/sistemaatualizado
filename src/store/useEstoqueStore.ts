// =============================================
// Store: Estoque — Integrado com Supabase
// =============================================
import { create } from 'zustand';
import type { Produto, Categoria, Fornecedor } from '../types';
import { produtosService, categoriasService, fornecedoresService } from '../services/supabaseService';
import { produtosMock, categoriasMock, fornecedoresMock } from '../services/mockData';

const ITENS_POR_PAGINA = 15;

interface EstoqueState {
    produtos: Produto[];
    categorias: Categoria[];
    fornecedores: Fornecedor[];
    carregando: boolean;
    erro: string | null;
    usandoMock: boolean;
    busca: string;
    filtroCategoria: string;
    paginaAtual: number;

    // Ações
    carregarDados: () => Promise<void>;
    setBusca: (busca: string) => void;
    setFiltroCategoria: (filtro: string) => void;
    setPaginaAtual: (p: number) => void;
    adicionarProduto: (p: Produto | Omit<Produto, 'id' | 'created_at' | 'updated_at' | 'categoria' | 'fornecedor'>) => Promise<void>;
    atualizarProduto: (id: string, dados: Partial<Produto>) => Promise<void>;
    removerProduto: (id: string) => Promise<void>;
    produtosFiltrados: () => Produto[];
    produtosPaginados: () => Produto[];
    totalPaginas: () => number;
}

export const useEstoqueStore = create<EstoqueState>((set, get) => ({
    produtos: [],
    categorias: [],
    fornecedores: [],
    carregando: false,
    erro: null,
    usandoMock: false,
    busca: '',
    filtroCategoria: '',
    paginaAtual: 1,

    carregarDados: async () => {
        set({ carregando: true, erro: null });
        try {
            const [produtos, categorias, fornecedores] = await Promise.all([
                produtosService.listar(),
                categoriasService.listar(),
                fornecedoresService.listar(),
            ]);
            set({ produtos, categorias, fornecedores, carregando: false, usandoMock: false });
        } catch (err) {
            console.warn('[Estoque] Supabase indisponível, usando dados mock:', err);
            set({
                produtos: produtosMock,
                categorias: categoriasMock,
                fornecedores: fornecedoresMock,
                carregando: false,
                usandoMock: true,
            });
        }
    },

    setBusca: (busca) => set({ busca, paginaAtual: 1 }),
    setFiltroCategoria: (filtroCategoria) => set({ filtroCategoria, paginaAtual: 1 }),
    setPaginaAtual: (paginaAtual) => set({ paginaAtual }),

    adicionarProduto: async (prod) => {
        const { usandoMock } = get();
        if (usandoMock) {
            const novoProduto: Produto = {
                ...prod as Produto,
                id: (prod as Produto).id || crypto.randomUUID(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };
            set((s) => ({ produtos: [novoProduto, ...s.produtos] }));
        } else {
            try {
                // Remove campos que são calculados ou de relação
                const { id, created_at, updated_at, categoria, fornecedor, ...dados } = prod as Produto;
                const novoProduto = await produtosService.criar(dados);
                set((s) => ({ produtos: [novoProduto, ...s.produtos] }));
            } catch (err) {
                console.error('[Estoque] Erro ao criar produto:', err);
                throw err;
            }
        }
    },

    atualizarProduto: async (id, dados) => {
        const { usandoMock } = get();
        if (usandoMock) {
            set((s) => ({
                produtos: s.produtos.map((p) => (p.id === id ? { ...p, ...dados, updated_at: new Date().toISOString() } : p)),
            }));
        } else {
            try {
                const prodAtualizado = await produtosService.atualizar(id, dados);
                set((s) => ({
                    produtos: s.produtos.map((p) => (p.id === id ? prodAtualizado : p)),
                }));
            } catch (err) {
                console.error('[Estoque] Erro ao atualizar produto:', err);
                throw err;
            }
        }
    },

    removerProduto: async (id) => {
        const { usandoMock } = get();
        if (usandoMock) {
            set((s) => ({ produtos: s.produtos.filter((p) => p.id !== id) }));
        } else {
            try {
                await produtosService.remover(id);
                set((s) => ({ produtos: s.produtos.filter((p) => p.id !== id) }));
            } catch (err) {
                console.error('[Estoque] Erro ao remover produto:', err);
                throw err;
            }
        }
    },

    produtosFiltrados: () => {
        const { produtos, busca, filtroCategoria } = get();
        return produtos.filter((p) => {
            const matchBusca = !busca || p.nome.toLowerCase().includes(busca.toLowerCase()) ||
                (p.codigo || '').toLowerCase().includes(busca.toLowerCase()) ||
                (p.codigo_barras || '').includes(busca);
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
