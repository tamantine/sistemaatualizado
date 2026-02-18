// =============================================
// Componente: ModalSangria
// Sangria e Suprimento de caixa
// =============================================
import { useState } from 'react';
import { usePDVStore } from '../../store/usePDVStore';
import { useAppStore } from '../../store/useAppStore';
import Modal from '../ui/Modal';
import { formatarMoeda } from '../../utils/formatters';
import { ArrowDownLeft, ArrowUpRight, DollarSign, FileText } from 'lucide-react';

type TipoOperacao = 'sangria' | 'suprimento';

export default function ModalSangria() {
    const { modalSangria, setModalSangria, caixa } = usePDVStore();
    const { adicionarToast } = useAppStore();
    const [tipo, setTipo] = useState<TipoOperacao>('sangria');
    const [valor, setValor] = useState('');
    const [motivo, setMotivo] = useState('');

    const handleConfirmar = () => {
        const v = parseFloat(valor) || 0;
        if (v <= 0) {
            adicionarToast({ tipo: 'erro', titulo: 'Informe um valor válido' });
            return;
        }
        if (!motivo.trim()) {
            adicionarToast({ tipo: 'erro', titulo: 'Informe o motivo da operação' });
            return;
        }

        if (caixa) {
            const caixaAtualizado = { ...caixa };
            if (tipo === 'sangria') {
                caixaAtualizado.valor_sangria += v;
                caixaAtualizado.valor_dinheiro -= v;
            } else {
                caixaAtualizado.valor_suprimento += v;
                caixaAtualizado.valor_dinheiro += v;
            }
        }

        adicionarToast({
            tipo: 'sucesso',
            titulo: `${tipo === 'sangria' ? 'Sangria' : 'Suprimento'} registrado`,
            mensagem: `${formatarMoeda(v)} — ${motivo}`,
        });

        setModalSangria(false);
        setValor('');
        setMotivo('');
    };

    const inputClass = "w-full bg-surface-700/50 border border-surface-600 rounded-xl px-4 py-3 text-sm text-surface-100 placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all";

    return (
        <Modal
            aberto={modalSangria}
            onFechar={() => { setModalSangria(false); setValor(''); setMotivo(''); }}
            titulo="Sangria / Suprimento"
            tamanho="sm"
        >
            <div className="space-y-5">
                {/* Saldo atual */}
                {caixa && (
                    <div className="text-center py-3 bg-surface-700/30 rounded-xl">
                        <p className="text-xs text-surface-400">Dinheiro no caixa</p>
                        <p className="text-xl font-bold text-brand-400">{formatarMoeda(caixa.valor_dinheiro)}</p>
                    </div>
                )}

                {/* Toggle tipo */}
                <div className="flex gap-2 bg-surface-800 rounded-xl p-1">
                    <button
                        onClick={() => setTipo('sangria')}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${tipo === 'sangria' ? 'bg-red-600 text-white' : 'text-surface-400 hover:text-surface-200'
                            }`}
                    >
                        <ArrowUpRight size={16} /> Sangria
                    </button>
                    <button
                        onClick={() => setTipo('suprimento')}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${tipo === 'suprimento' ? 'bg-green-600 text-white' : 'text-surface-400 hover:text-surface-200'
                            }`}
                    >
                        <ArrowDownLeft size={16} /> Suprimento
                    </button>
                </div>

                {/* Valor */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-surface-300 flex items-center gap-2">
                        <DollarSign size={14} /> Valor (R$)
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={valor}
                        onChange={(e) => setValor(e.target.value)}
                        placeholder="0,00"
                        className={inputClass}
                        autoFocus
                    />
                </div>

                {/* Motivo */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-surface-300 flex items-center gap-2">
                        <FileText size={14} /> Motivo
                    </label>
                    <input
                        type="text"
                        value={motivo}
                        onChange={(e) => setMotivo(e.target.value)}
                        placeholder={tipo === 'sangria' ? 'Ex: Pagamento de fornecedor' : 'Ex: Reforço de troco'}
                        className={inputClass}
                        onKeyDown={(e) => e.key === 'Enter' && handleConfirmar()}
                    />
                </div>

                {/* Botão confirmar */}
                <button
                    onClick={handleConfirmar}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all shadow-lg ${tipo === 'sangria'
                        ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-red-600/25'
                        : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 shadow-green-600/25'
                        }`}
                >
                    {tipo === 'sangria' ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                    Confirmar {tipo === 'sangria' ? 'Sangria' : 'Suprimento'}
                </button>
            </div>
        </Modal>
    );
}
