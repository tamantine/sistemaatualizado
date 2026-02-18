// =============================================
// Página: PDV — Frente de Caixa
// Tela principal do ponto de venda
// =============================================
import { useEffect } from 'react';
import { usePDVStore } from '../store/usePDVStore';
import { useAppStore } from '../store/useAppStore';
import ModalAberturaCaixa from '../components/pdv/ModalAberturaCaixa';
import BuscaProduto from '../components/pdv/BuscaProduto';
import Carrinho from '../components/pdv/Carrinho';
import ModalPagamento from '../components/pdv/ModalPagamento';
import ModalEspera from '../components/pdv/ModalEspera';
import ModalSangria from '../components/pdv/ModalSangria';
import { formatarMoeda, formatarDataHora } from '../utils/formatters';
import {
    Monitor, DollarSign, CreditCard, QrCode,
    ArrowRightLeft, Clock, LogOut, Maximize,
    Banknote,
} from 'lucide-react';

export default function PDV() {
    const {
        caixaAberto, caixa,
        setModalPagamento, setModalEspera, setModalSangria,
        vendasEspera, itens, limparCarrinho,
        salvarEmEspera,
    } = usePDVStore();
    const { adicionarToast } = useAppStore();

    // Atalhos de teclado globais
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (!caixaAberto) return;

            // F4 = Pagamento
            if (e.key === 'F4') {
                e.preventDefault();
                if (itens.length > 0) setModalPagamento(true);
            }

            // F9 = Salvar em espera
            if (e.key === 'F9') {
                e.preventDefault();
                if (itens.length > 0) {
                    salvarEmEspera();
                    adicionarToast({ tipo: 'info', titulo: 'Venda salva em espera' });
                }
            }

            // F10 = Ver vendas em espera
            if (e.key === 'F10') {
                e.preventDefault();
                setModalEspera(true);
            }

            // F6 = Sangria/Suprimento
            if (e.key === 'F6') {
                e.preventDefault();
                setModalSangria(true);
            }

            // Escape = Limpar carrinho (com confirmação)
            if (e.key === 'Escape' && itens.length > 0) {
                e.preventDefault();
                if (confirm('Deseja cancelar a venda atual?')) {
                    limparCarrinho();
                    adicionarToast({ tipo: 'aviso', titulo: 'Venda cancelada' });
                }
            }
        };

        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [caixaAberto, itens, setModalPagamento, setModalEspera, setModalSangria, salvarEmEspera, limparCarrinho, adicionarToast]);

    // Se caixa não está aberto, mostra tela de abertura
    if (!caixaAberto) {
        return <ModalAberturaCaixa />;
    }

    return (
        <div className="h-[calc(100vh-4.5rem)] flex flex-col animate-fade-in">
            {/* Barra de status do caixa */}
            <div className="flex items-center justify-between px-4 py-2 bg-surface-800/60 border-b border-surface-700/50">
                <div className="flex items-center gap-4">
                    {/* Indicador de caixa aberto */}
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse-green" />
                        <span className="text-xs font-semibold text-surface-300 flex items-center gap-1.5">
                            <Monitor size={13} /> Caixa #{caixa?.numero || 1}
                        </span>
                        <span className="text-xs text-surface-500">•</span>
                        <span className="text-xs text-surface-400">{caixa?.operador_nome}</span>
                    </div>

                    {/* Resumo do caixa */}
                    <div className="hidden md:flex items-center gap-3 text-xs text-surface-500">
                        <span className="flex items-center gap-1">
                            <Banknote size={12} className="text-green-400" />
                            {formatarMoeda(caixa?.valor_dinheiro || 0)}
                        </span>
                        <span className="flex items-center gap-1">
                            <CreditCard size={12} className="text-blue-400" />
                            {formatarMoeda((caixa?.valor_cartao_debito || 0) + (caixa?.valor_cartao_credito || 0))}
                        </span>
                        <span className="flex items-center gap-1">
                            <QrCode size={12} className="text-cyan-400" />
                            {formatarMoeda(caixa?.valor_pix || 0)}
                        </span>
                        <span className="flex items-center gap-1">
                            <DollarSign size={12} className="text-brand-400" />
                            Vendas: {caixa?.total_vendas || 0}
                        </span>
                    </div>
                </div>

                {/* Ações rápidas */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setModalSangria(true)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-surface-400 hover:text-surface-200 hover:bg-surface-700 transition-colors"
                        title="Sangria/Suprimento (F6)"
                    >
                        <ArrowRightLeft size={13} /> <span className="hidden sm:inline">Sangria</span>
                    </button>

                    <button
                        onClick={() => setModalEspera(true)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-surface-400 hover:text-surface-200 hover:bg-surface-700 transition-colors relative"
                        title="Vendas em Espera (F10)"
                    >
                        <Clock size={13} /> <span className="hidden sm:inline">Espera</span>
                        {vendasEspera.length > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent-600 text-white text-[10px] font-bold flex items-center justify-center">
                                {vendasEspera.length}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => window.open(window.location.href + '?mode=standalone', '_blank')}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-surface-400 hover:text-surface-200 hover:bg-surface-700 transition-colors"
                        title="Tela cheia"
                    >
                        <Maximize size={13} />
                    </button>

                    <button
                        onClick={() => {
                            if (confirm('Deseja fechar o caixa?')) {
                                usePDVStore.getState().fecharCaixa();
                                adicionarToast({ tipo: 'info', titulo: 'Caixa fechado' });
                            }
                        }}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                        title="Fechar Caixa"
                    >
                        <LogOut size={13} /> <span className="hidden sm:inline">Fechar</span>
                    </button>
                </div>
            </div>

            {/* Corpo principal: Busca (esquerda) + Carrinho (direita) */}
            <div className="flex-1 flex overflow-hidden">
                {/* Área de busca e produtos */}
                <div className="flex-1 p-4 overflow-hidden flex flex-col">
                    <BuscaProduto />
                </div>

                {/* Carrinho lateral — largura fixa */}
                <div className="w-[340px] xl:w-[380px] shrink-0 overflow-hidden">
                    <Carrinho />
                </div>
            </div>

            {/* Barra de atalhos no rodapé */}
            <div className="flex items-center gap-4 px-4 py-1.5 bg-surface-800/40 border-t border-surface-700/50 text-[10px] text-surface-500">
                <span><kbd className="px-1 py-0.5 bg-surface-700 rounded text-surface-400 font-mono">F2</kbd> Buscar</span>
                <span><kbd className="px-1 py-0.5 bg-surface-700 rounded text-surface-400 font-mono">F4</kbd> Pagamento</span>
                <span><kbd className="px-1 py-0.5 bg-surface-700 rounded text-surface-400 font-mono">F6</kbd> Sangria</span>
                <span><kbd className="px-1 py-0.5 bg-surface-700 rounded text-surface-400 font-mono">F9</kbd> Espera</span>
                <span><kbd className="px-1 py-0.5 bg-surface-700 rounded text-surface-400 font-mono">F10</kbd> Ver Esperas</span>
                <span><kbd className="px-1 py-0.5 bg-surface-700 rounded text-surface-400 font-mono">ESC</kbd> Cancelar</span>
                <span className="ml-auto text-surface-600">
                    {caixa?.aberto_em && `Aberto: ${formatarDataHora(caixa.aberto_em)}`}
                </span>
            </div>

            {/* Modais */}
            <ModalPagamento />
            <ModalEspera />
            <ModalSangria />
        </div>
    );
}
