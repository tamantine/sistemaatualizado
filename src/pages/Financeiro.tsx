// =============================================
// Página: Financeiro
// Abas: Resumo, Contas a Pagar, Receber, Fluxo, DRE
// =============================================
import { useFinanceiroStore, fluxoCaixaMock, dreMock } from '../store/useFinanceiroStore';
import { useAppStore } from '../store/useAppStore';
import type { ContaPagar, ContaReceber } from '../types';
import { formatarMoeda, formatarData, bgStatus } from '../utils/formatters';
import Modal from '../components/ui/Modal';
import { useState } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend,
} from 'recharts';
import {
    DollarSign, TrendingUp, TrendingDown, AlertTriangle,
    Search, Plus, CheckCircle, Trash2, Edit3,
    ArrowUpRight, ArrowDownLeft, Wallet, PieChart,
    Calendar, FileText, Filter, CreditCard,
} from 'lucide-react';

// =============================================
// CardMetrica reutilizável
// =============================================
function CardMetrica({ titulo, valor, icone: Icone, cor, subtitulo }: {
    titulo: string; valor: string; icone: React.ElementType; cor: string; subtitulo?: string;
}) {
    return (
        <div className="bg-surface-800/60 backdrop-blur-sm rounded-2xl p-5 border border-surface-700/50 hover:border-surface-600 transition-all group">
            <div className="flex items-start justify-between mb-3">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${cor} flex items-center justify-center shadow-lg`}>
                    <Icone size={20} className="text-white" />
                </div>
            </div>
            <p className="text-2xl font-bold text-surface-100 mb-0.5">{valor}</p>
            <p className="text-xs text-surface-400">{titulo}</p>
            {subtitulo && <p className="text-[10px] text-surface-500 mt-1">{subtitulo}</p>}
        </div>
    );
}

// =============================================
// Aba: Resumo Financeiro
// =============================================
function ResumoFinanceiro() {
    const { totalPagar, totalReceber } = useFinanceiroStore();
    const tp = totalPagar();
    const tr = totalReceber();

    const saldoGeral = (tr.pendente + tr.recebido) - (tp.pendente + tp.pago + tp.atrasado);

    // Dados para gráfico mini fluxo (últimos 7 dias)
    const fluxoRecente = fluxoCaixaMock.slice(-7).map((d) => ({
        dia: new Date(d.data).toLocaleDateString('pt-BR', { weekday: 'short' }),
        entradas: d.entradas,
        saidas: d.saidas,
        saldo: d.entradas - d.saidas,
    }));

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <CardMetrica
                    titulo="A Receber"
                    valor={formatarMoeda(tr.pendente)}
                    icone={ArrowDownLeft}
                    cor="from-green-500 to-emerald-700"
                    subtitulo={`${tr.atrasado > 0 ? `⚠ ${formatarMoeda(tr.atrasado)} em atraso` : '✓ Tudo em dia'}`}
                />
                <CardMetrica
                    titulo="A Pagar"
                    valor={formatarMoeda(tp.pendente)}
                    icone={ArrowUpRight}
                    cor="from-red-500 to-rose-700"
                    subtitulo={`${tp.atrasado > 0 ? `⚠ ${formatarMoeda(tp.atrasado)} em atraso` : '✓ Tudo em dia'}`}
                />
                <CardMetrica
                    titulo="Recebido (mês)"
                    valor={formatarMoeda(tr.recebido)}
                    icone={TrendingUp}
                    cor="from-cyan-500 to-blue-700"
                />
                <CardMetrica
                    titulo="Pago (mês)"
                    valor={formatarMoeda(tp.pago)}
                    icone={TrendingDown}
                    cor="from-amber-500 to-orange-700"
                />
            </div>

            {/* Saldo geral */}
            <div className={`rounded-2xl p-5 border ${saldoGeral >= 0 ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-surface-400">Saldo Projetado</p>
                        <p className={`text-3xl font-bold mt-1 ${saldoGeral >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {formatarMoeda(saldoGeral)}
                        </p>
                    </div>
                    <Wallet size={40} className={`${saldoGeral >= 0 ? 'text-green-500/30' : 'text-red-500/30'}`} />
                </div>
            </div>

            {/* Gráfico de fluxo recente */}
            <div className="bg-surface-800/60 rounded-2xl p-5 border border-surface-700/50">
                <h3 className="text-sm font-bold text-surface-200 mb-4">Fluxo de Caixa — Últimos 7 dias</h3>
                <div className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={fluxoRecente}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="dia" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: 12, fontSize: 12 }}
                                formatter={(value: number | undefined) => [formatarMoeda(value ?? 0)]}
                            />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                            <Bar dataKey="entradas" name="Entradas" fill="#22c55e" radius={[6, 6, 0, 0]} />
                            <Bar dataKey="saidas" name="Saídas" fill="#ef4444" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Alertas rápidos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Próximos vencimentos a pagar */}
                <div className="bg-surface-800/60 rounded-2xl p-5 border border-surface-700/50">
                    <h3 className="text-sm font-bold text-surface-200 mb-3 flex items-center gap-2">
                        <AlertTriangle size={14} className="text-amber-400" /> Próximos Vencimentos (a pagar)
                    </h3>
                    <div className="space-y-2">
                        {useFinanceiroStore.getState().contasPagar
                            .filter((c) => c.status === 'pendente' || c.status === 'atrasado')
                            .sort((a, b) => a.data_vencimento.localeCompare(b.data_vencimento))
                            .slice(0, 5)
                            .map((c) => (
                                <div key={c.id} className="flex items-center justify-between text-xs py-1.5 border-b border-surface-700/30 last:border-0">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-surface-300 truncate">{c.descricao}</p>
                                        <p className="text-surface-500">{formatarData(c.data_vencimento)}</p>
                                    </div>
                                    <div className="text-right ml-3">
                                        <p className="font-semibold text-surface-200">{formatarMoeda(c.valor)}</p>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${bgStatus(c.status)}`}>{c.status}</span>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>

                {/* Próximos recebimentos */}
                <div className="bg-surface-800/60 rounded-2xl p-5 border border-surface-700/50">
                    <h3 className="text-sm font-bold text-surface-200 mb-3 flex items-center gap-2">
                        <Calendar size={14} className="text-cyan-400" /> Próximos Recebimentos
                    </h3>
                    <div className="space-y-2">
                        {useFinanceiroStore.getState().contasReceber
                            .filter((c) => c.status === 'pendente' || c.status === 'atrasado')
                            .sort((a, b) => a.data_vencimento.localeCompare(b.data_vencimento))
                            .slice(0, 5)
                            .map((c) => (
                                <div key={c.id} className="flex items-center justify-between text-xs py-1.5 border-b border-surface-700/30 last:border-0">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-surface-300 truncate">{c.descricao}</p>
                                        <p className="text-surface-500">{formatarData(c.data_vencimento)} • Parcela {c.parcela_atual}/{c.total_parcelas}</p>
                                    </div>
                                    <div className="text-right ml-3">
                                        <p className="font-semibold text-surface-200">{formatarMoeda(c.valor - c.valor_recebido)}</p>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${bgStatus(c.status)}`}>{c.status}</span>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// =============================================
// Tabela de Contas (reutilizável para Pagar/Receber)
// =============================================
function TabelaContas({ tipo }: { tipo: 'pagar' | 'receber' }) {
    const store = useFinanceiroStore();
    const { adicionarToast } = useAppStore();

    const contas = tipo === 'pagar' ? store.contasPagarFiltradas() : store.contasReceberFiltradas();
    const busca = tipo === 'pagar' ? store.buscaPagar : store.buscaReceber;
    const setBusca = tipo === 'pagar' ? store.setBuscaPagar : store.setBuscaReceber;
    const filtroStatus = tipo === 'pagar' ? store.filtroStatusPagar : store.filtroStatusReceber;
    const setFiltroStatus = tipo === 'pagar' ? store.setFiltroStatusPagar : store.setFiltroStatusReceber;
    const setModal = tipo === 'pagar' ? store.setModalContaPagar : store.setModalContaReceber;
    const remover = tipo === 'pagar' ? store.removerContaPagar : store.removerContaReceber;
    const confirmar = tipo === 'pagar' ? store.pagarConta : store.receberConta;

    const statusOpcoes = tipo === 'pagar'
        ? ['todos', 'pendente', 'pago', 'atrasado', 'cancelado'] as const
        : ['todos', 'pendente', 'recebido', 'atrasado', 'cancelado'] as const;

    return (
        <div className="space-y-4 animate-fade-in">
            {/* Barra de ferramentas */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex gap-2 items-center flex-1 w-full sm:w-auto">
                    <div className="relative flex-1 sm:max-w-xs">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
                        <input
                            type="text"
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                            placeholder="Buscar conta..."
                            className="w-full bg-surface-800/50 border border-surface-700 rounded-xl pl-9 pr-3 py-2 text-sm text-surface-200 placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                        />
                    </div>
                    <div className="relative">
                        <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
                        <select
                            value={filtroStatus}
                            onChange={(e) => setFiltroStatus(e.target.value as typeof filtroStatus)}
                            className="bg-surface-800/50 border border-surface-700 rounded-xl pl-8 pr-8 py-2 text-sm text-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500/50 appearance-none cursor-pointer"
                        >
                            {statusOpcoes.map((s) => (
                                <option key={s} value={s}>{s === 'todos' ? 'Todos' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <button
                    onClick={() => { store.setContaEditando(null); setModal(true); }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 shadow-lg shadow-brand-600/25 transition-all"
                >
                    <Plus size={16} /> Nova Conta
                </button>
            </div>

            {/* Tabela */}
            <div className="bg-surface-800/60 rounded-2xl border border-surface-700/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-surface-700/50">
                                <th className="text-left px-4 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">Descrição</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider hidden md:table-cell">
                                    {tipo === 'pagar' ? 'Categoria' : 'Parcela'}
                                </th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">Vencimento</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">Valor</th>
                                <th className="text-center px-4 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">Status</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contas.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-12 text-center text-surface-500">
                                        Nenhuma conta encontrada
                                    </td>
                                </tr>
                            ) : (
                                contas.map((conta) => {
                                    const isPagar = tipo === 'pagar';
                                    const cp = conta as ContaPagar;
                                    const cr = conta as ContaReceber;
                                    return (
                                        <tr key={conta.id} className="border-b border-surface-700/30 last:border-0 hover:bg-surface-700/20 transition-colors">
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-surface-200 truncate max-w-[240px]">{conta.descricao}</p>
                                                {isPagar && cp.documento && (
                                                    <p className="text-xs text-surface-500 flex items-center gap-1 mt-0.5">
                                                        <FileText size={10} /> {cp.documento}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 hidden md:table-cell text-surface-400 text-xs">
                                                {isPagar ? (cp.categoria || '—') : `${cr.parcela_atual}/${cr.total_parcelas}`}
                                            </td>
                                            <td className="px-4 py-3 text-surface-300 text-xs whitespace-nowrap">
                                                {formatarData(conta.data_vencimento)}
                                            </td>
                                            <td className="px-4 py-3 text-right font-semibold text-surface-200">
                                                {formatarMoeda(conta.valor)}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${bgStatus(conta.status)}`}>
                                                    {conta.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    {(conta.status === 'pendente' || conta.status === 'atrasado') && (
                                                        <button
                                                            onClick={() => {
                                                                confirmar(conta.id);
                                                                adicionarToast({
                                                                    tipo: 'sucesso',
                                                                    titulo: `${isPagar ? 'Pagamento' : 'Recebimento'} confirmado`,
                                                                    mensagem: conta.descricao,
                                                                });
                                                            }}
                                                            className="p-1.5 rounded-lg text-green-400 hover:bg-green-500/10 transition-colors"
                                                            title={isPagar ? 'Pagar' : 'Receber'}
                                                        >
                                                            <CheckCircle size={15} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => { store.setContaEditando(conta); setModal(true); }}
                                                        className="p-1.5 rounded-lg text-surface-400 hover:text-surface-200 hover:bg-surface-700 transition-colors"
                                                        title="Editar"
                                                    >
                                                        <Edit3 size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (confirm('Remover esta conta?')) {
                                                                remover(conta.id);
                                                                adicionarToast({ tipo: 'info', titulo: 'Conta removida' });
                                                            }
                                                        }}
                                                        className="p-1.5 rounded-lg text-surface-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                                        title="Excluir"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// =============================================
// Aba: Fluxo de Caixa
// =============================================
function FluxoCaixa() {
    const dados = fluxoCaixaMock.map((d) => ({
        data: new Date(d.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        entradas: d.entradas,
        saidas: d.saidas,
        saldo: d.entradas - d.saidas,
    }));

    const totalEntradas = fluxoCaixaMock.reduce((a, d) => a + d.entradas, 0);
    const totalSaidas = fluxoCaixaMock.reduce((a, d) => a + d.saidas, 0);
    const saldoAcumulado = totalEntradas - totalSaidas;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Cards resumo */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <CardMetrica titulo="Total Entradas (30d)" valor={formatarMoeda(totalEntradas)} icone={ArrowDownLeft} cor="from-green-500 to-emerald-700" />
                <CardMetrica titulo="Total Saídas (30d)" valor={formatarMoeda(totalSaidas)} icone={ArrowUpRight} cor="from-red-500 to-rose-700" />
                <CardMetrica titulo="Saldo Acumulado" valor={formatarMoeda(saldoAcumulado)} icone={Wallet} cor={saldoAcumulado >= 0 ? 'from-cyan-500 to-blue-700' : 'from-red-500 to-rose-700'} />
            </div>

            {/* Gráfico principal */}
            <div className="bg-surface-800/60 rounded-2xl p-5 border border-surface-700/50">
                <h3 className="text-sm font-bold text-surface-200 mb-4">Fluxo de Caixa — Últimos 30 dias</h3>
                <div className="h-[340px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dados}>
                            <defs>
                                <linearGradient id="gradEntrada" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="gradSaida" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="data" tick={{ fill: '#94a3b8', fontSize: 10 }} interval={2} />
                            <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: 12, fontSize: 12 }}
                                formatter={(value: number | undefined) => [formatarMoeda(value ?? 0)]}
                            />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                            <Area type="monotone" dataKey="entradas" name="Entradas" stroke="#22c55e" fillOpacity={1} fill="url(#gradEntrada)" strokeWidth={2} />
                            <Area type="monotone" dataKey="saidas" name="Saídas" stroke="#ef4444" fillOpacity={1} fill="url(#gradSaida)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

// =============================================
// Aba: DRE (Demonstrativo de Resultado)
// =============================================
function DRE() {
    const d = dreMock;
    const margemBruta = ((d.lucro_bruto / d.receita_liquida) * 100).toFixed(1);
    const margemLiquida = ((d.lucro_liquido / d.receita_liquida) * 100).toFixed(1);

    function Linha({ label, valor, destaque, negativo, indent, bold }: {
        label: string; valor: number; destaque?: boolean; negativo?: boolean; indent?: boolean; bold?: boolean;
    }) {
        return (
            <div className={`flex items-center justify-between py-2.5 px-4 ${destaque ? 'bg-surface-700/30 rounded-xl' : 'border-b border-surface-700/20'}`}>
                <span className={`text-sm ${indent ? 'pl-6 text-surface-400' : bold ? 'font-bold text-surface-100' : 'text-surface-300'}`}>
                    {label}
                </span>
                <span className={`text-sm font-semibold ${negativo ? 'text-red-400' : destaque ? 'text-brand-400 font-bold text-base' : 'text-surface-200'}`}>
                    {negativo ? `(${formatarMoeda(Math.abs(valor))})` : formatarMoeda(valor)}
                </span>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Cards de margem */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <CardMetrica titulo="Receita Líquida" valor={formatarMoeda(d.receita_liquida)} icone={DollarSign} cor="from-brand-500 to-brand-700" />
                <CardMetrica titulo="Margem Bruta" valor={`${margemBruta}%`} icone={TrendingUp} cor="from-cyan-500 to-blue-700" />
                <CardMetrica titulo="Margem Líquida" valor={`${margemLiquida}%`} icone={PieChart} cor="from-emerald-500 to-green-700" />
            </div>

            {/* DRE */}
            <div className="bg-surface-800/60 rounded-2xl border border-surface-700/50 overflow-hidden">
                <div className="px-5 py-4 border-b border-surface-700/50">
                    <h3 className="text-sm font-bold text-surface-200">DRE Gerencial — Fevereiro 2026</h3>
                    <p className="text-xs text-surface-500 mt-0.5">Demonstrativo de Resultado do Exercício</p>
                </div>
                <div className="divide-y-0">
                    <Linha label="Receita Bruta de Vendas" valor={d.receita_bruta} bold />
                    <Linha label="(-) Deduções (impostos sobre vendas)" valor={d.deducoes} negativo indent />
                    <Linha label="= Receita Líquida" valor={d.receita_liquida} destaque />

                    <Linha label="(-) Custo da Mercadoria Vendida (CMV)" valor={d.cmv} negativo indent />
                    <Linha label="= Lucro Bruto" valor={d.lucro_bruto} destaque />

                    <div className="px-4 pt-3 pb-1">
                        <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Despesas Operacionais</p>
                    </div>
                    <Linha label="Pessoal" valor={d.despesas_operacionais.pessoal} negativo indent />
                    <Linha label="Aluguel" valor={d.despesas_operacionais.aluguel} negativo indent />
                    <Linha label="Utilidades (água, luz, internet)" valor={d.despesas_operacionais.utilidades} negativo indent />
                    <Linha label="Marketing" valor={d.despesas_operacionais.marketing} negativo indent />
                    <Linha label="Manutenção" valor={d.despesas_operacionais.manutencao} negativo indent />
                    <Linha label="Outros" valor={d.despesas_operacionais.outros} negativo indent />
                    <Linha label="(-) Total Despesas Operacionais" valor={d.total_despesas_op} negativo bold />

                    <Linha label="= Resultado Operacional" valor={d.resultado_operacional} destaque />

                    <Linha label="(-) Despesas Financeiras" valor={d.despesas_financeiras} negativo indent />
                    <Linha label="(+) Receitas Financeiras" valor={d.receitas_financeiras} indent />
                    <Linha label="= Resultado Antes do IR/CSLL" valor={d.resultado_antes_ir} destaque />

                    <Linha label="(-) IR e CSLL" valor={d.ir_csll} negativo indent />

                    <div className={`flex items-center justify-between py-4 px-4 rounded-xl mx-2 mb-2 mt-2 ${d.lucro_liquido >= 0 ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                        <span className="text-base font-bold text-surface-100">= Lucro Líquido</span>
                        <span className={`text-xl font-bold ${d.lucro_liquido >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {formatarMoeda(d.lucro_liquido)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// =============================================
// Modal: Nova Conta (pagar/receber)
// =============================================
function ModalNovaConta({ tipo }: { tipo: 'pagar' | 'receber' }) {
    const store = useFinanceiroStore();
    const { adicionarToast } = useAppStore();
    const isPagar = tipo === 'pagar';
    const aberto = isPagar ? store.modalContaPagar : store.modalContaReceber;
    const fechar = isPagar ? () => store.setModalContaPagar(false) : () => store.setModalContaReceber(false);

    const [descricao, setDescricao] = useState('');
    const [valor, setValor] = useState('');
    const [vencimento, setVencimento] = useState('');
    const [categoria, setCategoria] = useState('Fornecedores');
    const [documento, setDocumento] = useState('');
    const [parcelas, setParcelas] = useState('1');

    const inputClass = "w-full bg-surface-700/50 border border-surface-600 rounded-xl px-4 py-2.5 text-sm text-surface-100 placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all";

    const handleSalvar = () => {
        if (!descricao.trim() || !valor || !vencimento) {
            adicionarToast({ tipo: 'erro', titulo: 'Preencha os campos obrigatórios' });
            return;
        }

        const agora = new Date().toISOString().split('T')[0];

        if (isPagar) {
            store.adicionarContaPagar({
                id: crypto.randomUUID(),
                descricao: descricao.trim(),
                valor: parseFloat(valor),
                valor_pago: 0,
                data_vencimento: vencimento,
                status: 'pendente',
                categoria,
                documento: documento.trim() || undefined,
                created_at: agora,
                updated_at: agora,
            });
        } else {
            store.adicionarContaReceber({
                id: crypto.randomUUID(),
                descricao: descricao.trim(),
                valor: parseFloat(valor),
                valor_recebido: 0,
                data_vencimento: vencimento,
                parcela_atual: 1,
                total_parcelas: parseInt(parcelas) || 1,
                status: 'pendente',
                created_at: agora,
                updated_at: agora,
            });
        }

        adicionarToast({ tipo: 'sucesso', titulo: `Conta ${isPagar ? 'a pagar' : 'a receber'} criada` });
        setDescricao(''); setValor(''); setVencimento(''); setDocumento('');
        fechar();
    };

    return (
        <Modal aberto={aberto} onFechar={fechar} titulo={isPagar ? 'Nova Conta a Pagar' : 'Nova Conta a Receber'} tamanho="md">
            <div className="space-y-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-surface-400">Descrição *</label>
                    <input type="text" value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descrição da conta" className={inputClass} autoFocus />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-surface-400">Valor (R$) *</label>
                        <input type="number" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="0,00" className={inputClass} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-surface-400">Vencimento *</label>
                        <input type="date" value={vencimento} onChange={(e) => setVencimento(e.target.value)} className={inputClass} />
                    </div>
                </div>
                {isPagar ? (
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-surface-400">Categoria</label>
                            <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className={inputClass}>
                                {['Fornecedores', 'Aluguel', 'Utilidades', 'Folha de Pagamento', 'Impostos', 'Manutenção', 'Operacional', 'Serviços', 'Seguros', 'Outros'].map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-surface-400">Documento</label>
                            <input type="text" value={documento} onChange={(e) => setDocumento(e.target.value)} placeholder="NF, boleto..." className={inputClass} />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-surface-400">Parcelas</label>
                        <input type="number" min="1" value={parcelas} onChange={(e) => setParcelas(e.target.value)} className={inputClass} />
                    </div>
                )}

                <button
                    onClick={handleSalvar}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 shadow-lg shadow-brand-600/25 transition-all mt-2"
                >
                    <CheckCircle size={16} /> Salvar
                </button>
            </div>
        </Modal>
    );
}

// =============================================
// Página Principal: Financeiro
// =============================================
const abas = [
    { id: 'resumo' as const, label: 'Resumo', icone: Wallet },
    { id: 'pagar' as const, label: 'Contas a Pagar', icone: ArrowUpRight },
    { id: 'receber' as const, label: 'Contas a Receber', icone: ArrowDownLeft },
    { id: 'fluxo' as const, label: 'Fluxo de Caixa', icone: CreditCard },
    { id: 'dre' as const, label: 'DRE', icone: PieChart },
];

export default function Financeiro() {
    const { abaAtiva, setAbaAtiva } = useFinanceiroStore();

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Cabeçalho */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-surface-100 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-brand-600/25">
                            <DollarSign size={22} className="text-white" />
                        </div>
                        Financeiro
                    </h1>
                    <p className="text-sm text-surface-500 mt-1 ml-[52px]">
                        Gestão de contas, fluxo de caixa e resultados
                    </p>
                </div>
            </div>

            {/* Abas */}
            <div className="flex gap-1 bg-surface-800/60 rounded-2xl p-1.5 border border-surface-700/50 overflow-x-auto">
                {abas.map((aba) => (
                    <button
                        key={aba.id}
                        onClick={() => setAbaAtiva(aba.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${abaAtiva === aba.id
                            ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/25'
                            : 'text-surface-400 hover:text-surface-200 hover:bg-surface-700/50'
                            }`}
                    >
                        <aba.icone size={15} />
                        <span className="hidden sm:inline">{aba.label}</span>
                    </button>
                ))}
            </div>

            {/* Conteúdo da aba */}
            {abaAtiva === 'resumo' && <ResumoFinanceiro />}
            {abaAtiva === 'pagar' && <TabelaContas tipo="pagar" />}
            {abaAtiva === 'receber' && <TabelaContas tipo="receber" />}
            {abaAtiva === 'fluxo' && <FluxoCaixa />}
            {abaAtiva === 'dre' && <DRE />}

            {/* Modais */}
            <ModalNovaConta tipo="pagar" />
            <ModalNovaConta tipo="receber" />
        </div>
    );
}
