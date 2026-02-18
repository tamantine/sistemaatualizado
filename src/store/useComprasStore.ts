// =============================================
// Store: Compras & Fornecedores — Integrado com Supabase
// Pedidos de compra, fornecedores, cotações, recebimento
// =============================================
import { create } from 'zustand';
import type { Fornecedor, PedidoCompra } from '../types';
import { fornecedoresMock, produtosMock } from '../services/mockData';
import { fornecedoresService, pedidosCompraService } from '../services/supabaseService';

// Cotação mock
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

// Pedidos de compra mock
const pedidosCompraMock: PedidoCompra[] = [
    {
        id: 'pc-1', fornecedor_id: 'forn-1', numero_pedido: 1001, status: 'recebido', valor_total: 2450.00,
        data_previsao: '2026-02-15', data_recebimento: '2026-02-15', observacoes: 'Entrega no horário',
        created_at: '2026-02-12', updated_at: '2026-02-15',
        fornecedor: fornecedoresMock[0],
        itens: [
            { id: 'pci-1', pedido_id: 'pc-1', produto_id: 'prod-1', quantidade: 50, preco_unitario: 8.90, subtotal: 445.00, created_at: '2026-02-12', produto: produtosMock[0] },
            { id: 'pci-2', pedido_id: 'pc-1', produto_id: 'prod-2', quantidade: 80, preco_unitario: 5.50, subtotal: 440.00, created_at: '2026-02-12', produto: produtosMock[1] },
            { id: 'pci-3', pedido_id: 'pc-1', produto_id: 'prod-3', quantidade: 100, preco_unitario: 3.20, subtotal: 320.00, created_at: '2026-02-12', produto: produtosMock[2] },
        ],
    },
    {
        id: 'pc-2', fornecedor_id: 'forn-2', numero_pedido: 1002, status: 'aprovado', valor_total: 1890.00,
        data_previsao: '2026-02-20', observacoes: 'Frutas da estação',
        created_at: '2026-02-16', updated_at: '2026-02-16',
        fornecedor: fornecedoresMock[1],
        itens: [
            { id: 'pci-4', pedido_id: 'pc-2', produto_id: 'prod-4', quantidade: 60, preco_unitario: 12.50, subtotal: 750.00, created_at: '2026-02-16', produto: produtosMock[3] },
            { id: 'pci-5', pedido_id: 'pc-2', produto_id: 'prod-5', quantidade: 40, preco_unitario: 14.90, subtotal: 596.00, created_at: '2026-02-16', produto: produtosMock[4] },
        ],
    },
    {
        id: 'pc-3', fornecedor_id: 'forn-3', numero_pedido: 1003, status: 'pendente', valor_total: 3200.00,
        data_previsao: '2026-02-22',
        created_at: '2026-02-18', updated_at: '2026-02-18',
        fornecedor: fornecedoresMock[2],
        itens: [
            { id: 'pci-6', pedido_id: 'pc-3', produto_id: 'prod-1', quantidade: 100, preco_unitario: 8.50, subtotal: 850.00, created_at: '2026-02-18', produto: produtosMock[0] },
            { id: 'pci-7', pedido_id: 'pc-3', produto_id: 'prod-6', quantidade: 80, preco_unitario: 6.90, subtotal: 552.00, created_at: '2026-02-18', produto: produtosMock[5] },
        ],
    },
    {
        id: 'pc-4', fornecedor_id: 'forn-1', numero_pedido: 1004, status: 'recebido', valor_total: 1560.00,
        data_previsao: '2026-02-10', data_recebimento: '2026-02-10',
        created_at: '2026-02-07', updated_at: '2026-02-10',
        fornecedor: fornecedoresMock[0],
    },
    {
        id: 'pc-5', fornecedor_id: 'forn-2', numero_pedido: 1005, status: 'cancelado', valor_total: 780.00,
        data_previsao: '2026-02-14', observacoes: 'Fornecedor sem estoque',
        created_at: '2026-02-11', updated_at: '2026-02-13',
        fornecedor: fornecedoresMock[1],
    },
];

// Cotações mock
const cotacoesMock: Cotacao[] = [
    {
        id: 'cot-1', titulo: 'Cotação Frutas Semana 08', fornecedor_ids: ['forn-1', 'forn-2', 'forn-3'],
        itens: [
            { produto_id: 'prod-1', quantidade: 100, produto_nome: 'Banana Prata' },
            { produto_id: 'prod-4', quantidade: 50, produto_nome: 'Manga Tommy' },
        ],
        status: 'respondida', melhor_preco: 1850.00, data_limite: '2026-02-19', created_at: '2026-02-16',
        respostas: [
            { fornecedor_id: 'forn-1', fornecedor_nome: 'Sítio Boa Vista', valor_total: 1850.00, prazo_entrega: '2 dias', condicao_pagamento: '30 dias', data_resposta: '2026-02-17' },
            { fornecedor_id: 'forn-2', fornecedor_nome: 'Distribuidora Frutas Brasil', valor_total: 2100.00, prazo_entrega: '1 dia', condicao_pagamento: '15 dias', data_resposta: '2026-02-17' },
            { fornecedor_id: 'forn-3', fornecedor_nome: 'Ceasa Central', valor_total: 1920.00, prazo_entrega: '3 dias', condicao_pagamento: '7 dias', data_resposta: '2026-02-18' },
        ],
    },
    {
        id: 'cot-2', titulo: 'Cotação Verduras/Legumes', fornecedor_ids: ['forn-1', 'forn-3'],
        itens: [
            { produto_id: 'prod-2', quantidade: 80, produto_nome: 'Tomate Italiano' },
            { produto_id: 'prod-3', quantidade: 120, produto_nome: 'Alface Crespa' },
            { produto_id: 'prod-6', quantidade: 60, produto_nome: 'Cebola Roxa' },
        ],
        status: 'aberta', data_limite: '2026-02-21', created_at: '2026-02-18',
    },
];

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
    pedidos: pedidosCompraMock,
    buscaPedido: '',
    filtroPedido: 'todos',
    pedidoSelecionado: null,
    modalPedido: false,
    fornecedores: fornecedoresMock,
    buscaFornecedor: '',
    fornecedorSelecionado: null,
    modalFornecedor: false,
    cotacoes: cotacoesMock,
    cotacaoSelecionada: null,
    modalCotacao: false,
    usandoMock: true,

    carregarDados: async () => {
        try {
            const [fornecedores, pedidos] = await Promise.all([
                fornecedoresService.listar(),
                pedidosCompraService.listar(),
            ]);
            set({ fornecedores, pedidos, usandoMock: false });
        } catch {
            console.warn('[Compras] Supabase indisponível, usando mock');
            set({ usandoMock: true });
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
