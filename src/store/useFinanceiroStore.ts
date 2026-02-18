// =============================================
// Store: Financeiro — Integrado com Supabase
// Contas a pagar/receber, fluxo de caixa, DRE
// =============================================
import { create } from 'zustand';
import type { ContaPagar, ContaReceber } from '../types';
import { contasPagarService, contasReceberService } from '../services/supabaseService';

// =============================================
// MOCK: Fluxo de Caixa — últimos 30 dias
// =============================================
function gerarFluxoCaixa() {
    const dias: { data: string; entradas: number; saidas: number }[] = [];
    for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dias.push({
            data: d.toISOString().split('T')[0],
            entradas: Math.round(800 + Math.random() * 1200),
            saidas: Math.round(500 + Math.random() * 700),
        });
    }
    return dias;
}

export const fluxoCaixaMock = gerarFluxoCaixa();

// =============================================
// MOCK: DRE — Demonstrativo de Resultado
// =============================================
const receitaBruta = 48750.00;
const deducoes = 2925.00;
const receitaLiquida = receitaBruta - deducoes;
const cmv = 22345.50;
const lucroBruto = receitaLiquida - cmv;
const despesasOp = {
    pessoal: 8500.00,
    aluguel: 2200.00,
    utilidades: 850.00,
    marketing: 600.00,
    manutencao: 320.00,
    outros: 480.00,
};
const totalDespesasOp = Object.values(despesasOp).reduce((a, b) => a + b, 0);
const resultadoOperacional = lucroBruto - totalDespesasOp;
const despesasFinanceiras = 380.00;
const receitasFinanceiras = 120.00;
const resultadoAntesIR = resultadoOperacional - despesasFinanceiras + receitasFinanceiras;
const irCsll = resultadoAntesIR > 0 ? resultadoAntesIR * 0.15 : 0;

export const dreMock = {
    receita_bruta: receitaBruta,
    deducoes,
    receita_liquida: receitaLiquida,
    cmv,
    lucro_bruto: lucroBruto,
    despesas_operacionais: despesasOp,
    total_despesas_op: totalDespesasOp,
    resultado_operacional: resultadoOperacional,
    despesas_financeiras: despesasFinanceiras,
    receitas_financeiras: receitasFinanceiras,
    resultado_antes_ir: resultadoAntesIR,
    ir_csll: irCsll,
    lucro_liquido: resultadoAntesIR - irCsll,
};

// Categorias de despesas
export const categoriasDespesa = [
    'Fornecedores', 'Aluguel', 'Utilidades', 'Folha de Pagamento',
    'Impostos', 'Manutenção', 'Operacional', 'Serviços', 'Seguros', 'Outros',
];

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
    // Modal
    modalContaPagar: boolean;
    modalContaReceber: boolean;
    contaEditando: ContaPagar | ContaReceber | null;
    // Aba ativa
    abaAtiva: 'resumo' | 'pagar' | 'receber' | 'fluxo' | 'dre';
    // Ações
    setAbaAtiva: (aba: FinanceiroState['abaAtiva']) => void;
    setFiltroStatusPagar: (s: StatusConta) => void;
    setFiltroStatusReceber: (s: StatusConta) => void;
    setBuscaPagar: (b: string) => void;
    setBuscaReceber: (b: string) => void;
    setModalContaPagar: (v: boolean) => void;
    setModalContaReceber: (v: boolean) => void;
    setContaEditando: (c: ContaPagar | ContaReceber | null) => void;
    adicionarContaPagar: (c: ContaPagar) => void;
    atualizarContaPagar: (id: string, dados: Partial<ContaPagar>) => void;
    removerContaPagar: (id: string) => void;
    pagarConta: (id: string) => void;
    adicionarContaReceber: (c: ContaReceber) => void;
    atualizarContaReceber: (id: string, dados: Partial<ContaReceber>) => void;
    removerContaReceber: (id: string) => void;
    receberConta: (id: string) => void;
    // Supabase
    usandoMock: boolean;
    carregarDados: () => Promise<void>;
    // Getters
    contasPagarFiltradas: () => ContaPagar[];
    contasReceberFiltradas: () => ContaReceber[];
    totalPagar: () => { pendente: number; atrasado: number; pago: number };
    totalReceber: () => { pendente: number; atrasado: number; recebido: number };
}

export const useFinanceiroStore = create<FinanceiroState>((set, get) => ({
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
    usandoMock: false,

    carregarDados: async () => {
        try {
            const [contasPagar, contasReceber] = await Promise.all([
                contasPagarService.listar(),
                contasReceberService.listar(),
            ]);
            set({ contasPagar, contasReceber });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao carregar dados financeiros';
            console.error('[Financeiro] Erro ao carregar dados do Supabase (usando dados vazios):', message);
            // Não lança exceção: mantém arrays vazios para não quebrar a UI
        }
    },

    setAbaAtiva: (aba) => set({ abaAtiva: aba }),
    setFiltroStatusPagar: (s) => set({ filtroStatusPagar: s }),
    setFiltroStatusReceber: (s) => set({ filtroStatusReceber: s }),
    setBuscaPagar: (b) => set({ buscaPagar: b }),
    setBuscaReceber: (b) => set({ buscaReceber: b }),
    setModalContaPagar: (v) => set({ modalContaPagar: v }),
    setModalContaReceber: (v) => set({ modalContaReceber: v }),
    setContaEditando: (c) => set({ contaEditando: c }),

    adicionarContaPagar: (c) => {
        set((s) => ({ contasPagar: [c, ...s.contasPagar] }));
        if (!get().usandoMock) {
            const { id, created_at, updated_at, fornecedor, ...dados } = c;
            // Sincronizar com Supabase, mas não bloquear UI
            contasPagarService.criar(dados).catch(err => {
                console.error('[Financeiro] Erro ao criar conta a pagar:', err);
            });
        }
    },
    atualizarContaPagar: (id, dados) => {
        set((s) => ({ contasPagar: s.contasPagar.map((c) => (c.id === id ? { ...c, ...dados } : c)) }));
        if (!get().usandoMock) {
            contasPagarService.atualizar(id, dados).catch(err => {
                console.error('[Financeiro] Erro ao atualizar conta a pagar:', err);
            });
        }
    },
    removerContaPagar: (id) => {
        set((s) => ({ contasPagar: s.contasPagar.filter((c) => c.id !== id) }));
        if (!get().usandoMock) {
            contasPagarService.remover(id).catch(err => {
                console.error('[Financeiro] Erro ao remover conta a pagar:', err);
            });
        }
    },
    pagarConta: (id) => {
        set((s) => ({
            contasPagar: s.contasPagar.map((c) =>
                c.id === id ? { ...c, status: 'pago' as const, valor_pago: c.valor, data_pagamento: new Date().toISOString().split('T')[0] } : c
            ),
        }));
        if (!get().usandoMock) {
            contasPagarService.confirmarPagamento(id).catch(err => {
                console.error('[Financeiro] Erro ao confirmar pagamento:', err);
            });
        }
    },

    adicionarContaReceber: (c) => {
        set((s) => ({ contasReceber: [c, ...s.contasReceber] }));
        if (!get().usandoMock) {
            const { id, created_at, updated_at, cliente, ...dados } = c;
            contasReceberService.criar(dados).catch(err => {
                console.error('[Financeiro] Erro ao criar conta a receber:', err);
            });
        }
    },
    atualizarContaReceber: (id, dados) => {
        set((s) => ({ contasReceber: s.contasReceber.map((c) => (c.id === id ? { ...c, ...dados } : c)) }));
        if (!get().usandoMock) {
            contasReceberService.atualizar(id, dados).catch(err => {
                console.error('[Financeiro] Erro ao atualizar conta a receber:', err);
            });
        }
    },
    removerContaReceber: (id) => {
        set((s) => ({ contasReceber: s.contasReceber.filter((c) => c.id !== id) }));
        if (!get().usandoMock) {
            contasReceberService.remover(id).catch(err => {
                console.error('[Financeiro] Erro ao remover conta a receber:', err);
            });
        }
    },
    receberConta: (id) => {
        const conta = get().contasReceber.find((c) => c.id === id);
        set((s) => ({
            contasReceber: s.contasReceber.map((c) =>
                c.id === id ? { ...c, status: 'recebido' as const, valor_recebido: c.valor, data_recebimento: new Date().toISOString().split('T')[0] } : c
            ),
        }));
        if (!get().usandoMock && conta) {
            contasReceberService.confirmarRecebimento(id, conta.valor).catch(err => {
                console.error('[Financeiro] Erro ao confirmar recebimento:', err);
            });
        }
    },

    contasPagarFiltradas: () => {
        const { contasPagar, filtroStatusPagar, buscaPagar } = get();
        return contasPagar
            .filter((c) => filtroStatusPagar === 'todos' || c.status === filtroStatusPagar)
            .filter((c) => {
                if (!buscaPagar) return true;
                const q = buscaPagar.toLowerCase();
                return c.descricao.toLowerCase().includes(q) || (c.categoria || '').toLowerCase().includes(q) || (c.documento || '').toLowerCase().includes(q);
            });
    },

    contasReceberFiltradas: () => {
        const { contasReceber, filtroStatusReceber, buscaReceber } = get();
        return contasReceber
            .filter((c) => filtroStatusReceber === 'todos' || c.status === filtroStatusReceber)
            .filter((c) => {
                if (!buscaReceber) return true;
                const q = buscaReceber.toLowerCase();
                return c.descricao.toLowerCase().includes(q) || (c.observacoes || '').toLowerCase().includes(q);
            });
    },

    totalPagar: () => {
        const contas = get().contasPagar;
        return {
            pendente: contas.filter((c) => c.status === 'pendente').reduce((a, c) => a + c.valor, 0),
            atrasado: contas.filter((c) => c.status === 'atrasado').reduce((a, c) => a + c.valor, 0),
            pago: contas.filter((c) => c.status === 'pago').reduce((a, c) => a + c.valor_pago, 0),
        };
    },

    totalReceber: () => {
        const contas = get().contasReceber;
        return {
            pendente: contas.filter((c) => c.status === 'pendente').reduce((a, c) => a + (c.valor - c.valor_recebido), 0),
            atrasado: contas.filter((c) => c.status === 'atrasado').reduce((a, c) => a + (c.valor - c.valor_recebido), 0),
            recebido: contas.filter((c) => c.status === 'recebido').reduce((a, c) => a + c.valor_recebido, 0),
        };
    },
}));
