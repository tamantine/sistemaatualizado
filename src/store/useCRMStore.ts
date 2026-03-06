// =============================================
// Store: CRM + Precificação — Integrado com Firebase (Firestore)
//
// COMPORTAMENTO:
//  • Clientes e promoções carregados do Firebase
//  • Firebase vazio → arrays [] → permite cadastros normalmente
//  • Nunca injeta dados de exemplo automaticamente
// =============================================

import { create } from 'zustand';
import type { Cliente, Promocao, TabelaPreco } from '../types';
import { clientesService, promocoesService } from '../services/database';

// ─────────────────────────────────────────────
// Configurações de fidelidade (estático)
// ─────────────────────────────────────────────

export const niveisFidelidade = [
  { nome: 'Bronze',   minPontos: 0,    maxPontos: 499,      cor: '#cd7f32', emoji: '🥉', beneficio: 'Acumula pontos' },
  { nome: 'Prata',    minPontos: 500,  maxPontos: 1999,     cor: '#c0c0c0', emoji: '🥈', beneficio: '5% de desconto' },
  { nome: 'Ouro',     minPontos: 2000, maxPontos: 4999,     cor: '#ffd700', emoji: '🥇', beneficio: '10% de desconto + frete grátis' },
  { nome: 'Diamante', minPontos: 5000, maxPontos: Infinity, cor: '#b9f2ff', emoji: '💎', beneficio: '15% de desconto + ofertas exclusivas' },
];

export function getNivelFidelidade(pontos: number) {
  return (
    niveisFidelidade.find((n) => pontos >= n.minPontos && pontos <= n.maxPontos) ??
    niveisFidelidade[0]
  );
}

// ─────────────────────────────────────────────
// Interface do estado
// ─────────────────────────────────────────────

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

  // Status de conexão
  offlineFallback: boolean;

  // Ações de UI
  setAbaAtiva: (aba: AbaAtiva) => void;
  setBuscaCliente: (b: string) => void;
  setFiltroAtivo: (f: CRMState['filtroAtivo']) => void;
  setClienteSelecionado: (c: Cliente | null) => void;
  setModalCliente: (v: boolean) => void;

  // CRUD — Clientes
  adicionarCliente: (c: Cliente) => Promise<void>;
  atualizarCliente: (id: string, dados: Partial<Cliente>) => Promise<void>;
  removerCliente: (id: string) => Promise<void>;
  adicionarPontos: (id: string, pontos: number) => void;

  // CRUD — Promoções
  setBuscaPromocao: (b: string) => void;
  setFiltroPromocao: (f: CRMState['filtroPromocao']) => void;
  setModalPromocao: (v: boolean) => void;
  setPromocaoEditando: (p: Promocao | null) => void;
  adicionarPromocao: (p: Promocao) => void;
  atualizarPromocao: (id: string, dados: Partial<Promocao>) => void;
  removerPromocao: (id: string) => void;
  togglePromocao: (id: string) => void;

  // CRUD — Tabelas de preço
  setModalTabela: (v: boolean) => void;
  setTabelaEditando: (t: TabelaPreco | null) => void;
  adicionarTabela: (t: TabelaPreco) => void;
  atualizarTabela: (id: string, dados: Partial<TabelaPreco>) => void;
  removerTabela: (id: string) => void;

  // Firebase
  carregarDados: () => Promise<void>;

  // Getters computados
  clientesFiltrados: () => Cliente[];
  promocoesFiltradas: () => Promocao[];
  estatisticasCRM: () => {
    total: number;
    ativos: number;
    comPontos: number;
    totalPontos: number;
    ticketMedio: number;
    topClientes: Cliente[];
  };
}

// ─────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────

export const useCRMStore = create<CRMState>((set, get) => ({
  // Estado inicial — sempre vazio, aguarda Firebase
  clientes: [],
  buscaCliente: '',
  filtroAtivo: 'todos',
  clienteSelecionado: null,
  modalCliente: false,
  promocoes: [],
  buscaPromocao: '',
  filtroPromocao: 'todos',
  modalPromocao: false,
  promocaoEditando: null,
  tabelasPreco: [],
  modalTabela: false,
  tabelaEditando: null,
  abaAtiva: 'clientes',
  offlineFallback: false,

  // ─────────────────────────────────────────
  // Carregamento do Firebase
  // ─────────────────────────────────────────

  carregarDados: async () => {
    try {
      const [clientes, promocoes] = await Promise.all([
        clientesService.listar(),
        promocoesService.listar(),
      ]);
      set({ clientes, promocoes, offlineFallback: false });
      console.log(
        `[CRM] ✅ ${clientes.length} cliente(s) e ${promocoes.length} promoção(ões) carregado(s).`
      );
    } catch (err) {
      console.error('[CRM] ❌ Falha ao carregar dados do Firebase:', err);
      // Mantém arrays vazios — não injeta dados de exemplo
      set({ clientes: [], promocoes: [], offlineFallback: true });
    }
  },

  // ─────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────

  setAbaAtiva: (aba) => set({ abaAtiva: aba }),
  setBuscaCliente: (b) => set({ buscaCliente: b }),
  setFiltroAtivo: (f) => set({ filtroAtivo: f }),
  setClienteSelecionado: (c) => set({ clienteSelecionado: c }),
  setModalCliente: (v) => set({ modalCliente: v }),

  // ─────────────────────────────────────────
  // CRUD — Clientes
  // ─────────────────────────────────────────

  adicionarCliente: async (c) => {
    // Otimista: adiciona imediatamente ao estado local
    const clienteTemp = c.id ? c : { ...c, id: crypto.randomUUID() };
    set((s) => ({ clientes: [clienteTemp, ...s.clientes] }));

    try {
      const { id, created_at, updated_at, ...dados } = c as any;
      const novoCliente = await clientesService.criar(dados);
      if (novoCliente) {
        // Substitui o ID temporário pelo ID real do Firebase
        set((s) => ({
          clientes: s.clientes.map((cli) =>
            cli.id === clienteTemp.id ? { ...cli, id: novoCliente.id } : cli
          ),
        }));
      }
    } catch (err) {
      console.error('[CRM] ❌ Erro ao adicionar cliente no Firebase:', err);
    }
  },

  atualizarCliente: async (id, dados) => {
    set((s) => ({
      clientes: s.clientes.map((c) => (c.id === id ? { ...c, ...dados } : c)),
    }));
    try {
      await clientesService.atualizar(id, dados);
    } catch (err) {
      console.error('[CRM] ❌ Erro ao atualizar cliente:', err);
    }
  },

  removerCliente: async (id) => {
    set((s) => ({ clientes: s.clientes.filter((c) => c.id !== id) }));
    try {
      await clientesService.remover(id);
    } catch (err) {
      console.error('[CRM] ❌ Erro ao remover cliente:', err);
    }
  },

  adicionarPontos: (id, pontos) => {
    set((s) => ({
      clientes: s.clientes.map((c) =>
        c.id === id ? { ...c, pontos_fidelidade: c.pontos_fidelidade + pontos } : c
      ),
    }));
    const cliente = get().clientes.find((c) => c.id === id);
    if (cliente) {
      clientesService
        .atualizar(id, { pontos_fidelidade: cliente.pontos_fidelidade })
        .catch(console.error);
    }
  },

  // ─────────────────────────────────────────
  // CRUD — Promoções
  // ─────────────────────────────────────────

  setBuscaPromocao: (b) => set({ buscaPromocao: b }),
  setFiltroPromocao: (f) => set({ filtroPromocao: f }),
  setModalPromocao: (v) => set({ modalPromocao: v }),
  setPromocaoEditando: (p) => set({ promocaoEditando: p }),

  adicionarPromocao: (p) => set((s) => ({ promocoes: [p, ...s.promocoes] })),
  atualizarPromocao: (id, dados) =>
    set((s) => ({ promocoes: s.promocoes.map((p) => (p.id === id ? { ...p, ...dados } : p)) })),
  removerPromocao: (id) =>
    set((s) => ({ promocoes: s.promocoes.filter((p) => p.id !== id) })),
  togglePromocao: (id) =>
    set((s) => ({
      promocoes: s.promocoes.map((p) => (p.id === id ? { ...p, ativo: !p.ativo } : p)),
    })),

  // ─────────────────────────────────────────
  // CRUD — Tabelas de preço
  // ─────────────────────────────────────────

  setModalTabela: (v) => set({ modalTabela: v }),
  setTabelaEditando: (t) => set({ tabelaEditando: t }),
  adicionarTabela: (t) => set((s) => ({ tabelasPreco: [t, ...s.tabelasPreco] })),
  atualizarTabela: (id, dados) =>
    set((s) => ({
      tabelasPreco: s.tabelasPreco.map((t) => (t.id === id ? { ...t, ...dados } : t)),
    })),
  removerTabela: (id) =>
    set((s) => ({ tabelasPreco: s.tabelasPreco.filter((t) => t.id !== id) })),

  // ─────────────────────────────────────────
  // Getters computados
  // ─────────────────────────────────────────

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
        return (
          c.nome.toLowerCase().includes(q) ||
          (c.cpf_cnpj ?? '').includes(q) ||
          (c.telefone ?? '').includes(q) ||
          (c.email ?? '').toLowerCase().includes(q)
        );
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
        return (
          p.nome.toLowerCase().includes(q) ||
          (p.descricao ?? '').toLowerCase().includes(q)
        );
      });
  },

  estatisticasCRM: () => {
    const clientes = get().clientes;
    const ativos = clientes.filter((c) => c.ativo);
    const comPontos = clientes.filter((c) => c.pontos_fidelidade > 0);
    const totalPontos = clientes.reduce((a, c) => a + c.pontos_fidelidade, 0);
    const topClientes = [...clientes]
      .sort((a, b) => b.pontos_fidelidade - a.pontos_fidelidade)
      .slice(0, 5);
    return {
      total: clientes.length,
      ativos: ativos.length,
      comPontos: comPontos.length,
      totalPontos,
      ticketMedio: 0, // calculado com base nas vendas reais
      topClientes,
    };
  },
}));
