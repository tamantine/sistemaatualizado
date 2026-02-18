// =============================================
// Página: PDV Standalone — Tela Cheia
// Abre o PDV sem o layout principal, em fullscreen
// =============================================
import { useEffect, useRef } from 'react';
import { usePDVStore } from '../store/usePDVStore';
import { useAppStore } from '../store/useAppStore';
import ModalAberturaCaixa from '../components/pdv/ModalAberturaCaixa';
import BuscaProduto from '../components/pdv/BuscaProduto';
import Carrinho from '../components/pdv/Carrinho';
import ModalPagamento from '../components/pdv/ModalPagamento';
import ModalEspera from '../components/pdv/ModalEspera';
import ModalSangria from '../components/pdv/ModalSangria';
import ToastContainer from '../components/ui/Toast';
import { formatarMoeda, formatarDataHora } from '../utils/formatters';
import {
    Monitor, DollarSign, CreditCard, QrCode,
    ArrowRightLeft, Clock, LogOut, Minimize,
    Banknote,
} from 'lucide-react';

export default function PDVStandalone() {
    const containerRef = useRef<HTMLDivElement>(null);

    const {
        caixaAberto, caixa,
        setModalPagamento, setModalEspera, setModalSangria,
        vendasEspera, itens, limparCarrinho,
        salvarEmEspera,
        carregarProdutos,
        verificarCaixaAberto,
    } = usePDVStore();
    const { adicionarToast } = useAppStore();

    // Ao montar: verifica caixa, carrega produtos e entra em fullscreen
    useEffect(() => {
        verificarCaixaAberto();
        carregarProdutos();

        // Solicitar tela cheia automaticamente
        const el = document.documentElement;
        if (el.requestFullscreen) {
            el.requestFullscreen().catch(() => {
                // Usuário pode ter bloqueado — sem problema
            });
        }

        return () => {
            // Sair do fullscreen ao desmontar (fechar aba)
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => {});
            }
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Atalhos de teclado globais
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (!caixaAberto) return;

            if (e.key === 'F4') {
                e.preventDefault();
                if (itens.length > 0) setModalPagamento(true);
            }
            if (e.key === 'F9') {
                e.preventDefault();
                if (itens.length > 0) {
                    salvarEmEspera();
                    adicionarToast({ tipo: 'info', titulo: 'Venda salva em espera' });
                }
            }
            if (e.key === 'F10') {
                e.preventDefault();
                setModalEspera(true);
            }
            if (e.key === 'F6') {
                e.preventDefault();
                setModalSangria(true);
            }
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

    const sairFullscreen = () => {
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
        }
        window.close();
    };

    // Se caixa não está aberto, mostra tela de abertura
    if (!caixaAberto) {
        return (
            <div ref={containerRef} className="min-h-screen bg-surface-900 flex items-center justify-center">
                <ModalAberturaCaixa />
                <ToastContainer />
            </div>
        );
    }

    return (
        <div ref={containerRef} className="h-screen flex flex-col bg-surface-900 animate-fade-in">
            {/* Barra de status do caixa */}
            <div className="flex items-center justify-between px-4 py-2 bg-surface-800/60 border-b border-surface-700/50">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse-green" />
                        <span className="text-xs font-semibold text-surface-300 flex items-center gap-1.5">
                            <Monitor size={13} /> Caixa #{caixa?.numero || 1}
                        </span>
                        <span className="text-xs text-surface-500">•</span>
                        <span className="text-xs text-surface-400">{caixa?.operador_nome}</span>
                        <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-brand-600/20 text-brand-400 font-medium">
                            TELA CHEIA
                        </span>
                    </div>

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
                        onClick={sairFullscreen}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-surface-400 hover:text-surface-200 hover:bg-surface-700 transition-colors"
                        title="Sair da tela cheia"
                    >
                        <Minimize size={13} />
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

            {/* Corpo principal */}
            <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 p-4 overflow-hidden flex flex-col">
                    <BuscaProduto />
                </div>
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

            {/* Toast notifications */}
            <ToastContainer />
        </div>
    );
}
