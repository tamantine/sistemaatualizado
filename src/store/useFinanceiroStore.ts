// =============================================
// Store: Financeiro — Integrado com Supabase
// Contas a pagar/receber, fluxo de caixa, DRE
// =============================================
import { create } from 'zustand';
import type { ContaPagar, ContaReceber } from '../types';
import { contasPagarService, contasReceberService } from '../services/supabaseService';

// Dados mock — Contas a Pagar
const contasPagarMock: ContaPagar[] = [
    { id: 'cp-1', fornecedor_id: 'forn-1', descricao: 'Nota fiscal #4521 - CEASA', valor: 3200.00, valor_pago: 0, data_vencimento: '2026-02-20', status: 'pendente', categoria: 'Fornecedores', documento: 'NF-4521', created_at: '2026-02-10', updated_at: '2026-02-10' },
    { id: 'cp-2', fornecedor_id: 'forn-2', descricao: 'Orgânicos - Sítio Boa Vista', valor: 1850.00, valor_pago: 1850.00, data_vencimento: '2026-02-15', data_pagamento: '2026-02-14', status: 'pago', categoria: 'Fornecedores', documento: 'NF-8890', created_at: '2026-02-05', updated_at: '2026-02-14' },
    { id: 'cp-3', descricao: 'Aluguel do ponto comercial', valor: 4500.00, valor_pago: 0, data_vencimento: '2026-02-10', status: 'atrasado', categoria: 'Aluguel', documento: 'BOL-FEV', created_at: '2026-02-01', updated_at: '2026-02-01' },
    { id: 'cp-4', descricao: 'Conta de energia elétrica', valor: 890.00, valor_pago: 0, data_vencimento: '2026-02-25', status: 'pendente', categoria: 'Utilidades', documento: 'ENRG-0225', created_at: '2026-02-08', updated_at: '2026-02-08' },
    { id: 'cp-5', descricao: 'Internet e telefonia', valor: 320.00, valor_pago: 320.00, data_vencimento: '2026-02-05', data_pagamento: '2026-02-04', status: 'pago', categoria: 'Utilidades', documento: 'TEL-0225', created_at: '2026-02-01', updated_at: '2026-02-04' },
    { id: 'cp-6', fornecedor_id: 'forn-3', descricao: 'Frutas importadas - Tropical', valor: 2750.00, valor_pago: 0, data_vencimento: '2026-02-28', status: 'pendente', categoria: 'Fornecedores', documento: 'NF-1234', created_at: '2026-02-12', updated_at: '2026-02-12' },
    { id: 'cp-7', descricao: 'Salários e encargos', valor: 12800.00, valor_pago: 12800.00, data_vencimento: '2026-02-05', data_pagamento: '2026-02-05', status: 'pago', categoria: 'Folha de Pagamento', documento: 'FP-FEV', created_at: '2026-02-01', updated_at: '2026-02-05' },
    { id: 'cp-8', descricao: 'Manutenção das câmaras frias', valor: 650.00, valor_pago: 0, data_vencimento: '2026-03-05', status: 'pendente', categoria: 'Manutenção', documento: 'OS-0042', created_at: '2026-02-15', updated_at: '2026-02-15' },
    { id: 'cp-9', descricao: 'ICMS sobre vendas', valor: 1250.00, valor_pago: 0, data_vencimento: '2026-02-20', status: 'pendente', categoria: 'Impostos', documento: 'ICMS-FEV', created_at: '2026-02-10', updated_at: '2026-02-10' },
    { id: 'cp-10', descricao: 'Seguro do imóvel', valor: 380.00, valor_pago: 380.00, data_vencimento: '2026-02-15', data_pagamento: '2026-02-13', status: 'pago', categoria: 'Seguros', documento: 'SEG-0225', created_at: '2026-02-01', updated_at: '2026-02-13' },
    { id: 'cp-11', descricao: 'Material de limpeza', valor: 450.00, valor_pago: 0, data_vencimento: '2026-02-22', status: 'pendente', categoria: 'Operacional', documento: 'NF-7788', created_at: '2026-02-12', updated_at: '2026-02-12' },
    { id: 'cp-12', descricao: 'Contabilidade mensal', valor: 1200.00, valor_pago: 0, data_vencimento: '2026-03-10', status: 'pendente', categoria: 'Serviços', documento: 'CONT-FEV', created_at: '2026-02-17', updated_at: '2026-02-17' },
];

// Dados mock — Contas a Receber
const contasReceberMock: ContaReceber[] = [
    { id: 'cr-1', cliente_id: 'cli-5', descricao: 'Restaurante Sabor da Terra - Compra semanal', valor: 2800.00, valor_recebido: 0, data_vencimento: '2026-02-20', parcela_atual: 1, total_parcelas: 1, status: 'pendente', created_at: '2026-02-13', updated_at: '2026-02-13' },
    { id: 'cr-2', cliente_id: 'cli-4', descricao: 'Pedro Santos - Crediário', valor: 450.00, valor_recebido: 150.00, data_vencimento: '2026-02-25', parcela_atual: 2, total_parcelas: 3, status: 'pendente', created_at: '2026-01-25', updated_at: '2026-02-10' },
    { id: 'cr-3', cliente_id: 'cli-1', descricao: 'Maria da Silva - Crediário', valor: 180.00, valor_recebido: 180.00, data_vencimento: '2026-02-10', data_recebimento: '2026-02-10', parcela_atual: 3, total_parcelas: 3, status: 'recebido', created_at: '2025-12-10', updated_at: '2026-02-10' },
    { id: 'cr-4', cliente_id: 'cli-5', descricao: 'Restaurante Sabor da Terra - Pedido especial', valor: 1500.00, valor_recebido: 0, data_vencimento: '2026-02-12', parcela_atual: 1, total_parcelas: 1, status: 'atrasado', created_at: '2026-02-05', updated_at: '2026-02-05' },
    { id: 'cr-5', cliente_id: 'cli-2', descricao: 'João Oliveira - Crediário', valor: 320.00, valor_recebido: 0, data_vencimento: '2026-03-01', parcela_atual: 1, total_parcelas: 2, status: 'pendente', created_at: '2026-02-10', updated_at: '2026-02-10' },
    { id: 'cr-6', cliente_id: 'cli-3', descricao: 'Ana Costa - Compra fiado', valor: 95.00, valor_recebido: 95.00, data_vencimento: '2026-02-15', data_recebimento: '2026-02-14', parcela_atual: 1, total_parcelas: 1, status: 'recebido', created_at: '2026-02-08', updated_at: '2026-02-14' },
    { id: 'cr-7', cliente_id: 'cli-4', descricao: 'Pedro Santos - Cesta de frutas premium', valor: 750.00, valor_recebido: 0, data_vencimento: '2026-02-28', parcela_atual: 1, total_parcelas: 2, status: 'pendente', created_at: '2026-02-15', updated_at: '2026-02-15' },
    { id: 'cr-8', cliente_id: 'cli-5', descricao: 'Restaurante Sabor da Terra - Contrato mensal', valor: 5200.00, valor_recebido: 5200.00, data_vencimento: '2026-02-05', data_recebimento: '2026-02-05', parcela_atual: 1, total_parcelas: 1, status: 'recebido', created_at: '2026-02-01', updated_at: '2026-02-05' },
];

// Categorias de despesas
export const categoriasDespesa = [
    'Fornecedores', 'Aluguel', 'Utilidades', 'Folha de Pagamento',
    'Impostos', 'Manutenção', 'Operacional', 'Serviços', 'Seguros', 'Outros',
];

// Fluxo de caixa mock (últimos 30 dias)
export const fluxoCaixaMock = [
    { data: '2026-01-20', entradas: 8200, saidas: 5100 },
    { data: '2026-01-21', entradas: 7100, saidas: 2300 },
    { data: '2026-01-22', entradas: 9500, saidas: 6800 },
    { data: '2026-01-23', entradas: 6800, saidas: 3200 },
    { data: '2026-01-24', entradas: 10200, saidas: 4500 },
    { data: '2026-01-25', entradas: 12800, saidas: 7200 },
    { data: '2026-01-26', entradas: 8900, saidas: 1800 },
    { data: '2026-01-27', entradas: 7600, saidas: 5400 },
    { data: '2026-01-28', entradas: 8300, saidas: 3100 },
    { data: '2026-01-29', entradas: 9100, saidas: 4200 },
    { data: '2026-01-30', entradas: 6500, saidas: 8600 },
    { data: '2026-01-31', entradas: 11400, saidas: 14800 },
    { data: '2026-02-01', entradas: 7800, saidas: 13200 },
    { data: '2026-02-02', entradas: 9200, saidas: 2100 },
    { data: '2026-02-03', entradas: 8400, saidas: 3500 },
    { data: '2026-02-04', entradas: 7100, saidas: 2800 },
    { data: '2026-02-05', entradas: 10500, saidas: 13500 },
    { data: '2026-02-06', entradas: 8900, saidas: 1900 },
    { data: '2026-02-07', entradas: 11200, saidas: 4300 },
    { data: '2026-02-08', entradas: 13500, saidas: 5100 },
    { data: '2026-02-09', entradas: 9800, saidas: 2200 },
    { data: '2026-02-10', entradas: 8100, saidas: 3800 },
    { data: '2026-02-11', entradas: 7400, saidas: 4100 },
    { data: '2026-02-12', entradas: 9600, saidas: 5500 },
    { data: '2026-02-13', entradas: 8800, saidas: 2900 },
    { data: '2026-02-14', entradas: 10100, saidas: 3700 },
    { data: '2026-02-15', entradas: 14200, saidas: 6100 },
    { data: '2026-02-16', entradas: 11800, saidas: 4400 },
    { data: '2026-02-17', entradas: 9500, saidas: 3200 },
    { data: '2026-02-18', entradas: 8456, saidas: 2800 },
];

// DRE Mock
export const dreMock = {
    receita_bruta: 287500,
    deducoes: 12350,
    receita_liquida: 275150,
    cmv: 148200,
    lucro_bruto: 126950,
    despesas_operacionais: {
        pessoal: 38400,
        aluguel: 13500,
        utilidades: 3630,
        marketing: 1200,
        manutencao: 2800,
        outros: 4500,
    },
    total_despesas_op: 64030,
    resultado_operacional: 62920,
    despesas_financeiras: 850,
    receitas_financeiras: 120,
    resultado_antes_ir: 62190,
    ir_csll: 9328,
    lucro_liquido: 52862,
};

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
    contasPagar: contasPagarMock,
    filtroStatusPagar: 'todos',
    buscaPagar: '',
    contasReceber: contasReceberMock,
    filtroStatusReceber: 'todos',
    buscaReceber: '',
    modalContaPagar: false,
    modalContaReceber: false,
    contaEditando: null,
    abaAtiva: 'resumo',
    usandoMock: true,

    carregarDados: async () => {
        try {
            const [contasPagar, contasReceber] = await Promise.all([
                contasPagarService.listar(),
                contasReceberService.listar(),
            ]);
            set({ contasPagar, contasReceber, usandoMock: false });
        } catch {
            console.warn('[Financeiro] Supabase indisponível, usando mock');
            set({ usandoMock: true });
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
            contasPagarService.criar(dados).catch(console.error);
        }
    },
    atualizarContaPagar: (id, dados) => {
        set((s) => ({ contasPagar: s.contasPagar.map((c) => (c.id === id ? { ...c, ...dados } : c)) }));
        if (!get().usandoMock) contasPagarService.atualizar(id, dados).catch(console.error);
    },
    removerContaPagar: (id) => {
        set((s) => ({ contasPagar: s.contasPagar.filter((c) => c.id !== id) }));
        if (!get().usandoMock) contasPagarService.remover(id).catch(console.error);
    },
    pagarConta: (id) => {
        set((s) => ({
            contasPagar: s.contasPagar.map((c) =>
                c.id === id ? { ...c, status: 'pago' as const, valor_pago: c.valor, data_pagamento: new Date().toISOString().split('T')[0] } : c
            ),
        }));
        if (!get().usandoMock) contasPagarService.confirmarPagamento(id).catch(console.error);
    },

    adicionarContaReceber: (c) => {
        set((s) => ({ contasReceber: [c, ...s.contasReceber] }));
        if (!get().usandoMock) {
            const { id, created_at, updated_at, cliente, ...dados } = c;
            contasReceberService.criar(dados).catch(console.error);
        }
    },
    atualizarContaReceber: (id, dados) => {
        set((s) => ({ contasReceber: s.contasReceber.map((c) => (c.id === id ? { ...c, ...dados } : c)) }));
        if (!get().usandoMock) contasReceberService.atualizar(id, dados).catch(console.error);
    },
    removerContaReceber: (id) => {
        set((s) => ({ contasReceber: s.contasReceber.filter((c) => c.id !== id) }));
        if (!get().usandoMock) contasReceberService.remover(id).catch(console.error);
    },
    receberConta: (id) => {
        const conta = get().contasReceber.find((c) => c.id === id);
        set((s) => ({
            contasReceber: s.contasReceber.map((c) =>
                c.id === id ? { ...c, status: 'recebido' as const, valor_recebido: c.valor, data_recebimento: new Date().toISOString().split('T')[0] } : c
            ),
        }));
        if (!get().usandoMock && conta) contasReceberService.confirmarRecebimento(id, conta.valor).catch(console.error);
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
