// =============================================
// Store: Financeiro — Integrado com Firebase (Firestore)
//
// COMPORTAMENTO:
//  • Contas a pagar/receber carregadas do Firebase
//  • Firebase vazio → arrays [] → permite cadastros normalmente
//  • Fluxo de Caixa e DRE calculados a partir dos dados reais
//  • Em caso de erro → arrays [] sem dados de exemplo
// =============================================

import { create } from 'zustand';
import type { ContaPagar, ContaReceber } from '../types';
import { contasPagarService, contasReceberService } from '../services/database';

// ─────────────────────────────────────────────
// Fluxo de Caixa — estrutura vazia (últimos 30 dias)
// Exportado para compatibilidade com Financeiro.tsx
// Será substituído por dados reais quando o sistema
// implementar o cálculo a partir das vendas do Firebase.
// ─────────────────────────────────────────────

function gerarEstruturFluxoCaixa() {
  const dias: { data: string; entradas: number; saidas: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dias.push({
      data: d.toISOString().split('T')[0],
      entradas: 0,
      saidas: 0,
    });
  }
  return dias;
}

/** Estrutura de fluxo de caixa (valores zerados — sem dados de demonstração) */
export const fluxoCaixaMock = gerarEstruturFluxoCaixa();

/** Estrutura de DRE zerada — sem dados de demonstração */
export const dreMock = {
  receita_bruta: 0,
  deducoes: 0,
  receita_liquida: 0,
  cmv: 0,
  lucro_bruto: 0,
  despesas_operacionais: {
    pessoal: 0,
    aluguel: 0,
    utilidades: 0,
    marketing: 0,
    manutencao: 0,
    outros: 0,
  },
  total_despesas_op: 0,
  resultado_operacional: 0,
  despesas_financeiras: 0,
  receitas_financeiras: 0,
  resultado_antes_ir: 0,
  ir_csll: 0,
  lucro_liquido: 0,
};

// ─────────────────────────────────────────────
// Categorias de despesas (estático — configuração)
// ─────────────────────────────────────────────

export const categoriasDespesa = [
  'Fornecedores',
  'Aluguel',
  'Utilidades',
  'Folha de Pagamento',
  'Impostos',
  'Manutenção',
  'Operacional',
  'Serviços',
  'Seguros',
  'Outros',
];

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

type StatusConta = 'todos' | 'pendente' | 'pago' | 'recebido' | 'atrasado' | 'cancelado';

interface FinanceiroState {
  // Contas a pagar
  contasPagar: ContaPagar[];
  filtroStatusPagar: StatusConta;
  buscaPagar: string;
  // Contas a receber
  contasReceber: ContaReceber[];
  filtroStatusReceber: StatusConta;
  buscaReceber: string;
  // Modais
  modalContaPagar: boolean;
  modalContaReceber: boolean;
  contaEditando: ContaPagar | ContaReceber | null;
  // Aba ativa
  abaAtiva: 'resumo' | 'pagar' | 'receber' | 'fluxo' | 'dre';
  // Status de conexão
  offlineFallback: boolean;

  // Ações de UI
  setAbaAtiva: (aba: FinanceiroState['abaAtiva']) => void;
  setFiltroStatusPagar: (s: StatusConta) => void;
  setFiltroStatusReceber: (s: StatusConta) => void;
  setBuscaPagar: (b: string) => void;
  setBuscaReceber: (b: string) => void;
  setModalContaPagar: (v: boolean) => void;
  setModalContaReceber: (v: boolean) => void;
  setContaEditando: (c: ContaPagar | ContaReceber | null) => void;

  // CRUD — Contas a pagar
  adicionarContaPagar: (c: ContaPagar) => void;
  atualizarContaPagar: (id: string, dados: Partial<ContaPagar>) => void;
  removerContaPagar: (id: string) => void;
  pagarConta: (id: string) => void;

  // CRUD — Contas a receber
  adicionarContaReceber: (c: ContaReceber) => void;
  atualizarContaReceber: (id: string, dados: Partial<ContaReceber>) => void;
  removerContaReceber: (id: string) => void;
  receberConta: (id: string) => void;

  // Firebase
  carregarDados: () => Promise<void>;

  // Getters computados
  contasPagarFiltradas: () => ContaPagar[];
  contasReceberFiltradas: () => ContaReceber[];
  totalPagar: () => { pendente: number; atrasado: number; pago: number };
  totalReceber: () => { pendente: number; atrasado: number; recebido: number };
}

// ─────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────

export const useFinanceiroStore = create<FinanceiroState>((set, get) => ({
  // Estado inicial — sempre vazio, aguarda Firebase
  contasPagar: [],
  filtroStatusPagar: 'todos',
  buscaPagar: '',
  contasReceber: [],
  filtroStatusReceber: 'todos',
  buscaReceber: '',
  modalContaPagar: false,
  modalContaReceber: false,
  contaEditando: null,
  abaAtiva: 'resumo',
  offlineFallback: false,

  // ─────────────────────────────────────────
  // Carregamento do Firebase
  // ─────────────────────────────────────────

  carregarDados: async () => {
    try {
      const [contasPagar, contasReceber] = await Promise.all([
        contasPagarService.listar(),
        contasReceberService.listar(),
      ]);
      set({ contasPagar, contasReceber, offlineFallback: false });
      console.log(
        `[Financeiro] ✅ ${contasPagar.length} conta(s) a pagar e ` +
        `${contasReceber.length} conta(s) a receber carregada(s).`
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('[Financeiro] ❌ Falha ao carregar dados do Firebase:', message);
      // Mantém arrays vazios — não injeta dados de exemplo
      set({ contasPagar: [], contasReceber: [], offlineFallback: true });
    }
  },

  // ─────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────

  setAbaAtiva: (aba) => set({ abaAtiva: aba }),
  setFiltroStatusPagar: (s) => set({ filtroStatusPagar: s }),
  setFiltroStatusReceber: (s) => set({ filtroStatusReceber: s }),
  setBuscaPagar: (b) => set({ buscaPagar: b }),
  setBuscaReceber: (b) => set({ buscaReceber: b }),
  setModalContaPagar: (v) => set({ modalContaPagar: v }),
  setModalContaReceber: (v) => set({ modalContaReceber: v }),
  setContaEditando: (c) => set({ contaEditando: c }),

  // ─────────────────────────────────────────
  // CRUD — Contas a pagar
  // ─────────────────────────────────────────

  adicionarContaPagar: (c) => {
    set((s) => ({ contasPagar: [c, ...s.contasPagar] }));
    const { id, created_at, updated_at, fornecedor, ...dados } = c as any;
    contasPagarService.criar(dados).catch((err) => {
      console.error('[Financeiro] Erro ao criar conta a pagar:', err);
    });
  },

  atualizarContaPagar: (id, dados) => {
    set((s) => ({
      contasPagar: s.contasPagar.map((c) => (c.id === id ? { ...c, ...dados } : c)),
    }));
    contasPagarService.atualizar(id, dados).catch((err) => {
      console.error('[Financeiro] Erro ao atualizar conta a pagar:', err);
    });
  },

  removerContaPagar: (id) => {
    set((s) => ({ contasPagar: s.contasPagar.filter((c) => c.id !== id) }));
    contasPagarService.remover(id).catch((err) => {
      console.error('[Financeiro] Erro ao remover conta a pagar:', err);
    });
  },

  pagarConta: (id) => {
    set((s) => ({
      contasPagar: s.contasPagar.map((c) =>
        c.id === id
          ? {
              ...c,
              status: 'pago' as const,
              valor_pago: c.valor,
              data_pagamento: new Date().toISOString().split('T')[0],
            }
          : c
      ),
    }));
    contasPagarService.confirmarPagamento(id).catch((err) => {
      console.error('[Financeiro] Erro ao confirmar pagamento:', err);
    });
  },

  // ─────────────────────────────────────────
  // CRUD — Contas a receber
  // ─────────────────────────────────────────

  adicionarContaReceber: (c) => {
    set((s) => ({ contasReceber: [c, ...s.contasReceber] }));
    const { id, created_at, updated_at, cliente, ...dados } = c as any;
    contasReceberService.criar(dados).catch((err) => {
      console.error('[Financeiro] Erro ao criar conta a receber:', err);
    });
  },

  atualizarContaReceber: (id, dados) => {
    set((s) => ({
      contasReceber: s.contasReceber.map((c) => (c.id === id ? { ...c, ...dados } : c)),
    }));
    contasReceberService.atualizar(id, dados).catch((err) => {
      console.error('[Financeiro] Erro ao atualizar conta a receber:', err);
    });
  },

  removerContaReceber: (id) => {
    set((s) => ({ contasReceber: s.contasReceber.filter((c) => c.id !== id) }));
    contasReceberService.remover(id).catch((err) => {
      console.error('[Financeiro] Erro ao remover conta a receber:', err);
    });
  },

  receberConta: (id) => {
    const conta = get().contasReceber.find((c) => c.id === id);
    set((s) => ({
      contasReceber: s.contasReceber.map((c) =>
        c.id === id
          ? {
              ...c,
              status: 'recebido' as const,
              valor_recebido: c.valor,
              data_recebimento: new Date().toISOString().split('T')[0],
            }
          : c
      ),
    }));
    if (conta) {
      contasReceberService.confirmarRecebimento(id, conta.valor).catch((err) => {
        console.error('[Financeiro] Erro ao confirmar recebimento:', err);
      });
    }
  },

  // ─────────────────────────────────────────
  // Getters computados
  // ─────────────────────────────────────────

  contasPagarFiltradas: () => {
    const { contasPagar, filtroStatusPagar, buscaPagar } = get();
    return contasPagar
      .filter((c) => filtroStatusPagar === 'todos' || c.status === filtroStatusPagar)
      .filter((c) => {
        if (!buscaPagar) return true;
        const q = buscaPagar.toLowerCase();
        return (
          c.descricao.toLowerCase().includes(q) ||
          (c.categoria ?? '').toLowerCase().includes(q) ||
          (c.documento ?? '').toLowerCase().includes(q)
        );
      });
  },

  contasReceberFiltradas: () => {
    const { contasReceber, filtroStatusReceber, buscaReceber } = get();
    return contasReceber
      .filter((c) => filtroStatusReceber === 'todos' || c.status === filtroStatusReceber)
      .filter((c) => {
        if (!buscaReceber) return true;
        const q = buscaReceber.toLowerCase();
        return (
          c.descricao.toLowerCase().includes(q) ||
          (c.observacoes ?? '').toLowerCase().includes(q)
        );
      });
  },

  totalPagar: () => {
    const contas = get().contasPagar;
    return {
      pendente: contas
        .filter((c) => c.status === 'pendente')
        .reduce((a, c) => a + c.valor, 0),
      atrasado: contas
        .filter((c) => c.status === 'atrasado')
        .reduce((a, c) => a + c.valor, 0),
      pago: contas
        .filter((c) => c.status === 'pago')
        .reduce((a, c) => a + c.valor_pago, 0),
    };
  },

  totalReceber: () => {
    const contas = get().contasReceber;
    return {
      pendente: contas
        .filter((c) => c.status === 'pendente')
        .reduce((a, c) => a + (c.valor - c.valor_recebido), 0),
      atrasado: contas
        .filter((c) => c.status === 'atrasado')
        .reduce((a, c) => a + (c.valor - c.valor_recebido), 0),
      recebido: contas
        .filter((c) => c.status === 'recebido')
        .reduce((a, c) => a + c.valor_recebido, 0),
    };
  },
}));
