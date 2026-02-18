// =============================================
// Componente: ModalSangria — Sangria e Suprimento
// Versão profissional com histórico, validações e Supabase
// =============================================
import { useState } from 'react';
import { usePDVStore } from '../../store/usePDVStore';
import { useAppStore } from '../../store/useAppStore';
import Modal from '../ui/Modal';
import { formatarMoeda } from '../../utils/formatters';
import {
    ArrowDownLeft, ArrowUpRight, DollarSign,
    FileText, Loader2, History, TrendingDown, TrendingUp,
    AlertTriangle, CheckCircle,
} from 'lucide-react';

type TipoOperacao = 'sangria' | 'suprimento';

// Motivos pré-definidos para sangria
const motivosSangria = [
    'Pagamento de fornecedor',
    'Depósito bancário',
    'Pagamento de despesas',
    'Fundo de troco retirado',
    'Outro',
];

// Motivos pré-definidos para suprimento
const motivosSuprimento = [
    'Reforço de troco',
    'Abertura adicional',
    'Transferência de outro caixa',
    'Suprimento inicial',
    'Outro',
];

// Valores rápidos para seleção
const valoresRapidos = [10, 20, 50, 100, 200, 500];

export default function ModalSangria() {
    const { modalSangria, setModalSangria, caixa, movimentacoes, registrarMovimentacao } = usePDVStore();
    const { adicionarToast } = useAppStore();

    const [tipo, setTipo] = useState<TipoOperacao>('sangria');
    const [valorInput, setValorInput] = useState('');
    const [motivo, setMotivo] = useState('');
    const [motivoCustom, setMotivoCustom] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [abaAtiva, setAbaAtiva] = useState<'operacao' | 'historico'>('operacao');

    const valorNumerico = parseFloat(valorInput.replace(',', '.')) || 0;
    const motivoFinal = motivo === 'Outro' ? motivoCustom.trim() : motivo;
    const saldoDinheiro = caixa?.valor_dinheiro || 0;
    const saldoInsuficiente = tipo === 'sangria' && valorNumerico > saldoDinheiro;

    const fechar = () => {
        setModalSangria(false);
        setValorInput('');
        setMotivo('');
        setMotivoCustom('');
        setAbaAtiva('operacao');
    };

    const adicionarValorRapido = (v: number) => {
        const atual = parseFloat(valorInput.replace(',', '.')) || 0;
        setValorInput((atual + v).toFixed(2).replace('.', ','));
    };

    const handleConfirmar = async () => {
        if (valorNumerico <= 0) {
            adicionarToast({ tipo: 'erro', titulo: 'Valor inválido', mensagem: 'Informe um valor maior que zero.' });
            return;
        }
        if (!motivoFinal) {
            adicionarToast({ tipo: 'erro', titulo: 'Motivo obrigatório', mensagem: 'Selecione ou informe o motivo.' });
            return;
        }
        if (saldoInsuficiente) {
            adicionarToast({
                tipo: 'erro',
                titulo: 'Saldo insuficiente',
                mensagem: `Não é possível retirar ${formatarMoeda(valorNumerico)}. Saldo disponível: ${formatarMoeda(saldoDinheiro)}.`,
            });
            return;
        }

        setCarregando(true);
        try {
            await registrarMovimentacao(tipo, valorNumerico, motivoFinal);
            adicionarToast({
                tipo: 'sucesso',
                titulo: tipo === 'sangria' ? '💸 Sangria registrada' : '💰 Suprimento registrado',
                mensagem: `${formatarMoeda(valorNumerico)} — ${motivoFinal}`,
            });
            setValorInput('');
            setMotivo('');
            setMotivoCustom('');
            // Mostra o histórico após confirmar
            setAbaAtiva('historico');
        } catch {
            adicionarToast({ tipo: 'erro', titulo: 'Erro ao registrar', mensagem: 'Tente novamente.' });
        } finally {
            setCarregando(false);
        }
    };

    const inputClass = "w-full bg-surface-700/50 border border-surface-600 rounded-xl px-4 py-3 text-sm text-surface-100 placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all";

    // Movimentações da sessão atual (últimas 10)
    const movRecentes = movimentacoes.slice(0, 10);

    return (
        <Modal
            aberto={modalSangria}
            onFechar={fechar}
            titulo="Sangria / Suprimento"
            tamanho="sm"
        >
            <div className="space-y-4">
                {/* Saldo atual */}
                {caixa && (
                    <div className="flex gap-3">
                        <div className="flex-1 text-center py-3 bg-surface-700/40 rounded-xl border border-surface-600/50">
                            <p className="text-[10px] text-surface-500 uppercase tracking-wider mb-1">Dinheiro no Caixa</p>
                            <p className={`text-lg font-bold ${saldoDinheiro <= 0 ? 'text-red-400' : 'text-green-400'}`}>
                                {formatarMoeda(saldoDinheiro)}
                            </p>
                        </div>
                        <div className="flex-1 text-center py-3 bg-surface-700/40 rounded-xl border border-surface-600/50">
                            <p className="text-[10px] text-surface-500 uppercase tracking-wider mb-1">Total Sangrias</p>
                            <p className="text-lg font-bold text-red-400">{formatarMoeda(caixa.valor_sangria)}</p>
                        </div>
                        <div className="flex-1 text-center py-3 bg-surface-700/40 rounded-xl border border-surface-600/50">
                            <p className="text-[10px] text-surface-500 uppercase tracking-wider mb-1">Total Suprimentos</p>
                            <p className="text-lg font-bold text-blue-400">{formatarMoeda(caixa.valor_suprimento)}</p>
                        </div>
                    </div>
                )}

                {/* Abas */}
                <div className="flex gap-1 bg-surface-800 rounded-xl p-1">
                    <button
                        onClick={() => setAbaAtiva('operacao')}
                        className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${abaAtiva === 'operacao' ? 'bg-surface-600 text-surface-100' : 'text-surface-400 hover:text-surface-200'}`}
                    >
                        Nova Operação
                    </button>
                    <button
                        onClick={() => setAbaAtiva('historico')}
                        className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${abaAtiva === 'historico' ? 'bg-surface-600 text-surface-100' : 'text-surface-400 hover:text-surface-200'}`}
                    >
                        <History size={12} />
                        Histórico
                        {movRecentes.length > 0 && (
                            <span className="w-4 h-4 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center">
                                {movRecentes.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* === ABA OPERAÇÃO === */}
                {abaAtiva === 'operacao' && (
                    <div className="space-y-4">
                        {/* Toggle Sangria / Suprimento */}
                        <div className="flex gap-2 bg-surface-800 rounded-xl p-1">
                            <button
                                onClick={() => { setTipo('sangria'); setMotivo(''); setValorInput(''); }}
                                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${tipo === 'sangria'
                                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/25'
                                    : 'text-surface-400 hover:text-red-400'
                                    }`}
                            >
                                <TrendingDown size={15} /> Sangria
                            </button>
                            <button
                                onClick={() => { setTipo('suprimento'); setMotivo(''); setValorInput(''); }}
                                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${tipo === 'suprimento'
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/25'
                                    : 'text-surface-400 hover:text-blue-400'
                                    }`}
                            >
                                <TrendingUp size={15} /> Suprimento
                            </button>
                        </div>

                        {/* Descrição da operação */}
                        <p className="text-xs text-surface-500 text-center">
                            {tipo === 'sangria'
                                ? '⬆️ Retirada de dinheiro do caixa para fins externos'
                                : '⬇️ Adição de dinheiro ao caixa para reforço'}
                        </p>

                        {/* Valor */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-surface-400 uppercase tracking-wider flex items-center gap-1.5">
                                <DollarSign size={12} /> Valor (R$)
                            </label>
                            <input
                                type="text"
                                inputMode="decimal"
                                value={valorInput}
                                onChange={(e) => {
                                    const v = e.target.value.replace(/[^0-9,]/g, '');
                                    setValorInput(v);
                                }}
                                placeholder="0,00"
                                className={`${inputClass} text-lg font-bold ${saldoInsuficiente ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' : ''}`}
                                autoFocus
                            />

                            {/* Alerta de saldo insuficiente */}
                            {saldoInsuficiente && (
                                <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                                    <AlertTriangle size={13} />
                                    Saldo insuficiente. Disponível: {formatarMoeda(saldoDinheiro)}
                                </div>
                            )}

                            {/* Botões de valor rápido */}
                            <div className="grid grid-cols-6 gap-1.5">
                                {valoresRapidos.map((v) => (
                                    <button
                                        key={v}
                                        onClick={() => adicionarValorRapido(v)}
                                        className="py-1.5 rounded-lg bg-surface-700/50 border border-surface-600 text-xs font-medium text-surface-300 hover:bg-surface-600 hover:text-surface-100 transition-colors"
                                    >
                                        +{v}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setValorInput('')}
                                className="text-[10px] text-surface-500 hover:text-surface-300 transition-colors"
                            >
                                Limpar valor
                            </button>
                        </div>

                        {/* Motivo — seleção rápida */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-surface-400 uppercase tracking-wider flex items-center gap-1.5">
                                <FileText size={12} /> Motivo
                            </label>
                            <div className="grid grid-cols-1 gap-1.5">
                                {(tipo === 'sangria' ? motivosSangria : motivosSuprimento).map((m) => (
                                    <button
                                        key={m}
                                        onClick={() => setMotivo(m)}
                                        className={`text-left px-3 py-2 rounded-lg text-sm transition-colors border ${motivo === m
                                            ? tipo === 'sangria'
                                                ? 'bg-red-600/20 border-red-500/50 text-red-300'
                                                : 'bg-blue-600/20 border-blue-500/50 text-blue-300'
                                            : 'bg-surface-700/30 border-surface-600/50 text-surface-400 hover:border-surface-500 hover:text-surface-200'
                                            }`}
                                    >
                                        {motivo === m && <CheckCircle size={12} className="inline mr-1.5" />}
                                        {m}
                                    </button>
                                ))}
                            </div>

                            {/* Campo de motivo livre quando "Outro" selecionado */}
                            {motivo === 'Outro' && (
                                <input
                                    type="text"
                                    value={motivoCustom}
                                    onChange={(e) => setMotivoCustom(e.target.value)}
                                    placeholder="Descreva o motivo..."
                                    className={inputClass}
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && handleConfirmar()}
                                />
                            )}
                        </div>

                        {/* Resumo da operação */}
                        {valorNumerico > 0 && motivoFinal && (
                            <div className={`p-3 rounded-xl border text-sm ${tipo === 'sangria'
                                ? 'bg-red-500/5 border-red-500/20 text-red-300'
                                : 'bg-blue-500/5 border-blue-500/20 text-blue-300'
                                }`}>
                                <p className="font-semibold">
                                    {tipo === 'sangria' ? '⬆️ Sangria de' : '⬇️ Suprimento de'}{' '}
                                    <span className="font-bold">{formatarMoeda(valorNumerico)}</span>
                                </p>
                                <p className="text-xs opacity-75 mt-0.5">Motivo: {motivoFinal}</p>
                                {tipo === 'sangria' && (
                                    <p className="text-xs opacity-75">
                                        Saldo após: {formatarMoeda(Math.max(0, saldoDinheiro - valorNumerico))}
                                    </p>
                                )}
                                {tipo === 'suprimento' && (
                                    <p className="text-xs opacity-75">
                                        Saldo após: {formatarMoeda(saldoDinheiro + valorNumerico)}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Botão confirmar */}
                        <button
                            onClick={handleConfirmar}
                            disabled={carregando || valorNumerico <= 0 || !motivoFinal || saldoInsuficiente}
                            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed ${tipo === 'sangria'
                                ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-red-600/25'
                                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 shadow-blue-600/25'
                                }`}
                        >
                            {carregando ? (
                                <><Loader2 size={16} className="animate-spin" /> Registrando...</>
                            ) : tipo === 'sangria' ? (
                                <><ArrowUpRight size={16} /> Confirmar Sangria</>
                            ) : (
                                <><ArrowDownLeft size={16} /> Confirmar Suprimento</>
                            )}
                        </button>
                    </div>
                )}

                {/* === ABA HISTÓRICO === */}
                {abaAtiva === 'historico' && (
                    <div className="space-y-2">
                        {movRecentes.length === 0 ? (
                            <div className="text-center py-10 text-surface-500">
                                <History size={36} className="mx-auto mb-3 opacity-30" />
                                <p className="text-sm">Nenhuma movimentação nesta sessão</p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                                {movRecentes.map((mov) => (
                                    <div
                                        key={mov.id}
                                        className={`flex items-center gap-3 p-3 rounded-xl border ${mov.tipo === 'sangria'
                                            ? 'bg-red-500/5 border-red-500/20'
                                            : 'bg-blue-500/5 border-blue-500/20'
                                            }`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${mov.tipo === 'sangria' ? 'bg-red-500/20' : 'bg-blue-500/20'}`}>
                                            {mov.tipo === 'sangria'
                                                ? <TrendingDown size={14} className="text-red-400" />
                                                : <TrendingUp size={14} className="text-blue-400" />
                                            }
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-surface-200 truncate">{mov.motivo}</p>
                                            <p className="text-[10px] text-surface-500">
                                                {new Date(mov.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                {mov.operador_nome && ` • ${mov.operador_nome}`}
                                            </p>
                                        </div>
                                        <span className={`text-sm font-bold shrink-0 ${mov.tipo === 'sangria' ? 'text-red-400' : 'text-blue-400'}`}>
                                            {mov.tipo === 'sangria' ? '-' : '+'}{formatarMoeda(mov.valor)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Totais da sessão */}
                        {movRecentes.length > 0 && (
                            <div className="pt-2 border-t border-surface-700 flex justify-between text-xs text-surface-400">
                                <span className="text-red-400">
                                    Sangrias: -{formatarMoeda(movRecentes.filter(m => m.tipo === 'sangria').reduce((a, m) => a + m.valor, 0))}
                                </span>
                                <span className="text-blue-400">
                                    Suprimentos: +{formatarMoeda(movRecentes.filter(m => m.tipo === 'suprimento').reduce((a, m) => a + m.valor, 0))}
                                </span>
                            </div>
                        )}

                        <button
                            onClick={() => setAbaAtiva('operacao')}
                            className="w-full py-2.5 rounded-xl text-sm font-medium text-surface-400 hover:text-surface-200 bg-surface-700/40 hover:bg-surface-700 transition-colors"
                        >
                            + Nova Operação
                        </button>
                    </div>
                )}
            </div>
        </Modal>
    );
}
