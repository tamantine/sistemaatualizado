// =============================================
// Página: Módulo Hortifruti Especializado
// Qualidade, Perdas, Sazonalidade, Rastreabilidade
// =============================================
import { useHortifrutiStore } from '../store/useHortifrutiStore';
import { useAppStore } from '../store/useAppStore';
import { formatarMoeda, formatarData } from '../utils/formatters';
import Modal from '../components/ui/Modal';
import { useState } from 'react';
import {
    Leaf, Plus, ShieldCheck, AlertTriangle,
    Thermometer, Weight, Calendar, MapPin, Truck,
    Sun, TrendingDown, BarChart3,
    CheckCircle, XCircle, AlertCircle, ArrowRight,
    Recycle, Heart, Clock,
} from 'lucide-react';

// =============================================
// Aba: Controle de Qualidade
// =============================================
function AbaQualidade() {
    const store = useHortifrutiStore();
    const stats = store.estatisticas();

    const statusCfg = {
        aprovado: { cor: 'text-green-400 bg-green-500/10 border-green-500/20', icone: CheckCircle, label: '✅ Aprovado' },
        aprovado_restricao: { cor: 'text-amber-400 bg-amber-500/10 border-amber-500/20', icone: AlertCircle, label: '⚠️ Aprovado c/ restrição' },
        rejeitado: { cor: 'text-red-400 bg-red-500/10 border-red-500/20', icone: XCircle, label: '❌ Rejeitado' },
    };

    const classifCor = {
        extra: 'text-green-400 bg-green-500/10',
        primeira: 'text-blue-400 bg-blue-500/10',
        segunda: 'text-amber-400 bg-amber-500/10',
        terceira: 'text-red-400 bg-red-500/10',
    };

    const renderEstrelas = (nota: number) => '★'.repeat(nota) + '☆'.repeat(5 - nota);

    return (
        <div className="space-y-5 animate-fade-in">
            {/* Cards resumo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="bg-surface-800/60 rounded-2xl p-5 border border-surface-700/50">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center shadow-lg mb-3"><ShieldCheck size={20} className="text-white" /></div>
                    <p className="text-2xl font-bold text-surface-100">{stats.totalInspecoes}</p>
                    <p className="text-xs text-surface-400">Inspeções realizadas</p>
                </div>
                <div className="bg-surface-800/60 rounded-2xl p-5 border border-surface-700/50">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center shadow-lg mb-3"><BarChart3 size={20} className="text-white" /></div>
                    <p className="text-2xl font-bold text-green-400">{stats.taxaAprovacao}%</p>
                    <p className="text-xs text-surface-400">Taxa de aprovação</p>
                    <p className="text-[10px] text-surface-500">{stats.aprovados} aprovados · {stats.rejeitados} rejeitados</p>
                </div>
                <div className="bg-surface-800/60 rounded-2xl p-5 border border-surface-700/50">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-700 flex items-center justify-center shadow-lg mb-3"><Thermometer size={20} className="text-white" /></div>
                    <p className="text-2xl font-bold text-surface-100">10.2°C</p>
                    <p className="text-xs text-surface-400">Temp. média recebimento</p>
                </div>
                <div className="bg-surface-800/60 rounded-2xl p-5 border border-surface-700/50">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-500 to-rose-700 flex items-center justify-center shadow-lg mb-3"><Weight size={20} className="text-white" /></div>
                    <p className="text-2xl font-bold text-surface-100">-1.6%</p>
                    <p className="text-xs text-surface-400">Diferença média de peso</p>
                    <p className="text-[10px] text-surface-500">entre comprado e recebido</p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-surface-400">Últimas inspeções de qualidade</p>
                <button onClick={() => store.setModalQualidade(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 shadow-lg shadow-brand-600/25 transition-all">
                    <Plus size={16} /> Nova Inspeção
                </button>
            </div>

            {/* Lista de inspeções */}
            <div className="space-y-3">
                {store.registrosQualidade.map((reg) => {
                    const cfg = statusCfg[reg.status];
                    return (
                        <div key={reg.id} className={`bg-surface-800/60 rounded-2xl border ${cfg.cor.split(' ')[2] || 'border-surface-700/50'} overflow-hidden transition-all hover:shadow-lg`}>
                            <div className="p-5">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-surface-700/50 flex items-center justify-center text-lg">🥬</div>
                                        <div>
                                            <p className="text-sm font-bold text-surface-100">{reg.produto_nome}</p>
                                            <p className="text-xs text-surface-400">Lote: {reg.lote} · {reg.fornecedor_nome}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${classifCor[reg.classificacao]}`}>
                                            {reg.classificacao.charAt(0).toUpperCase() + reg.classificacao.slice(1)}
                                        </span>
                                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${cfg.cor.split(' ').slice(0, 2).join(' ')}`}>
                                            {cfg.label}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div className="bg-surface-700/20 rounded-xl p-2.5 text-center">
                                        <p className="text-xs text-amber-400">{renderEstrelas(reg.aparencia)}</p>
                                        <p className="text-[10px] text-surface-500">Aparência</p>
                                    </div>
                                    <div className="bg-surface-700/20 rounded-xl p-2.5 text-center">
                                        <p className="text-xs text-amber-400">{renderEstrelas(reg.textura)}</p>
                                        <p className="text-[10px] text-surface-500">Textura</p>
                                    </div>
                                    <div className="bg-surface-700/20 rounded-xl p-2.5 text-center">
                                        <p className="text-xs text-amber-400">{renderEstrelas(reg.aroma)}</p>
                                        <p className="text-[10px] text-surface-500">Aroma</p>
                                    </div>
                                    <div className="bg-surface-700/20 rounded-xl p-2.5 text-center">
                                        <p className="text-sm font-bold text-surface-200">{reg.temperatura}°C</p>
                                        <p className="text-[10px] text-surface-500">Temperatura</p>
                                    </div>
                                </div>

                                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-surface-400">
                                    <span className="flex items-center gap-1"><Weight size={12} /> {reg.peso_recebido}kg → {reg.peso_conferido}kg ({reg.diferenca_peso > 0 ? '+' : ''}{reg.diferenca_peso}kg)</span>
                                    <span className="flex items-center gap-1"><Calendar size={12} /> Recebido: {formatarData(reg.data_recebimento)}</span>
                                    <span className="flex items-center gap-1"><Clock size={12} /> Validade: {formatarData(reg.data_validade)}</span>
                                </div>

                                {reg.observacoes && <p className="mt-2 text-xs text-surface-500 italic bg-surface-700/20 rounded-lg px-3 py-2">💡 {reg.observacoes}</p>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// =============================================
// Aba: Controle de Perdas
// =============================================
function AbaPerdas() {
    const store = useHortifrutiStore();
    const stats = store.estatisticas();

    const motivoEmoji: Record<string, string> = {
        vencimento: '📅', avaria: '💔', maturacao: '🍌', transporte: '🚛', armazenamento: '🏭', outro: '❓'
    };
    const motivoLabel: Record<string, string> = {
        vencimento: 'Vencimento', avaria: 'Avaria', maturacao: 'Maturação', transporte: 'Transporte', armazenamento: 'Armazenamento', outro: 'Outro'
    };
    const destinoEmoji: Record<string, string> = {
        descarte: '🗑️', doacao: '🤝', compostagem: '♻️', promocao: '🏷️'
    };
    const destinoLabel: Record<string, string> = {
        descarte: 'Descarte', doacao: 'Doação', compostagem: 'Compostagem', promocao: 'Promoção'
    };

    return (
        <div className="space-y-5 animate-fade-in">
            {/* Resumo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="bg-surface-800/60 rounded-2xl p-5 border border-surface-700/50">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-500 to-rose-700 flex items-center justify-center shadow-lg mb-3"><TrendingDown size={20} className="text-white" /></div>
                    <p className="text-2xl font-bold text-red-400">{formatarMoeda(stats.valorPerdas)}</p>
                    <p className="text-xs text-surface-400">Valor total de perdas</p>
                    <p className="text-[10px] text-surface-500">{stats.totalPerdas} registros este mês</p>
                </div>
                {stats.perdasPorMotivo.slice(0, 3).map((m) => (
                    <div key={m.motivo} className="bg-surface-800/60 rounded-2xl p-5 border border-surface-700/50">
                        <span className="text-2xl">{motivoEmoji[m.motivo]}</span>
                        <p className="text-xl font-bold text-surface-100 mt-2">{m.qtd} ocorrências</p>
                        <p className="text-xs text-surface-400">{motivoLabel[m.motivo]}</p>
                        <p className="text-[10px] text-surface-500">{formatarMoeda(m.valor)} em perdas</p>
                    </div>
                ))}
            </div>

            {/* Distribuição por destino */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-surface-800/60 rounded-2xl border border-surface-700/50 p-5">
                    <h3 className="text-sm font-bold text-surface-200 mb-4 flex items-center gap-2"><Recycle size={14} className="text-green-400" /> Destino das Perdas</h3>
                    <div className="space-y-3">
                        {stats.perdasPorDestino.map((d) => {
                            const pct = stats.totalPerdas > 0 ? Math.round((d.qtd / stats.totalPerdas) * 100) : 0;
                            return (
                                <div key={d.destino} className="flex items-center gap-3">
                                    <span className="text-lg w-8 text-center">{destinoEmoji[d.destino]}</span>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-medium text-surface-200">{destinoLabel[d.destino]}</span>
                                            <span className="text-xs text-surface-400">{d.qtd} ({pct}%)</span>
                                        </div>
                                        <div className="h-2 bg-surface-700/50 rounded-full overflow-hidden">
                                            <div className="h-full rounded-full transition-all duration-700 bg-brand-500" style={{ width: `${Math.max(pct, 5)}%` }} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-surface-800/60 rounded-2xl border border-surface-700/50 p-5">
                    <h3 className="text-sm font-bold text-surface-200 mb-4 flex items-center gap-2"><AlertTriangle size={14} className="text-amber-400" /> Por Motivo</h3>
                    <div className="space-y-3">
                        {stats.perdasPorMotivo.map((m) => {
                            const pct = stats.totalPerdas > 0 ? Math.round((m.qtd / stats.totalPerdas) * 100) : 0;
                            return (
                                <div key={m.motivo} className="flex items-center gap-3">
                                    <span className="text-lg w-8 text-center">{motivoEmoji[m.motivo]}</span>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-medium text-surface-200">{motivoLabel[m.motivo]}</span>
                                            <span className="text-xs text-surface-400">{formatarMoeda(m.valor)}</span>
                                        </div>
                                        <div className="h-2 bg-surface-700/50 rounded-full overflow-hidden">
                                            <div className="h-full rounded-full transition-all duration-700 bg-red-500" style={{ width: `${Math.max(pct, 5)}%` }} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Toolbar + Lista */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-surface-400">Registros de perdas recentes</p>
                <button onClick={() => store.setModalPerda(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 shadow-lg shadow-brand-600/25 transition-all">
                    <Plus size={16} /> Registrar Perda
                </button>
            </div>

            <div className="bg-surface-800/60 rounded-2xl border border-surface-700/50 overflow-hidden">
                <table className="w-full text-sm">
                    <thead><tr className="border-b border-surface-700/50 text-xs text-surface-400">
                        <th className="text-left px-5 py-3">Produto</th>
                        <th className="text-left px-3 py-3 hidden sm:table-cell">Categoria</th>
                        <th className="text-center px-3 py-3">Qtd</th>
                        <th className="text-right px-3 py-3">Valor</th>
                        <th className="text-center px-3 py-3">Motivo</th>
                        <th className="text-center px-3 py-3 hidden md:table-cell">Destino</th>
                        <th className="text-right px-5 py-3 hidden lg:table-cell">Data</th>
                    </tr></thead>
                    <tbody>
                        {store.registrosPerdas.map((p) => (
                            <tr key={p.id} className="border-b border-surface-700/20 hover:bg-surface-700/10 transition-colors">
                                <td className="px-5 py-3 font-medium text-surface-200">{p.produto_nome}</td>
                                <td className="px-3 py-3 text-surface-400 hidden sm:table-cell">{p.categoria}</td>
                                <td className="px-3 py-3 text-center text-surface-300">{p.quantidade} {p.unidade}</td>
                                <td className="px-3 py-3 text-right font-medium text-red-400">{formatarMoeda(p.valor_perda)}</td>
                                <td className="px-3 py-3 text-center"><span title={motivoLabel[p.motivo]}>{motivoEmoji[p.motivo]}</span></td>
                                <td className="px-3 py-3 text-center hidden md:table-cell"><span title={destinoLabel[p.destino]}>{destinoEmoji[p.destino]}</span></td>
                                <td className="px-5 py-3 text-right text-surface-400 hidden lg:table-cell">{formatarData(p.data_registro)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// =============================================
// Aba: Sazonalidade
// =============================================
function AbaSazonalidade() {
    const { sazonalidade, mesSelecionado, setMesSelecionado } = useHortifrutiStore();
    const mesAtual = new Date().getMonth() + 1;
    const infoMes = sazonalidade.find((s) => s.mesNum === mesSelecionado);

    const custoConfig = { baixo: { cor: 'text-green-400 bg-green-500/10', label: '💰 Custo Baixo' }, medio: { cor: 'text-amber-400 bg-amber-500/10', label: '💸 Custo Médio' }, alto: { cor: 'text-red-400 bg-red-500/10', label: '🔥 Custo Alto' } };

    return (
        <div className="space-y-5 animate-fade-in">
            <p className="text-sm text-surface-400">Calendário de safra e recomendações de compra por época do ano</p>

            {/* Calendário circular de meses */}
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2">
                {sazonalidade.map((s) => (
                    <button key={s.mesNum} onClick={() => setMesSelecionado(s.mesNum)}
                        className={`flex flex-col items-center py-3 rounded-xl transition-all ${mesSelecionado === s.mesNum
                            ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/25'
                            : mesAtual === s.mesNum ? 'bg-surface-700/50 text-brand-400 border border-brand-500/30' : 'bg-surface-800/60 text-surface-400 hover:bg-surface-700/50 border border-surface-700/50'}`}>
                        <span className="text-xs font-bold">{s.mes.substring(0, 3)}</span>
                        <span className="text-[10px] mt-0.5">{s.mesNum === mesAtual ? '🔵' : ''}</span>
                    </button>
                ))}
            </div>

            {/* Detalhes do mês */}
            {infoMes && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Produtos da safra */}
                    <div className="lg:col-span-2 bg-surface-800/60 rounded-2xl border border-surface-700/50 p-5">
                        <h3 className="text-sm font-bold text-surface-200 mb-4 flex items-center gap-2">
                            <Sun size={14} className="text-amber-400" /> Produtos em Safra — {infoMes.mes}
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {infoMes.produtos_safra.map((prod) => (
                                <span key={prod} className="text-sm bg-green-500/10 text-green-300 px-3 py-1.5 rounded-lg font-medium border border-green-500/20">
                                    🍃 {prod}
                                </span>
                            ))}
                        </div>
                        <div className="bg-surface-700/20 rounded-xl p-4">
                            <p className="text-xs font-semibold text-surface-200 mb-1">💡 Dica do Mês</p>
                            <p className="text-sm text-surface-300">{infoMes.dica}</p>
                        </div>
                    </div>

                    {/* Indicadores */}
                    <div className="space-y-4">
                        <div className="bg-surface-800/60 rounded-2xl border border-surface-700/50 p-5">
                            <p className="text-xs text-surface-400 mb-2">Qualidade Média</p>
                            <div className="flex items-center gap-2">
                                <p className="text-3xl font-bold text-amber-400">{infoMes.qualidade_media}</p>
                                <div className="text-amber-400 text-sm">{'★'.repeat(Math.round(infoMes.qualidade_media))}{'☆'.repeat(5 - Math.round(infoMes.qualidade_media))}</div>
                            </div>
                        </div>
                        <div className="bg-surface-800/60 rounded-2xl border border-surface-700/50 p-5">
                            <p className="text-xs text-surface-400 mb-2">Custo Médio de Compra</p>
                            <span className={`text-sm px-3 py-1.5 rounded-lg font-medium ${custoConfig[infoMes.custo_medio].cor}`}>
                                {custoConfig[infoMes.custo_medio].label}
                            </span>
                        </div>
                        <div className="bg-surface-800/60 rounded-2xl border border-surface-700/50 p-5">
                            <p className="text-xs text-surface-400 mb-2">Variedade Disponível</p>
                            <p className="text-3xl font-bold text-brand-400">{infoMes.produtos_safra.length}</p>
                            <p className="text-[10px] text-surface-500">produtos na safra</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// =============================================
// Aba: Rastreabilidade
// =============================================
function AbaRastreabilidade() {
    const { rastreios } = useHortifrutiStore();

    return (
        <div className="space-y-5 animate-fade-in">
            <p className="text-sm text-surface-400">Rastreie a origem dos produtos — do campo à mesa</p>

            <div className="space-y-4">
                {rastreios.map((r) => (
                    <div key={r.id} className="bg-surface-800/60 rounded-2xl border border-surface-700/50 overflow-hidden hover:border-surface-600 transition-all">
                        <div className="p-5">
                            {/* Header */}
                            <div className="flex flex-col sm:flex-row items-start justify-between gap-3 mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center shadow-lg">
                                        <Leaf size={22} className="text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-surface-100">{r.produto_nome}</p>
                                        <p className="text-xs text-surface-400 font-mono">{r.codigo_rastreio}</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {r.certificacoes.map((c) => (
                                        <span key={c} className="text-[10px] px-2 py-0.5 rounded-full font-medium text-green-300 bg-green-500/10 border border-green-500/20">{c}</span>
                                    ))}
                                </div>
                            </div>

                            {/* Dados de origem */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                                <div className="bg-surface-700/20 rounded-xl p-3">
                                    <p className="text-[10px] text-surface-500 flex items-center gap-1"><MapPin size={10} /> Origem</p>
                                    <p className="text-xs font-medium text-surface-200 mt-0.5">{r.origem}</p>
                                </div>
                                <div className="bg-surface-700/20 rounded-xl p-3">
                                    <p className="text-[10px] text-surface-500 flex items-center gap-1"><Heart size={10} /> Produtor</p>
                                    <p className="text-xs font-medium text-surface-200 mt-0.5">{r.produtor}</p>
                                </div>
                                <div className="bg-surface-700/20 rounded-xl p-3">
                                    <p className="text-[10px] text-surface-500 flex items-center gap-1"><Truck size={10} /> Transporte</p>
                                    <p className="text-xs font-medium text-surface-200 mt-0.5">{r.temperatura_transporte}</p>
                                </div>
                                <div className="bg-surface-700/20 rounded-xl p-3">
                                    <p className="text-[10px] text-surface-500 flex items-center gap-1"><Calendar size={10} /> Colheita → Loja</p>
                                    <p className="text-xs font-medium text-surface-200 mt-0.5">{formatarData(r.data_colheita)} → {formatarData(r.data_chegada)}</p>
                                </div>
                            </div>

                            {/* Timeline de rastreabilidade */}
                            <div className="border-t border-surface-700/30 pt-4">
                                <p className="text-xs font-semibold text-surface-300 mb-3">📍 Jornada do Produto</p>
                                <div className="relative">
                                    <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-surface-700/50" />
                                    <div className="space-y-3">
                                        {r.etapas.map((etapa, i) => (
                                            <div key={i} className="flex items-start gap-3 relative">
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${etapa.status === 'concluido' ? 'bg-green-500 text-white' : etapa.status === 'atual' ? 'bg-brand-500 text-white animate-pulse' : 'bg-surface-700 text-surface-400'}`}>
                                                    {etapa.status === 'concluido' ? <CheckCircle size={12} /> : etapa.status === 'atual' ? <ArrowRight size={12} /> : <Clock size={12} />}
                                                </div>
                                                <div className="flex-1 pb-1">
                                                    <p className={`text-xs font-medium ${etapa.status === 'atual' ? 'text-brand-300' : etapa.status === 'concluido' ? 'text-surface-200' : 'text-surface-400'}`}>{etapa.evento}</p>
                                                    <p className="text-[10px] text-surface-500">{etapa.local} · {formatarData(etapa.data)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// =============================================
// Modal: Registrar Perda
// =============================================
function ModalPerda() {
    const store = useHortifrutiStore();
    const { adicionarToast } = useAppStore();

    const [produto, setProduto] = useState('');
    const [categoria, setCategoria] = useState('Frutas');
    const [quantidade, setQuantidade] = useState('');
    const [unidade, setUnidade] = useState('KG');
    const [valor, setValor] = useState('');
    const [motivo, setMotivo] = useState<'vencimento' | 'avaria' | 'maturacao' | 'transporte' | 'armazenamento' | 'outro'>('vencimento');
    const [destino, setDestino] = useState<'descarte' | 'doacao' | 'compostagem' | 'promocao'>('descarte');

    const ic = "w-full bg-surface-700/50 border border-surface-600 rounded-xl px-4 py-2.5 text-sm text-surface-100 placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all";

    const salvar = () => {
        if (!produto.trim() || !quantidade || !valor) { adicionarToast({ tipo: 'erro', titulo: 'Preencha os campos obrigatórios' }); return; }
        store.adicionarPerda({ id: crypto.randomUUID(), produto_nome: produto.trim(), categoria, quantidade: parseFloat(quantidade), unidade, valor_perda: parseFloat(valor), motivo, data_registro: new Date().toISOString().split('T')[0], responsavel: 'Operador', destino });
        adicionarToast({ tipo: 'sucesso', titulo: 'Perda registrada' });
        store.setModalPerda(false);
    };

    return (
        <Modal aberto={store.modalPerda} onFechar={() => store.setModalPerda(false)} titulo="Registrar Perda" tamanho="md">
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5"><label className="text-xs font-medium text-surface-400">Produto *</label><input type="text" value={produto} onChange={(e) => setProduto(e.target.value)} placeholder="Nome do produto" className={ic} autoFocus /></div>
                    <div className="space-y-1.5"><label className="text-xs font-medium text-surface-400">Categoria</label>
                        <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className={ic}><option>Frutas</option><option>Verduras</option><option>Legumes</option><option>Orgânicos</option></select>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5"><label className="text-xs font-medium text-surface-400">Quantidade *</label><input type="number" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} placeholder="0" className={ic} /></div>
                    <div className="space-y-1.5"><label className="text-xs font-medium text-surface-400">Unidade</label>
                        <select value={unidade} onChange={(e) => setUnidade(e.target.value)} className={ic}><option>KG</option><option>UN</option><option>CX</option><option>PCT</option></select>
                    </div>
                    <div className="space-y-1.5"><label className="text-xs font-medium text-surface-400">Valor (R$) *</label><input type="number" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="0,00" className={ic} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5"><label className="text-xs font-medium text-surface-400">Motivo</label>
                        <select value={motivo} onChange={(e) => setMotivo(e.target.value as typeof motivo)} className={ic}><option value="vencimento">📅 Vencimento</option><option value="avaria">💔 Avaria</option><option value="maturacao">🍌 Maturação</option><option value="transporte">🚛 Transporte</option><option value="armazenamento">🏭 Armazenamento</option><option value="outro">❓ Outro</option></select>
                    </div>
                    <div className="space-y-1.5"><label className="text-xs font-medium text-surface-400">Destino</label>
                        <select value={destino} onChange={(e) => setDestino(e.target.value as typeof destino)} className={ic}><option value="descarte">🗑️ Descarte</option><option value="doacao">🤝 Doação</option><option value="compostagem">♻️ Compostagem</option><option value="promocao">🏷️ Promoção</option></select>
                    </div>
                </div>
                <button onClick={salvar} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 shadow-lg shadow-brand-600/25 transition-all mt-2">
                    <CheckCircle size={16} /> Registrar
                </button>
            </div>
        </Modal>
    );
}

// =============================================
// Página Principal: Módulo Hortifruti
// =============================================
const abas = [
    { id: 'qualidade' as const, label: 'Qualidade', icone: ShieldCheck },
    { id: 'perdas' as const, label: 'Perdas', icone: TrendingDown },
    { id: 'sazonalidade' as const, label: 'Sazonalidade', icone: Sun },
    { id: 'rastreabilidade' as const, label: 'Rastreabilidade', icone: MapPin },
];

export default function Hortifruti() {
    const { abaAtiva, setAbaAtiva } = useHortifrutiStore();

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-surface-100 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-green-600/25">
                            <Leaf size={22} className="text-white" />
                        </div>
                        Módulo Hortifruti
                    </h1>
                    <p className="text-sm text-surface-500 mt-1 ml-[52px]">Qualidade, perdas, sazonalidade e rastreabilidade</p>
                </div>
            </div>

            <div className="flex gap-1 bg-surface-800/60 rounded-2xl p-1.5 border border-surface-700/50 overflow-x-auto">
                {abas.map((aba) => (
                    <button key={aba.id} onClick={() => setAbaAtiva(aba.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${abaAtiva === aba.id ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/25' : 'text-surface-400 hover:text-surface-200 hover:bg-surface-700/50'}`}>
                        <aba.icone size={15} /><span className="hidden sm:inline">{aba.label}</span>
                    </button>
                ))}
            </div>

            {abaAtiva === 'qualidade' && <AbaQualidade />}
            {abaAtiva === 'perdas' && <AbaPerdas />}
            {abaAtiva === 'sazonalidade' && <AbaSazonalidade />}
            {abaAtiva === 'rastreabilidade' && <AbaRastreabilidade />}

            <ModalPerda />
        </div>
    );
}
