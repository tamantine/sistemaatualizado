// =============================================
// Componente: ModalPagamento
// Formas de pagamento: Dinheiro, Débito, Crédito, PIX, Múltiplo
// =============================================
import { useState } from 'react';
import { usePDVStore } from '../../store/usePDVStore';
import { useAppStore } from '../../store/useAppStore';
import Modal from '../ui/Modal';
import { formatarMoeda } from '../../utils/formatters';
import {
    Banknote, CreditCard, QrCode,
    CheckCircle, Calculator, Split, Trash2,
} from 'lucide-react';
import type { FormaPagamento } from '../../types';

type FormaPgto = Exclude<FormaPagamento, 'multiplo' | 'crediario'>;

interface PagamentoParcial {
    id: string;
    forma: FormaPgto;
    valor: number;
}

const formasPagamento: { id: FormaPgto; label: string; icone: React.ElementType; cor: string }[] = [
    { id: 'dinheiro', label: 'Dinheiro', icone: Banknote, cor: 'from-green-500 to-green-700' },
    { id: 'debito', label: 'Débito', icone: CreditCard, cor: 'from-blue-500 to-blue-700' },
    { id: 'credito', label: 'Crédito', icone: CreditCard, cor: 'from-purple-500 to-purple-700' },
    { id: 'pix', label: 'PIX', icone: QrCode, cor: 'from-cyan-500 to-cyan-700' },
];

export default function ModalPagamento() {
    const { modalPagamento, setModalPagamento, total, limparCarrinho, itens, caixa, registrarVenda } = usePDVStore();
    const { adicionarToast } = useAppStore();
    const totalVenda = total();

    const [modo, setModo] = useState<'simples' | 'multiplo'>('simples');
    const [formaSelecionada, setFormaSelecionada] = useState<FormaPgto>('dinheiro');
    const [valorRecebido, setValorRecebido] = useState('');
    const [pagamentos, setPagamentos] = useState<PagamentoParcial[]>([]);

    // Valores rápidos para dinheiro
    const valoresRapidos = [5, 10, 20, 50, 100, 200];

    // Troco
    const valorRec = parseFloat(valorRecebido) || 0;
    const troco = formaSelecionada === 'dinheiro' ? Math.max(0, valorRec - totalVenda) : 0;

    // Múltiplo: total já pago e restante
    const totalPago = pagamentos.reduce((acc, p) => acc + p.valor, 0);
    const restante = totalVenda - totalPago;

    // Finalizar venda simples
    const finalizarSimples = async () => {
        if (formaSelecionada === 'dinheiro' && valorRec < totalVenda) {
            adicionarToast({ tipo: 'erro', titulo: 'Valor insuficiente', mensagem: `Faltam ${formatarMoeda(totalVenda - valorRec)}` });
            return;
        }

        try {
            // Registrar venda no Supabase e atualizar caixa
            await registrarVenda(formaSelecionada, valorRec, troco);

            adicionarToast({
                tipo: 'sucesso',
                titulo: 'Venda finalizada!',
                mensagem: `${formatarMoeda(totalVenda)} — ${formaSelecionada.toUpperCase()}${troco > 0 ? ` | Troco: ${formatarMoeda(troco)}` : ''}`,
            });

            setModalPagamento(false);
            resetarEstado();
        } catch (err) {
            adicionarToast({ tipo: 'erro', titulo: 'Erro ao finalizar venda', mensagem: 'Verifique sua conexão' });
            console.error('[ModalPagamento] Erro:', err);
        }
    };

    // Adicionar pagamento parcial
    const adicionarPagamento = () => {
        const valor = parseFloat(valorRecebido) || 0;
        if (valor <= 0) {
            adicionarToast({ tipo: 'erro', titulo: 'Informe um valor' });
            return;
        }
        if (valor > restante + 0.01) {
            adicionarToast({ tipo: 'aviso', titulo: 'Valor excede o restante' });
        }

        setPagamentos([...pagamentos, {
            id: crypto.randomUUID(),
            forma: formaSelecionada,
            valor: Math.min(valor, restante),
        }]);
        setValorRecebido('');
    };

    // Finalizar venda múltipla
    const finalizarMultiplo = async () => {
        if (restante > 0.01) {
            adicionarToast({ tipo: 'erro', titulo: `Faltam ${formatarMoeda(restante)}` });
            return;
        }

        try {
            // Registrar venda com múltiplas formas de pagamento
            const pagamentosFormatados = pagamentos.map(p => ({
                forma_pagamento: p.forma as 'dinheiro' | 'debito' | 'credito' | 'pix',
                valor: p.valor
            }));
            await registrarVenda('multiplo', totalVenda, 0, pagamentosFormatados);

            adicionarToast({
                tipo: 'sucesso',
                titulo: 'Venda finalizada!',
                mensagem: `${formatarMoeda(totalVenda)} — Pagamento múltiplo (${pagamentos.length} formas)`,
            });

            setModalPagamento(false);
            resetarEstado();
        } catch (err) {
            adicionarToast({ tipo: 'erro', titulo: 'Erro ao finalizar venda', mensagem: 'Verifique sua conexão' });
            console.error('[ModalPagamento] Erro:', err);
        }
    };

    const resetarEstado = () => {
        setModo('simples');
        setFormaSelecionada('dinheiro');
        setValorRecebido('');
        setPagamentos([]);
    };

    return (
        <Modal
            aberto={modalPagamento}
            onFechar={() => { setModalPagamento(false); resetarEstado(); }}
            titulo="Pagamento"
            tamanho="lg"
        >
            <div className="space-y-5">
                {/* Total da venda */}
                <div className="text-center py-4 bg-surface-700/30 rounded-2xl">
                    <p className="text-sm text-surface-400 mb-1">Total da Venda</p>
                    <p className="text-4xl font-bold text-brand-400">{formatarMoeda(totalVenda)}</p>
                    <p className="text-xs text-surface-500 mt-1">{itens.length} {itens.length === 1 ? 'item' : 'itens'}</p>
                </div>

                {/* Toggle simples/múltiplo */}
                <div className="flex gap-2 bg-surface-800 rounded-xl p-1">
                    <button
                        onClick={() => { setModo('simples'); setPagamentos([]); }}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${modo === 'simples' ? 'bg-brand-600 text-white' : 'text-surface-400 hover:text-surface-200'
                            }`}
                    >
                        <CreditCard size={16} /> Simples
                    </button>
                    <button
                        onClick={() => setModo('multiplo')}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${modo === 'multiplo' ? 'bg-brand-600 text-white' : 'text-surface-400 hover:text-surface-200'
                            }`}
                    >
                        <Split size={16} /> Múltiplo
                    </button>
                </div>

                {/* Formas de pagamento */}
                <div className="grid grid-cols-4 gap-2">
                    {formasPagamento.map((forma) => (
                        <button
                            key={forma.id}
                            onClick={() => setFormaSelecionada(forma.id)}
                            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${formaSelecionada === forma.id
                                ? 'border-brand-500 bg-brand-600/10'
                                : 'border-surface-700 hover:border-surface-600'
                                }`}
                        >
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${forma.cor} flex items-center justify-center`}>
                                <forma.icone size={20} className="text-white" />
                            </div>
                            <span className="text-xs font-medium text-surface-300">{forma.label}</span>
                        </button>
                    ))}
                </div>

                {/* Modo simples */}
                {modo === 'simples' && (
                    <div className="space-y-4">
                        {/* Valor recebido (dinheiro) */}
                        {formaSelecionada === 'dinheiro' && (
                            <>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-surface-300">Valor Recebido (R$)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={valorRecebido}
                                        onChange={(e) => setValorRecebido(e.target.value)}
                                        placeholder={totalVenda.toFixed(2)}
                                        className="w-full bg-surface-700/50 border border-surface-600 rounded-xl px-4 py-3 text-lg text-center font-bold text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
                                        autoFocus
                                        onKeyDown={(e) => e.key === 'Enter' && finalizarSimples()}
                                    />
                                </div>

                                {/* Valores rápidos */}
                                <div className="grid grid-cols-6 gap-2">
                                    {valoresRapidos.map((v) => (
                                        <button
                                            key={v}
                                            onClick={() => setValorRecebido(v.toString())}
                                            className="py-2 rounded-lg text-sm font-medium bg-surface-700 text-surface-300 hover:bg-surface-600 hover:text-surface-100 transition-colors"
                                        >
                                            R${v}
                                        </button>
                                    ))}
                                </div>

                                {/* Troco */}
                                {valorRec > 0 && (
                                    <div className={`text-center py-3 rounded-xl ${troco > 0 ? 'bg-green-500/10 border border-green-500/20' : valorRec < totalVenda ? 'bg-red-500/10 border border-red-500/20' : 'bg-brand-600/10'
                                        }`}>
                                        <p className="text-sm text-surface-400">Troco</p>
                                        <p className={`text-2xl font-bold ${troco > 0 ? 'text-green-400' : valorRec < totalVenda ? 'text-red-400' : 'text-brand-400'
                                            }`}>
                                            {valorRec < totalVenda ? `-${formatarMoeda(totalVenda - valorRec)}` : formatarMoeda(troco)}
                                        </p>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Confirmação para cartão/pix */}
                        {formaSelecionada !== 'dinheiro' && (
                            <div className="text-center py-6 bg-surface-700/30 rounded-xl">
                                <Calculator size={28} className="mx-auto mb-2 text-surface-400" />
                                <p className="text-sm text-surface-400">Cobrar via <strong className="text-surface-200">{formaSelecionada.toUpperCase()}</strong></p>
                                <p className="text-2xl font-bold text-brand-400 mt-1">{formatarMoeda(totalVenda)}</p>
                            </div>
                        )}

                        {/* Botão finalizar */}
                        <button
                            onClick={finalizarSimples}
                            disabled={formaSelecionada === 'dinheiro' && valorRec > 0 && valorRec < totalVenda}
                            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-base font-bold text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 shadow-lg shadow-brand-600/25 transition-all disabled:opacity-30"
                        >
                            <CheckCircle size={20} /> Finalizar Venda
                        </button>
                    </div>
                )}

                {/* Modo múltiplo */}
                {modo === 'multiplo' && (
                    <div className="space-y-4">
                        {/* Lista de pagamentos adicionados */}
                        {pagamentos.length > 0 && (
                            <div className="space-y-2">
                                {pagamentos.map((pgto) => {
                                    const forma = formasPagamento.find((f) => f.id === pgto.forma)!;
                                    return (
                                        <div key={pgto.id} className="flex items-center justify-between bg-surface-800/50 rounded-xl px-4 py-2.5 border border-surface-700/50">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${forma.cor} flex items-center justify-center`}>
                                                    <forma.icone size={14} className="text-white" />
                                                </div>
                                                <span className="text-sm font-medium text-surface-300">{forma.label}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-brand-400">{formatarMoeda(pgto.valor)}</span>
                                                <button
                                                    onClick={() => setPagamentos(pagamentos.filter((p) => p.id !== pgto.id))}
                                                    className="p-1 rounded-lg text-surface-500 hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Restante */}
                        {restante > 0.01 && (
                            <>
                                <div className="text-center py-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                                    <p className="text-sm text-surface-400">Restante</p>
                                    <p className="text-xl font-bold text-yellow-400">{formatarMoeda(restante)}</p>
                                </div>

                                {/* Adicionar valor */}
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={valorRecebido}
                                        onChange={(e) => setValorRecebido(e.target.value)}
                                        placeholder={restante.toFixed(2)}
                                        className="flex-1 bg-surface-700/50 border border-surface-600 rounded-xl px-4 py-2.5 text-sm text-center font-bold text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                                        onKeyDown={(e) => e.key === 'Enter' && adicionarPagamento()}
                                    />
                                    <button
                                        onClick={adicionarPagamento}
                                        className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-accent-600 hover:bg-accent-500 transition-colors"
                                    >
                                        Adicionar
                                    </button>
                                </div>
                            </>
                        )}

                        {/* Botão finalizar múltiplo */}
                        {restante <= 0.01 && (
                            <button
                                onClick={finalizarMultiplo}
                                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-base font-bold text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 shadow-lg shadow-brand-600/25 transition-all"
                            >
                                <CheckCircle size={20} /> Finalizar Venda
                            </button>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
}
