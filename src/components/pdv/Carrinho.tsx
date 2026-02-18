// =============================================
// Componente: Carrinho do PDV
// Lista de itens, descontos, totais
// =============================================
import { usePDVStore } from '../../store/usePDVStore';
import { useAppStore } from '../../store/useAppStore';
import { formatarMoeda } from '../../utils/formatters';
import {
    Trash2, Plus, Minus, Percent, CreditCard,
    Pause, ShoppingCart, User,
} from 'lucide-react';

export default function Carrinho() {
    const {
        itens, clienteNome, setClienteNome,
        removerItem, atualizarQuantidade,
        limparCarrinho, descontoGeral, setDescontoGeral,
        subtotal, totalDesconto, total, totalItens,
        setModalPagamento,
        vendasEspera,
    } = usePDVStore();

    const sub = subtotal();
    const desc = totalDesconto();
    const tot = total();
    const qtdItens = totalItens();

    return (
        <div className="flex flex-col h-full bg-surface-900 border-l border-surface-700/50">
            {/* Cabeçalho do carrinho */}
            <div className="px-4 py-3 border-b border-surface-700/50">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-surface-200 flex items-center gap-2">
                        <ShoppingCart size={18} className="text-brand-400" />
                        Carrinho
                        {qtdItens > 0 && (
                            <span className="text-xs bg-brand-600 text-white px-2 py-0.5 rounded-full">
                                {qtdItens}
                            </span>
                        )}
                    </h3>
                    {itens.length > 0 && (
                        <button
                            onClick={limparCarrinho}
                            className="text-xs text-red-400 hover:text-red-300 transition-colors"
                        >
                            Limpar
                        </button>
                    )}
                </div>

                {/* Campo cliente */}
                <div className="relative">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
                    <input
                        type="text"
                        value={clienteNome}
                        onChange={(e) => setClienteNome(e.target.value)}
                        placeholder="Cliente (opcional)"
                        className="w-full bg-surface-800/50 border border-surface-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-surface-200 placeholder:text-surface-500 focus:outline-none focus:ring-1 focus:ring-brand-500/50 transition-all"
                    />
                </div>
            </div>

            {/* Lista de itens */}
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
                {itens.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-surface-500 space-y-2">
                        <ShoppingCart size={40} className="opacity-20" />
                        <p className="text-sm">Carrinho vazio</p>
                        <p className="text-xs">Busque e adicione produtos</p>
                    </div>
                ) : (
                    itens.map((item) => (
                        <div
                            key={item.id}
                            className="bg-surface-800/50 rounded-xl p-3 border border-surface-700/30 hover:border-surface-600 transition-colors group"
                        >
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-surface-200 truncate">{item.produto.nome}</p>
                                    <p className="text-xs text-surface-500">
                                        {formatarMoeda(item.preco_unitario)}/{item.produto.unidade.toLowerCase()}
                                    </p>
                                </div>
                                <button
                                    onClick={() => removerItem(item.id)}
                                    className="p-1 rounded-lg text-surface-500 opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>

                            {/* Controles de quantidade */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <button
                                        onClick={() => {
                                            if (item.quantidade > (item.produto.unidade === 'KG' ? 0.1 : 1)) {
                                                const novaQtd = item.produto.unidade === 'KG'
                                                    ? Math.round((item.quantidade - 0.1) * 100) / 100
                                                    : item.quantidade - 1;
                                                atualizarQuantidade(item.id, novaQtd);
                                            }
                                        }}
                                        className="w-7 h-7 rounded-lg bg-surface-700 flex items-center justify-center text-surface-300 hover:bg-surface-600 transition-colors"
                                    >
                                        <Minus size={12} />
                                    </button>

                                    <input
                                        type="number"
                                        value={item.quantidade}
                                        onChange={(e) => {
                                            const val = parseFloat(e.target.value);
                                            if (val > 0) atualizarQuantidade(item.id, val);
                                        }}
                                        className="w-14 text-center bg-surface-700/50 border border-surface-600 rounded-lg py-1 text-sm text-surface-100 focus:outline-none focus:ring-1 focus:ring-brand-500/50"
                                        step={item.produto.unidade === 'KG' ? '0.01' : '1'}
                                        min={item.produto.unidade === 'KG' ? '0.01' : '1'}
                                    />

                                    <button
                                        onClick={() => {
                                            const novaQtd = item.produto.unidade === 'KG'
                                                ? Math.round((item.quantidade + 0.1) * 100) / 100
                                                : item.quantidade + 1;
                                            atualizarQuantidade(item.id, novaQtd);
                                        }}
                                        className="w-7 h-7 rounded-lg bg-surface-700 flex items-center justify-center text-surface-300 hover:bg-surface-600 transition-colors"
                                    >
                                        <Plus size={12} />
                                    </button>
                                </div>

                                {/* Subtotal do item */}
                                <span className="text-sm font-bold text-brand-400">
                                    {formatarMoeda(item.subtotal)}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Área de desconto */}
            {itens.length > 0 && (
                <div className="px-4 py-2 border-t border-surface-700/50">
                    <div className="flex items-center gap-2">
                        <Percent size={14} className="text-surface-500" />
                        <span className="text-xs text-surface-400">Desconto geral:</span>
                        <input
                            type="number"
                            value={descontoGeral || ''}
                            onChange={(e) => setDescontoGeral(parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            className="w-16 text-center bg-surface-800/50 border border-surface-700 rounded-lg py-1 text-xs text-surface-100 focus:outline-none focus:ring-1 focus:ring-brand-500/50"
                            step="1"
                            min="0"
                            max="100"
                        />
                        <span className="text-xs text-surface-500">%</span>
                    </div>
                </div>
            )}

            {/* Totais */}
            <div className="px-4 py-3 border-t border-surface-700/50 space-y-1.5">
                <div className="flex justify-between text-sm">
                    <span className="text-surface-400">Subtotal</span>
                    <span className="text-surface-300">{formatarMoeda(sub)}</span>
                </div>
                {desc > 0 && (
                    <div className="flex justify-between text-sm">
                        <span className="text-accent-400">Desconto</span>
                        <span className="text-accent-400">-{formatarMoeda(desc)}</span>
                    </div>
                )}
                <div className="flex justify-between items-baseline pt-1">
                    <span className="text-lg font-bold text-surface-100">Total</span>
                    <span className="text-2xl font-bold text-brand-400">{formatarMoeda(tot)}</span>
                </div>
            </div>

            {/* Botões de ação */}
            <div className="px-4 pb-4 space-y-2">
                {/* Botão pagamento */}
                <button
                    onClick={() => setModalPagamento(true)}
                    disabled={itens.length === 0}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-base font-bold text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 shadow-lg shadow-brand-600/25 transition-all disabled:opacity-30 disabled:pointer-events-none"
                >
                    <CreditCard size={20} /> Pagamento (F4)
                </button>

                {/* Botão espera */}
                <button
                    onClick={() => {
                        if (itens.length > 0) {
                            const { salvarEmEspera } = usePDVStore.getState();
                            salvarEmEspera();
                            useAppStore.getState().adicionarToast({ tipo: 'info', titulo: 'Venda salva em espera' });
                        }
                    }}
                    disabled={itens.length === 0}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-surface-300 bg-surface-800 border border-surface-700 hover:bg-surface-700 transition-all disabled:opacity-30 disabled:pointer-events-none"
                >
                    <Pause size={16} /> Espera (F9)
                    {vendasEspera.length > 0 && (
                        <span className="bg-accent-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                            {vendasEspera.length}
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
}
