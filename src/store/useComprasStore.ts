// =============================================
// Store: Compras & Fornecedores — Integrado com Supabase
// Pedidos de compra, fornecedores, cotações, recebimento
// =============================================
import { create } from 'zustand';
import type { Fornecedor, PedidoCompra } from '../types';
import { fornecedoresService, pedidosCompraService } from '../services/supabaseService';

// Cotações tipagem
export interface Cotacao {
    id: string;
    titulo: string;
    fornecedor_ids: string[];
    itens: { produto_id: string; quantidade: number; produto_nome?: string }[];
    status: 'aberta' | 'respondida' | 'fechada' | 'cancelada';
    melhor_preco?: number;
    data_limite: string;
    created_at: string;
    respostas?: CotacaoResposta[];
}

export interface CotacaoResposta {
    fornecedor_id: string;
    fornecedor_nome: string;
    valor_total: number;
    prazo_entrega: string;
    condicao_pagamento: string;
    data_resposta: string;
}

type AbaCompras = 'pedidos' | 'fornecedores' | 'cotacoes';

interface ComprasState {
    abaAtiva: AbaCompras;
    // Pedidos
    pedidos: PedidoCompra[];
    buscaPedido: string;
    filtroPedido: 'todos' | 'pendente' | 'aprovado' | 'recebido' | 'cancelado';
    pedidoSelecionado: PedidoCompra | null;
    modalPedido: boolean;
    // Fornecedores
    fornecedores: Fornecedor[];
    buscaFornecedor: string;
    fornecedorSelecionado: Fornecedor | null;
    modalFornecedor: boolean;
    // Cotações
    cotacoes: Cotacao[];
    cotacaoSelecionada: Cotacao | null;
    modalCotacao: boolean;

    // Ações
    setAbaAtiva: (aba: AbaCompras) => void;
    setBuscaPedido: (b: string) => void;
    setFiltroPedido: (f: ComprasState['filtroPedido']) => void;
    setPedidoSelecionado: (p: PedidoCompra | null) => void;
    setModalPedido: (v: boolean) => void;
    adicionarPedido: (p: PedidoCompra) => void;
    atualizarPedido: (id: string, dados: Partial<PedidoCompra>) => void;
    removerPedido: (id: string) => void;
    receberPedido: (id: string) => void;
    aprovarPedido: (id: string) => void;

    setBuscaFornecedor: (b: string) => void;
    setFornecedorSelecionado: (f: Fornecedor | null) => void;
    setModalFornecedor: (v: boolean) => void;
    adicionarFornecedor: (f: Fornecedor) => void;
    atualizarFornecedor: (id: string, dados: Partial<Fornecedor>) => void;
    removerFornecedor: (id: string) => void;

    setCotacaoSelecionada: (c: Cotacao | null) => void;
    setModalCotacao: (v: boolean) => void;
    adicionarCotacao: (c: Cotacao) => void;
    fecharCotacao: (id: string) => void;

    // Getters
    pedidosFiltrados: () => PedidoCompra[];
    // Supabase
    usandoMock: boolean;
    carregarDados: () => Promise<void>;
    fornecedoresFiltrados: () => Fornecedor[];
    estatisticas: () => { totalPedidos: number; pendentes: number; valorTotal: number; fornecedoresAtivos: number; cotacoesAbertas: number; economiaCotacoes: number };
}

export const useComprasStore = create<ComprasState>((set, get) => ({
    abaAtiva: 'pedidos',
    pedidos: [],
    buscaPedido: '',
    filtroPedido: 'todos',
    pedidoSelecionado: null,
    modalPedido: false,
    fornecedores: [],
    buscaFornecedor: '',
    fornecedorSelecionado: null,
    modalFornecedor: false,
    cotacoes: [],
    cotacaoSelecionada: null,
    modalCotacao: false,
    usandoMock: false,

    carregarDados: async () => {
        try {
            const [fornecedores, pedidos] = await Promise.all([
                fornecedoresService.listar(),
                pedidosCompraService.listar(),
            ]);
            set({ fornecedores, pedidos });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao carregar dados de compras';
            console.error('[Compras] Erro ao carregar dados do Supabase (usando dados vazios):', message);
            // Não lança exceção: mantém arrays vazios para não quebrar a UI
        }
    },

    setAbaAtiva: (aba) => set({ abaAtiva: aba }),
    setBuscaPedido: (b) => set({ buscaPedido: b }),
    setFiltroPedido: (f) => set({ filtroPedido: f }),
    setPedidoSelecionado: (p) => set({ pedidoSelecionado: p }),
    setModalPedido: (v) => set({ modalPedido: v }),
    adicionarPedido: (p) => set((s) => ({ pedidos: [p, ...s.pedidos] })),
    atualizarPedido: (id, dados) =>
        set((s) => ({ pedidos: s.pedidos.map((p) => (p.id === id ? { ...p, ...dados } : p)) })),
    removerPedido: (id) => set((s) => ({ pedidos: s.pedidos.filter((p) => p.id !== id) })),
    receberPedido: (id) =>
        set((s) => ({
            pedidos: s.pedidos.map((p) =>
                p.id === id ? { ...p, status: 'recebido' as const, data_recebimento: new Date().toISOString().split('T')[0], updated_at: new Date().toISOString().split('T')[0] } : p
            ),
        })),
    aprovarPedido: (id) =>
        set((s) => ({
            pedidos: s.pedidos.map((p) =>
                p.id === id ? { ...p, status: 'aprovado' as const, updated_at: new Date().toISOString().split('T')[0] } : p
            ),
        })),

    setBuscaFornecedor: (b) => set({ buscaFornecedor: b }),
    setFornecedorSelecionado: (f) => set({ fornecedorSelecionado: f }),
    setModalFornecedor: (v) => set({ modalFornecedor: v }),
    adicionarFornecedor: (f) => {
        set((s) => ({ fornecedores: [f, ...s.fornecedores] }));
        if (!get().usandoMock) {
            const { id, created_at, updated_at, ...dados } = f;
            fornecedoresService.criar(dados).catch(console.error);
        }
    },
    atualizarFornecedor: (id, dados) => {
        set((s) => ({ fornecedores: s.fornecedores.map((f) => (f.id === id ? { ...f, ...dados } : f)) }));
        if (!get().usandoMock) fornecedoresService.atualizar(id, dados).catch(console.error);
    },
    removerFornecedor: (id) => {
        set((s) => ({ fornecedores: s.fornecedores.filter((f) => f.id !== id) }));
        if (!get().usandoMock) fornecedoresService.remover(id).catch(console.error);
    },

    setCotacaoSelecionada: (c) => set({ cotacaoSelecionada: c }),
    setModalCotacao: (v) => set({ modalCotacao: v }),
    adicionarCotacao: (c) => set((s) => ({ cotacoes: [c, ...s.cotacoes] })),
    fecharCotacao: (id) =>
        set((s) => ({ cotacoes: s.cotacoes.map((c) => (c.id === id ? { ...c, status: 'fechada' as const } : c)) })),

    pedidosFiltrados: () => {
        const { pedidos, buscaPedido, filtroPedido } = get();
        return pedidos
            .filter((p) => filtroPedido === 'todos' || p.status === filtroPedido)
            .filter((p) => {
                if (!buscaPedido) return true;
                const q = buscaPedido.toLowerCase();
                return `#${p.numero_pedido}`.includes(q) || (p.fornecedor?.razao_social || '').toLowerCase().includes(q) || (p.observacoes || '').toLowerCase().includes(q);
            });
    },

    fornecedoresFiltrados: () => {
        const { fornecedores, buscaFornecedor } = get();
        if (!buscaFornecedor) return fornecedores;
        const q = buscaFornecedor.toLowerCase();
        return fornecedores.filter((f) =>
            f.razao_social.toLowerCase().includes(q) || (f.nome_fantasia || '').toLowerCase().includes(q) || (f.cnpj_cpf || '').includes(q) || (f.telefone || '').includes(q)
        );
    },

    estatisticas: () => {
        const { pedidos, fornecedores, cotacoes } = get();
        return {
            totalPedidos: pedidos.length,
            pendentes: pedidos.filter((p) => p.status === 'pendente' || p.status === 'aprovado').length,
            valorTotal: pedidos.filter((p) => p.status !== 'cancelado').reduce((a, p) => a + p.valor_total, 0),
            fornecedoresAtivos: fornecedores.filter((f) => f.ativo).length,
            cotacoesAbertas: cotacoes.filter((c) => c.status === 'aberta' || c.status === 'respondida').length,
            economiaCotacoes: 1250.00,
        };
    },
}));
