// =============================================
// Store: CRM + Precificação — Integrado com Supabase
// Clientes, Fidelidade, Promoções, Tabelas de Preço
// =============================================
import { create } from 'zustand';
import type { Cliente, Promocao, TabelaPreco } from '../types';
import { clientesMock } from '../services/mockData';
import { clientesService } from '../services/supabaseService';

// Promoções mock
const promocoesMock: Promocao[] = [
    { id: 'promo-1', nome: 'Terça Verde', descricao: 'Toda terça-feira, 15% em verduras e folhosas', tipo: 'percentual', valor_desconto: 15, quantidade_minima: 1, data_inicio: '2026-02-01', data_fim: '2026-03-31', ativo: true, created_at: '2026-02-01', updated_at: '2026-02-01' },
    { id: 'promo-2', nome: 'Leve 3 Pague 2 — Frutas', descricao: 'Compre 3 unidades de frutas selecionadas e pague apenas 2', tipo: 'quantidade', valor_desconto: 33, quantidade_minima: 3, data_inicio: '2026-02-10', data_fim: '2026-02-28', ativo: true, created_at: '2026-02-10', updated_at: '2026-02-10' },
    { id: 'promo-3', nome: 'Desconto Sábado Orgânico', descricao: 'R$ 1,00 de desconto em cada produto orgânico', tipo: 'valor_fixo', valor_desconto: 1, quantidade_minima: 1, data_inicio: '2026-02-01', data_fim: '2026-04-30', ativo: true, created_at: '2026-02-01', updated_at: '2026-02-01' },
    { id: 'promo-4', nome: 'Happy Hour — Legumes', descricao: 'Após 18h, legumes com 20% de desconto', tipo: 'percentual', valor_desconto: 20, quantidade_minima: 1, data_inicio: '2026-02-15', data_fim: '2026-03-15', ativo: true, created_at: '2026-02-15', updated_at: '2026-02-15' },
    { id: 'promo-5', nome: 'Feira do Inverno', descricao: 'Promoção especial de inverno — 10% em tubérculos', tipo: 'percentual', valor_desconto: 10, quantidade_minima: 2, data_inicio: '2025-06-01', data_fim: '2025-08-31', ativo: false, created_at: '2025-06-01', updated_at: '2025-09-01' },
    { id: 'promo-6', nome: 'Kit Salada Completa', descricao: 'Compre alface + tomate + pepino por apenas R$ 9,99', tipo: 'valor_fixo', valor_desconto: 3.5, quantidade_minima: 3, data_inicio: '2026-02-01', data_fim: '2026-03-31', ativo: true, created_at: '2026-02-01', updated_at: '2026-02-01' },
];

// Tabelas de preço mock
const tabelasPrecoMock: TabelaPreco[] = [
    { id: 'tab-1', nome: 'Varejo Padrão', tipo: 'varejo', descricao: 'Preços padrão para consumidores finais', margem_padrao: 60, ativo: true, created_at: '2026-01-01', updated_at: '2026-02-17' },
    { id: 'tab-2', nome: 'Atacado Restaurantes', tipo: 'atacado', descricao: 'Preços especiais para restaurantes e lanchonetes (acima de 10kg)', margem_padrao: 35, ativo: true, created_at: '2026-01-01', updated_at: '2026-02-17' },
    { id: 'tab-3', nome: 'Clube Fidelidade', tipo: 'fidelidade', descricao: 'Preços exclusivos para clientes com 500+ pontos', margem_padrao: 50, ativo: true, created_at: '2026-01-15', updated_at: '2026-02-17' },
    { id: 'tab-4', nome: 'Sabor da Terra', tipo: 'personalizada', descricao: 'Tabela personalizada para Restaurante Sabor da Terra', margem_padrao: 30, ativo: true, created_at: '2025-12-01', updated_at: '2026-02-17' },
];

// Níveis de fidelidade
export const niveisFidelidade = [
    { nome: 'Bronze', minPontos: 0, maxPontos: 499, cor: '#cd7f32', emoji: '🥉', beneficio: 'Acumula pontos' },
    { nome: 'Prata', minPontos: 500, maxPontos: 1999, cor: '#c0c0c0', emoji: '🥈', beneficio: '5% de desconto' },
    { nome: 'Ouro', minPontos: 2000, maxPontos: 4999, cor: '#ffd700', emoji: '🥇', beneficio: '10% de desconto + frete grátis' },
    { nome: 'Diamante', minPontos: 5000, maxPontos: Infinity, cor: '#b9f2ff', emoji: '💎', beneficio: '15% de desconto + ofertas exclusivas' },
];

export function getNivelFidelidade(pontos: number) {
    return niveisFidelidade.find((n) => pontos >= n.minPontos && pontos <= n.maxPontos) || niveisFidelidade[0];
}

type AbaAtiva = 'clientes' | 'fidelidade' | 'promocoes' | 'tabelas';

interface CRMState {
    // Clientes
    clientes: Cliente[];
    buscaCliente: string;
    filtroAtivo: 'todos' | 'ativos' | 'inativos';
    clienteSelecionado: Cliente | null;
    modalCliente: boolean;
    // Promoções
    promocoes: Promocao[];
    buscaPromocao: string;
    filtroPromocao: 'todos' | 'ativas' | 'inativas';
    modalPromocao: boolean;
    promocaoEditando: Promocao | null;
    // Tabelas de preço
    tabelasPreco: TabelaPreco[];
    modalTabela: boolean;
    tabelaEditando: TabelaPreco | null;
    // Aba
    abaAtiva: AbaAtiva;

    // Ações
    setAbaAtiva: (aba: AbaAtiva) => void;
    setBuscaCliente: (b: string) => void;
    setFiltroAtivo: (f: CRMState['filtroAtivo']) => void;
    setClienteSelecionado: (c: Cliente | null) => void;
    setModalCliente: (v: boolean) => void;
    adicionarCliente: (c: Cliente) => void;
    atualizarCliente: (id: string, dados: Partial<Cliente>) => void;
    removerCliente: (id: string) => void;
    adicionarPontos: (id: string, pontos: number) => void;

    setBuscaPromocao: (b: string) => void;
    setFiltroPromocao: (f: CRMState['filtroPromocao']) => void;
    setModalPromocao: (v: boolean) => void;
    setPromocaoEditando: (p: Promocao | null) => void;
    adicionarPromocao: (p: Promocao) => void;
    atualizarPromocao: (id: string, dados: Partial<Promocao>) => void;
    removerPromocao: (id: string) => void;
    togglePromocao: (id: string) => void;

    setModalTabela: (v: boolean) => void;
    setTabelaEditando: (t: TabelaPreco | null) => void;
    adicionarTabela: (t: TabelaPreco) => void;
    atualizarTabela: (id: string, dados: Partial<TabelaPreco>) => void;
    removerTabela: (id: string) => void;

    // Supabase
    usandoMock: boolean;
    carregarDados: () => Promise<void>;
    // Getters
    clientesFiltrados: () => Cliente[];
    promocoesFiltradas: () => Promocao[];
    estatisticasCRM: () => { total: number; ativos: number; comPontos: number; totalPontos: number; ticketMedio: number; topClientes: Cliente[] };
}

export const useCRMStore = create<CRMState>((set, get) => ({
    clientes: clientesMock,
    buscaCliente: '',
    filtroAtivo: 'todos',
    clienteSelecionado: null,
    modalCliente: false,
    promocoes: promocoesMock,
    buscaPromocao: '',
    filtroPromocao: 'todos',
    modalPromocao: false,
    promocaoEditando: null,
    tabelasPreco: tabelasPrecoMock,
    modalTabela: false,
    tabelaEditando: null,
    abaAtiva: 'clientes',
    usandoMock: true,

    carregarDados: async () => {
        try {
            const clientes = await clientesService.listar();
            set({ clientes, usandoMock: false });
        } catch {
            console.warn('[CRM] Supabase indisponível, usando mock');
            set({ usandoMock: true });
        }
    },

    setAbaAtiva: (aba) => set({ abaAtiva: aba }),
    setBuscaCliente: (b) => set({ buscaCliente: b }),
    setFiltroAtivo: (f) => set({ filtroAtivo: f }),
    setClienteSelecionado: (c) => set({ clienteSelecionado: c }),
    setModalCliente: (v) => set({ modalCliente: v }),
    adicionarCliente: (c) => {
        set((s) => ({ clientes: [c, ...s.clientes] }));
        if (!get().usandoMock) {
            const { id, created_at, updated_at, ...dados } = c;
            clientesService.criar(dados).catch(console.error);
        }
    },
    atualizarCliente: (id, dados) => {
        set((s) => ({ clientes: s.clientes.map((c) => (c.id === id ? { ...c, ...dados } : c)) }));
        if (!get().usandoMock) clientesService.atualizar(id, dados).catch(console.error);
    },
    removerCliente: (id) => {
        set((s) => ({ clientes: s.clientes.filter((c) => c.id !== id) }));
        if (!get().usandoMock) clientesService.remover(id).catch(console.error);
    },
    adicionarPontos: (id, pontos) => {
        set((s) => ({
            clientes: s.clientes.map((c) =>
                c.id === id ? { ...c, pontos_fidelidade: c.pontos_fidelidade + pontos } : c
            ),
        }));
        if (!get().usandoMock) {
            const cliente = get().clientes.find((c) => c.id === id);
            if (cliente) clientesService.atualizar(id, { pontos_fidelidade: cliente.pontos_fidelidade }).catch(console.error);
        }
    },

    setBuscaPromocao: (b) => set({ buscaPromocao: b }),
    setFiltroPromocao: (f) => set({ filtroPromocao: f }),
    setModalPromocao: (v) => set({ modalPromocao: v }),
    setPromocaoEditando: (p) => set({ promocaoEditando: p }),
    adicionarPromocao: (p) => set((s) => ({ promocoes: [p, ...s.promocoes] })),
    atualizarPromocao: (id, dados) =>
        set((s) => ({ promocoes: s.promocoes.map((p) => (p.id === id ? { ...p, ...dados } : p)) })),
    removerPromocao: (id) => set((s) => ({ promocoes: s.promocoes.filter((p) => p.id !== id) })),
    togglePromocao: (id) =>
        set((s) => ({ promocoes: s.promocoes.map((p) => (p.id === id ? { ...p, ativo: !p.ativo } : p)) })),

    setModalTabela: (v) => set({ modalTabela: v }),
    setTabelaEditando: (t) => set({ tabelaEditando: t }),
    adicionarTabela: (t) => set((s) => ({ tabelasPreco: [t, ...s.tabelasPreco] })),
    atualizarTabela: (id, dados) =>
        set((s) => ({ tabelasPreco: s.tabelasPreco.map((t) => (t.id === id ? { ...t, ...dados } : t)) })),
    removerTabela: (id) => set((s) => ({ tabelasPreco: s.tabelasPreco.filter((t) => t.id !== id) })),

    clientesFiltrados: () => {
        const { clientes, buscaCliente, filtroAtivo } = get();
        return clientes
            .filter((c) => {
                if (filtroAtivo === 'ativos') return c.ativo;
                if (filtroAtivo === 'inativos') return !c.ativo;
                return true;
            })
            .filter((c) => {
                if (!buscaCliente) return true;
                const q = buscaCliente.toLowerCase();
                return c.nome.toLowerCase().includes(q) || (c.cpf_cnpj || '').includes(q) || (c.telefone || '').includes(q) || (c.email || '').toLowerCase().includes(q);
            });
    },

    promocoesFiltradas: () => {
        const { promocoes, buscaPromocao, filtroPromocao } = get();
        return promocoes
            .filter((p) => {
                if (filtroPromocao === 'ativas') return p.ativo;
                if (filtroPromocao === 'inativas') return !p.ativo;
                return true;
            })
            .filter((p) => {
                if (!buscaPromocao) return true;
                const q = buscaPromocao.toLowerCase();
                return p.nome.toLowerCase().includes(q) || (p.descricao || '').toLowerCase().includes(q);
            });
    },

    estatisticasCRM: () => {
        const clientes = get().clientes;
        const ativos = clientes.filter((c) => c.ativo);
        const comPontos = clientes.filter((c) => c.pontos_fidelidade > 0);
        const totalPontos = clientes.reduce((a, c) => a + c.pontos_fidelidade, 0);
        const topClientes = [...clientes].sort((a, b) => b.pontos_fidelidade - a.pontos_fidelidade).slice(0, 5);
        return {
            total: clientes.length,
            ativos: ativos.length,
            comPontos: comPontos.length,
            totalPontos,
            ticketMedio: 47.50,
            topClientes,
        };
    },
}));
