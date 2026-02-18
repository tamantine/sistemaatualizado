// =============================================
// Componente: ModalEspera
// Exibe vendas em espera para recuperar
// =============================================
import { usePDVStore } from '../../store/usePDVStore';
import Modal from '../ui/Modal';
import { formatarMoeda, formatarDataHora } from '../../utils/formatters';
import { Clock, Trash2, RotateCcw, ShoppingCart } from 'lucide-react';

export default function ModalEspera() {
    const { modalEspera, setModalEspera, vendasEspera, recuperarEspera, removerEspera } = usePDVStore();

    return (
        <Modal aberto={modalEspera} onFechar={() => setModalEspera(false)} titulo="Vendas em Espera" tamanho="md">
            <div className="space-y-3">
                {vendasEspera.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-surface-500">
                        <Clock size={40} className="mb-3 opacity-20" />
                        <p className="text-sm font-medium">Nenhuma venda em espera</p>
                        <p className="text-xs mt-1">As vendas pausadas aparecerão aqui</p>
                    </div>
                ) : (
                    vendasEspera.map((espera) => {
                        const totalItens = espera.itens.reduce((acc, i) => acc + i.quantidade, 0);
                        const totalValor = espera.itens.reduce((acc, i) => acc + i.subtotal, 0);

                        return (
                            <div
                                key={espera.id}
                                className="bg-surface-800/50 rounded-xl p-4 border border-surface-700/50 hover:border-surface-600 transition-colors"
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <ShoppingCart size={14} className="text-accent-400" />
                                            <span className="text-sm font-semibold text-surface-200">
                                                {espera.cliente_nome || 'Sem cliente'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-surface-500 flex items-center gap-1">
                                            <Clock size={10} /> {formatarDataHora(espera.criado_em)}
                                        </p>
                                    </div>
                                    <span className="text-lg font-bold text-brand-400">{formatarMoeda(totalValor)}</span>
                                </div>

                                {/* Itens resumidos */}
                                <div className="text-xs text-surface-400 mb-3 space-y-0.5">
                                    {espera.itens.slice(0, 3).map((item) => (
                                        <p key={item.id} className="truncate">
                                            {item.quantidade}x {item.produto.nome} — {formatarMoeda(item.subtotal)}
                                        </p>
                                    ))}
                                    {espera.itens.length > 3 && (
                                        <p className="text-surface-500">+{espera.itens.length - 3} mais itens...</p>
                                    )}
                                </div>

                                <div className="text-xs text-surface-500 mb-3">
                                    {totalItens} {totalItens === 1 ? 'item' : 'itens'}
                                    {espera.observacao && <span> • {espera.observacao}</span>}
                                </div>

                                {/* Ações */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => recuperarEspera(espera.id)}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 transition-colors"
                                    >
                                        <RotateCcw size={12} /> Recuperar
                                    </button>
                                    <button
                                        onClick={() => removerEspera(espera.id)}
                                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                                    >
                                        <Trash2 size={12} /> Cancelar
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </Modal>
    );
}
