// =============================================
// Componente: ModalPagamento
// Formas de pagamento: Dinheiro, Débito, Crédito, PIX, Múltiplo
// Após pagamento: exibe cupom não fiscal com opção de imprimir
// =============================================
import { useState } from 'react';
import { usePDVStore, type VendaFinalizada } from '../../store/usePDVStore';
import { useAppStore } from '../../store/useAppStore';
import Modal from '../ui/Modal';
import CupomNaoFiscal from './CuponNaoFiscal';
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
    const { modalPagamento, setModalPagamento, total, registrarVenda, limparUltimaVenda } = usePDVStore();
    const { adicionarToast } = useAppStore();
    const totalVenda = total();

    const [modo, setModo] = useState<'simples' | 'multiplo'>('simples');
    const [formaSelecionada, setFormaSelecionada] = useState<FormaPgto>('dinheiro');
    const [valorRecebido, setValorRecebido] = useState('');
    const [pagamentos, setPagamentos] = useState<PagamentoParcial[]>([]);
    const [vendaFinalizada, setVendaFinalizada] = useState<VendaFinalizada | null>(null);
    const [processando, setProcessando] = useState(false);

    // Valores rápidos para dinheiro
    const valoresRapidos = [10, 20, 50, 100, 200, 500];

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

        setProcessando(true);
        try {
            const venda = await registrarVenda(
                formaSelecionada,
                formaSelecionada === 'dinheiro' ? valorRec : totalVenda,
                troco
            );

            if (venda) {
                setVendaFinalizada(venda);
                adicionarToast({
                    tipo: 'sucesso',
                    titulo: 'Venda finalizada!',
                    mensagem: `${formatarMoeda(totalVenda)} — ${formaSelecionada.toUpperCase()}${troco > 0 ? ` | Troco: ${formatarMoeda(troco)}` : ''}`,
                });
            }
        } catch (err) {
            adicionarToast({ tipo: 'erro', titulo: 'Erro ao finalizar venda', mensagem: 'Verifique sua conexão' });
            console.error('[ModalPagamento] Erro:', err);
        } finally {
            setProcessando(false);
        }
    };

    // Adicionar pagamento parcial
    const adicionarPagamento = () => {
        const valor = parseFloat(valorRecebido) || 0;
        if (valor <= 0) {
            adicionarToast({ tipo: 'erro', titulo: 'Informe um valor' });
            return;
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

        setProcessando(true);
        try {
            const pagamentosFormatados = pagamentos.map(p => ({
                forma_pagamento: p.forma as 'dinheiro' | 'debito' | 'credito' | 'pix',
                valor: p.valor
            }));

            const trocoMultiplo = pagamentos
                .filter(p => p.forma === 'dinheiro')
                .reduce((acc, p) => acc + p.valor, 0) > totalVenda
                ? pagamentos.filter(p => p.forma === 'dinheiro').reduce((acc, p) => acc + p.valor, 0) - totalVenda
                : 0;

            const venda = await registrarVenda('multiplo', totalVenda, trocoMultiplo, pagamentosFormatados);

            if (venda) {
                setVendaFinalizada(venda);
                adicionarToast({
                    tipo: 'sucesso',
                    titulo: 'Venda finalizada!',
                    mensagem: `${formatarMoeda(totalVenda)} — Pagamento múltiplo (${pagamentos.length} formas)`,
                });
            }
        } catch (err) {
            adicionarToast({ tipo: 'erro', titulo: 'Erro ao finalizar venda', mensagem: 'Verifique sua conexão' });
            console.error('[ModalPagamento] Erro:', err);
        } finally {
            setProcessando(false);
        }
    };

    const resetarEstado = () => {
        setModo('simples');
        setFormaSelecionada('dinheiro');
        setValorRecebido('');
        setPagamentos([]);
        setVendaFinalizada(null);
        limparUltimaVenda();
    };

    const fecharTudo = () => {
        setModalPagamento(false);
        resetarEstado();
    };

    // Se venda finalizada, mostra o cupom
    if (vendaFinalizada) {
        return (
            <CupomNaoFiscal
                venda={{
                    id: vendaFinalizada.id,
                    cliente_nome: vendaFinalizada.cliente_nome,
                    operador_nome: vendaFinalizada.operador_nome,
                    data: vendaFinalizada.data,
                    forma_pagamento: vendaFinalizada.forma_pagamento,
                    total: vendaFinalizada.total,
                    subtotal: vendaFinalizada.subtotal,
                    desconto: vendaFinalizada.desconto,
                    troco: vendaFinalizada.troco,
                    valor_pago: vendaFinalizada.valor_pago,
                    pagamentos: vendaFinalizada.pagamentos,
                }}
                itens={vendaFinalizada.itens}
                onFechar={fecharTudo}
            />
        );
    }

    return (
        <Modal
            aberto={modalPagamento}
            onFechar={() => { setModalPagamento(false); resetarEstado(); }}
            titulo="Pagamento"
            tamanho="lg"
        >
            {/* Layout compacto sem scroll */}
            <div className="space-y-3">
                {/* Total da venda */}
                <div className="text-center py-3 bg-surface-700/30 rounded-xl">
                    <p className="text-xs text-surface-400">Total da Venda</p>
                    <p className="text-3xl font-bold text-brand-400">{formatarMoeda(totalVenda)}</p>
                </div>

                {/* Toggle simples/múltiplo */}
                <div className="flex gap-1.5 bg-surface-800 rounded-lg p-0.5">
                    <button
                        onClick={() => { setModo('simples'); setPagamentos([]); }}
                        className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1 ${modo === 'simples' ? 'bg-brand-600 text-white' : 'text-surface-400 hover:text-surface-200'
                            }`}
                    >
                        <CreditCard size={12} /> Simples
                    </button>
                    <button
                        onClick={() => setModo('multiplo')}
                        className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1 ${modo === 'multiplo' ? 'bg-brand-600 text-white' : 'text-surface-400 hover:text-surface-200'
                            }`}
                    >
                        <Split size={12} /> Múltiplo
                    </button>
                </div>

                {/* Formas de pagamento */}
                <div className="grid grid-cols-4 gap-1.5">
                    {formasPagamento.map((forma) => (
                        <button
                            key={forma.id}
                            onClick={() => setFormaSelecionada(forma.id)}
                            className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${formaSelecionada === forma.id
                                ? 'border-brand-500 bg-brand-600/10'
                                : 'border-surface-700 hover:border-surface-600'
                                }`}
                        >
                            <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${forma.cor} flex items-center justify-center`}>
                                <forma.icone size={14} className="text-white" />
                            </div>
                            <span className="text-[10px] font-medium text-surface-300">{forma.label}</span>
                        </button>
                    ))}
                </div>

                {/* Modo simples */}
                {modo === 'simples' && (
                    <div className="space-y-2">
                        {/* Valor recebido (dinheiro) */}
                        {formaSelecionada === 'dinheiro' && (
                            <>
                                <div className="space-y-1">
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={valorRecebido}
                                        onChange={(e) => setValorRecebido(e.target.value)}
                                        placeholder={totalVenda.toFixed(2)}
                                        className="w-full bg-surface-700/50 border border-surface-600 rounded-lg px-3 py-2 text-base text-center font-bold text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
                                        autoFocus
                                        onKeyDown={(e) => e.key === 'Enter' && finalizarSimples()}
                                    />
                                </div>

                                {/* Valores rápidos */}
                                <div className="grid grid-cols-6 gap-1">
                                    {valoresRapidos.map((v) => (
                                        <button
                                            key={v}
                                            onClick={() => setValorRecebido(v.toString())}
                                            className="py-1.5 rounded-md text-[10px] font-medium bg-surface-700 text-surface-300 hover:bg-surface-600 hover:text-surface-100 transition-colors"
                                        >
                                            R${v}
                                        </button>
                                    ))}
                                </div>

                                {/* Troco */}
                                {valorRec > 0 && (
                                    <div className={`text-center py-2 rounded-lg ${troco > 0 ? 'bg-green-500/10 border border-green-500/20' : valorRec < totalVenda ? 'bg-red-500/10 border border-red-500/20' : 'bg-brand-600/10'
                                        }`}>
                                        <p className="text-[10px] text-surface-400">Troco</p>
                                        <p className={`text-lg font-bold ${troco > 0 ? 'text-green-400' : valorRec < totalVenda ? 'text-red-400' : 'text-brand-400'
                                            }`}>
                                            {valorRec < totalVenda ? `-${formatarMoeda(totalVenda - valorRec)}` : formatarMoeda(troco)}
                                        </p>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Confirmação para cartão/pix */}
                        {formaSelecionada !== 'dinheiro' && (
                            <div className="text-center py-3 bg-surface-700/30 rounded-lg">
                                <Calculator size={18} className="mx-auto mb-1 text-surface-400" />
                                <p className="text-xs text-surface-400">Cobrar via <strong className="text-surface-200">{formaSelecionada.toUpperCase()}</strong></p>
                                <p className="text-xl font-bold text-brand-400">{formatarMoeda(totalVenda)}</p>
                            </div>
                        )}

                        {/* Botão finalizar */}
                        <button
                            onClick={finalizarSimples}
                            disabled={processando || (formaSelecionada === 'dinheiro' && valorRec > 0 && valorRec < totalVenda)}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 shadow-lg shadow-brand-600/25 transition-all disabled:opacity-30"
                        >
                            {processando ? (
                                <span className="animate-pulse">Processando...</span>
                            ) : (
                                <><CheckCircle size={16} /> Finalizar Venda</>
                            )}
                        </button>
                    </div>
                )}

                {/* Modo múltiplo */}
                {modo === 'multiplo' && (
                    <div className="space-y-2">
                        {/* Lista de pagamentos adicionados */}
                        {pagamentos.length > 0 && (
                            <div className="space-y-1 max-h-20 overflow-y-auto">
                                {pagamentos.map((pgto) => {
                                    const forma = formasPagamento.find((f) => f.id === pgto.forma)!;
                                    return (
                                        <div key={pgto.id} className="flex items-center justify-between bg-surface-800/50 rounded-lg px-2 py-1.5 border border-surface-700/50">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-5 h-5 rounded-md bg-gradient-to-br ${forma.cor} flex items-center justify-center`}>
                                                    <forma.icone size={10} className="text-white" />
                                                </div>
                                                <span className="text-[10px] font-medium text-surface-300">{forma.label}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[10px] font-bold text-brand-400">{formatarMoeda(pgto.valor)}</span>
                                                <button
                                                    onClick={() => setPagamentos(pagamentos.filter((p) => p.id !== pgto.id))}
                                                    className="p-0.5 rounded text-surface-500 hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 size={10} />
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
                                <div className="text-center py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                    <p className="text-[10px] text-surface-400">Restante</p>
                                    <p className="text-base font-bold text-yellow-400">{formatarMoeda(restante)}</p>
                                </div>

                                <div className="flex gap-1.5">
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={valorRecebido}
                                        onChange={(e) => setValorRecebido(e.target.value)}
                                        placeholder={restante.toFixed(2)}
                                        className="flex-1 bg-surface-700/50 border border-surface-600 rounded-lg px-2 py-1.5 text-xs text-center font-bold text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                                        onKeyDown={(e) => e.key === 'Enter' && adicionarPagamento()}
                                    />
                                    <button
                                        onClick={adicionarPagamento}
                                        className="px-3 py-1.5 rounded-lg text-[10px] font-semibold text-white bg-accent-600 hover:bg-accent-500 transition-colors"
                                    >
                                        +
                                    </button>
                                </div>
                            </>
                        )}

                        {/* Botão finalizar múltiplo */}
                        {restante <= 0.01 && pagamentos.length > 0 && (
                            <button
                                onClick={finalizarMultiplo}
                                disabled={processando}
                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 shadow-lg shadow-brand-600/25 transition-all disabled:opacity-30"
                            >
                                {processando ? (
                                    <span className="animate-pulse">Processando...</span>
                                ) : (
                                    <><CheckCircle size={16} /> Finalizar Venda</>
                                )}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
}
