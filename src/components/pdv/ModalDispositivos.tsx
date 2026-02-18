// =============================================
// Componente: ModalDispositivos
// Configuração de Balança e Impressora Térmica no PDV
// =============================================
import { useState, useRef, useCallback } from 'react';
import Modal from '../ui/Modal';
import {
    Scale, Printer, Plug, Loader2, CheckCircle,
    XCircle, Usb, Cable, TestTube2, AlertTriangle,
    RefreshCw, Weight,
} from 'lucide-react';
import {
    BalancaService, ImpressoraService,
    CONFIGS_BALANCA,
    imprimirCupomNavegador,
    type ConfigBalanca, type ConfigImpressora,
    type ProtocoloBalanca,
} from '../../services/dispositivos';
import { usePDVStore } from '../../store/usePDVStore';
import { useAppStore } from '../../store/useAppStore';

// =============================================
// Singleton dos serviços (persiste entre re-renders)
// =============================================
const balancaService = new BalancaService();
const impressoraService = new ImpressoraService({
    tipo: 'usb',
    baudRate: 9600,
    colunas: 48,
    cortarPapel: true,
    abrirGaveta: false,
    nomeLoja: '',
    cnpjLoja: '',
    enderecoLoja: '',
    rodape: '',
});

// Expõe os serviços para uso externo (ex: imprimir após venda)
export { balancaService, impressoraService };

// =============================================
// ESTADO PERSISTIDO VIA LOCALSTORAGE
// =============================================
const STORAGE_KEY_IMPRESSORA = 'pdv_config_impressora';
const STORAGE_KEY_BALANCA_PROTOCOLO = 'pdv_config_balanca_protocolo';

function carregarConfigImpressora(): Partial<ConfigImpressora> {
    try {
        const s = localStorage.getItem(STORAGE_KEY_IMPRESSORA);
        return s ? JSON.parse(s) : {};
    } catch { return {}; }
}

function salvarConfigImpressora(c: ConfigImpressora) {
    localStorage.setItem(STORAGE_KEY_IMPRESSORA, JSON.stringify(c));
}

function carregarProtocoloBalanca(): ProtocoloBalanca {
    return (localStorage.getItem(STORAGE_KEY_BALANCA_PROTOCOLO) as ProtocoloBalanca) || 'toledo';
}

// =============================================
// LABELS AMIGÁVEIS
// =============================================
const LABELS_PROTOCOLO: Record<ProtocoloBalanca, string> = {
    toledo: 'Toledo Prix 3/4/5/6 (mais comum)',
    filizola: 'Filizola MF / BP',
    urano: 'Urano US',
    generica: 'Genérica (outros)',
};

const INFO_PROTOCOLO: Record<ProtocoloBalanca, string> = {
    toledo: '9600 bps, 8N1 — Formato: ST,+0000.000 kg',
    filizola: '4800 bps, 7E1 — Formato: 0001500 (7 dígitos)',
    urano: '9600 bps, 8N1 — Protocolo similar ao Toledo',
    generica: '9600 bps, 8N1 — Detecta automaticamente',
};

// =============================================
// COMPONENTE PRINCIPAL
// =============================================
interface Props {
    aberto: boolean;
    onFechar: () => void;
}

export default function ModalDispositivos({ aberto, onFechar }: Props) {
    const { caixa, itens, subtotal, totalDesconto, total } = usePDVStore();
    const { adicionarToast } = useAppStore();

    const [aba, setAba] = useState<'balanca' | 'impressora'>('balanca');

    // --- Estado da balança ---
    const [protocoloBalanca, setProtocoloBalanca] = useState<ProtocoloBalanca>(carregarProtocoloBalanca);
    const [balancaConectada, setBalancaConectada] = useState(false);
    const [pesoAtual, setPesoAtual] = useState<number | null>(null);
    const [conectandoBalanca, setConectandoBalanca] = useState(false);
    const [erroBalanca, setErroBalanca] = useState('');

    // --- Estado da impressora ---
    const configSalva = carregarConfigImpressora();
    const [configImpressora, setConfigImpressora] = useState<ConfigImpressora>({
        tipo: 'usb',
        baudRate: 9600,
        colunas: 48,
        cortarPapel: true,
        abrirGaveta: false,
        nomeLoja: 'Hortifruti Master',
        cnpjLoja: '',
        enderecoLoja: '',
        rodape: 'Obrigado pela preferencia! Volte sempre!',
        ...configSalva,
    });
    const [impressoraConectada, setImpressoraConectada] = useState(false);
    const [conectandoImpressora, setConectandoImpressora] = useState(false);
    const [erroImpressora, setErroImpressora] = useState('');
    const [testando, setTestando] = useState(false);

    const pesoRef = useRef<number | null>(null);

    // Verificar suporte às APIs
    const suportaSerial = 'serial' in navigator;
    const suportaUSB = 'usb' in navigator;

    // -----------------------------------------------
    // BALANÇA — conexão
    // -----------------------------------------------
    const conectarBalanca = useCallback(async () => {
        setConectandoBalanca(true);
        setErroBalanca('');
        try {
            const config: ConfigBalanca = CONFIGS_BALANCA[protocoloBalanca];
            await balancaService.conectar(
                config,
                (peso) => {
                    pesoRef.current = peso;
                    setPesoAtual(peso);
                },
                (err) => {
                    setErroBalanca(err);
                    setBalancaConectada(false);
                }
            );
            setBalancaConectada(true);
            localStorage.setItem(STORAGE_KEY_BALANCA_PROTOCOLO, protocoloBalanca);
            adicionarToast({ tipo: 'sucesso', titulo: '⚖️ Balança conectada', mensagem: `Protocolo ${protocoloBalanca}` });
        } catch (err: any) {
            setErroBalanca(err.message);
            adicionarToast({ tipo: 'erro', titulo: 'Erro ao conectar balança', mensagem: err.message });
        } finally {
            setConectandoBalanca(false);
        }
    }, [protocoloBalanca, adicionarToast]);

    const desconectarBalanca = useCallback(async () => {
        await balancaService.desconectar();
        setBalancaConectada(false);
        setPesoAtual(null);
        pesoRef.current = null;
        adicionarToast({ tipo: 'info', titulo: 'Balança desconectada' });
    }, [adicionarToast]);

    // -----------------------------------------------
    // IMPRESSORA — conexão
    // -----------------------------------------------
    const salvarConfig = () => {
        impressoraService.config = configImpressora;
        salvarConfigImpressora(configImpressora);
    };

    const conectarImpressoraUSB = async () => {
        setConectandoImpressora(true);
        setErroImpressora('');
        salvarConfig();
        try {
            await impressoraService.conectarUSB();
            setImpressoraConectada(true);
            adicionarToast({ tipo: 'sucesso', titulo: '🖨️ Impressora USB conectada' });
        } catch (err: any) {
            setErroImpressora(err.message);
            adicionarToast({ tipo: 'erro', titulo: 'Erro ao conectar impressora', mensagem: err.message });
        } finally {
            setConectandoImpressora(false);
        }
    };

    const conectarImpressoraSerial = async () => {
        setConectandoImpressora(true);
        setErroImpressora('');
        salvarConfig();
        try {
            await impressoraService.conectarSerial();
            setImpressoraConectada(true);
            adicionarToast({ tipo: 'sucesso', titulo: '🖨️ Impressora Serial conectada' });
        } catch (err: any) {
            setErroImpressora(err.message);
            adicionarToast({ tipo: 'erro', titulo: 'Erro ao conectar impressora', mensagem: err.message });
        } finally {
            setConectandoImpressora(false);
        }
    };

    const desconectarImpressora = async () => {
        await impressoraService.desconectar();
        setImpressoraConectada(false);
        adicionarToast({ tipo: 'info', titulo: 'Impressora desconectada' });
    };

    const testarImpressora = async () => {
        setTestando(true);
        try {
            await impressoraService.testar();
            adicionarToast({ tipo: 'sucesso', titulo: 'Teste enviado com sucesso!' });
        } catch (err: any) {
            adicionarToast({ tipo: 'erro', titulo: 'Erro no teste', mensagem: err.message });
        } finally {
            setTestando(false);
        }
    };

    const imprimirCupomFallback = () => {
        salvarConfig();
        const sub = subtotal();
        const desc = totalDesconto();
        const tot = total();
        imprimirCupomNavegador({
            nomeLoja: configImpressora.nomeLoja || 'Hortifruti Master',
            cnpjLoja: configImpressora.cnpjLoja,
            enderecoLoja: configImpressora.enderecoLoja,
            rodape: configImpressora.rodape,
            operador: caixa?.operador_nome || 'Operador',
            colunas: configImpressora.colunas,
            numeroCaixa: caixa?.numero || 1,
            itens: itens.map(i => ({
                nome: i.produto.nome,
                quantidade: i.quantidade,
                unidade: i.produto.unidade,
                preco_unitario: i.preco_unitario,
                desconto: i.desconto,
                subtotal: i.subtotal,
            })),
            subtotal: sub,
            desconto: desc,
            total: tot,
            formaPagamento: 'dinheiro',
            valorPago: tot,
            troco: 0,
            dataHora: new Date(),
        });
    };

    // Limpeza ao fechar
    const handleFechar = () => {
        salvarConfig();
        onFechar();
    };

    // -----------------------------------------------
    // RENDER
    // -----------------------------------------------
    const inputClass = "w-full bg-surface-700/50 border border-surface-600 rounded-xl px-3 py-2 text-sm text-surface-100 placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all";
    const labelClass = "text-xs font-semibold text-surface-400 uppercase tracking-wider";

    return (
        <Modal aberto={aberto} onFechar={handleFechar} titulo="Dispositivos do PDV" tamanho="sm">
            <div className="space-y-4">

                {/* Aviso de suporte */}
                {!suportaSerial && !suportaUSB && (
                    <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-xs text-yellow-300">
                        <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                        <span>Use <strong>Google Chrome</strong> ou <strong>Microsoft Edge</strong> para conectar dispositivos físicos via USB/Serial.</span>
                    </div>
                )}

                {/* Abas */}
                <div className="flex gap-1 bg-surface-800 rounded-xl p-1">
                    <button
                        onClick={() => setAba('balanca')}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${aba === 'balanca' ? 'bg-surface-600 text-surface-100' : 'text-surface-400 hover:text-surface-200'}`}
                    >
                        <Scale size={15} />
                        Balança
                        {balancaConectada && <span className="w-2 h-2 rounded-full bg-green-400" />}
                    </button>
                    <button
                        onClick={() => setAba('impressora')}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${aba === 'impressora' ? 'bg-surface-600 text-surface-100' : 'text-surface-400 hover:text-surface-200'}`}
                    >
                        <Printer size={15} />
                        Impressora
                        {impressoraConectada && <span className="w-2 h-2 rounded-full bg-green-400" />}
                    </button>
                </div>

                {/* ====== ABA BALANÇA ====== */}
                {aba === 'balanca' && (
                    <div className="space-y-4">
                        {/* Display do peso */}
                        <div className={`relative p-5 rounded-2xl border text-center transition-all ${balancaConectada
                            ? 'bg-green-500/5 border-green-500/30'
                            : 'bg-surface-700/30 border-surface-600/50'
                            }`}>
                            <Weight size={20} className={`mx-auto mb-2 ${balancaConectada ? 'text-green-400' : 'text-surface-500'}`} />
                            <p className={`text-4xl font-bold font-mono ${balancaConectada ? 'text-green-400' : 'text-surface-600'}`}>
                                {pesoAtual !== null ? `${pesoAtual.toFixed(3)} kg` : '---.- kg'}
                            </p>
                            <p className="text-xs text-surface-500 mt-1">
                                {balancaConectada ? `Conectada • ${LABELS_PROTOCOLO[protocoloBalanca].split(' ')[0]}` : 'Desconectada'}
                            </p>
                            {balancaConectada && pesoAtual !== null && pesoAtual > 0 && (
                                <div className="absolute top-2 right-2">
                                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse block" />
                                </div>
                            )}
                        </div>

                        {/* Protocolo */}
                        {!balancaConectada && (
                            <div className="space-y-2">
                                <label className={labelClass}>Modelo / Protocolo</label>
                                <div className="space-y-1.5">
                                    {(Object.keys(CONFIGS_BALANCA) as ProtocoloBalanca[]).map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => setProtocoloBalanca(p)}
                                            className={`w-full text-left px-3 py-2.5 rounded-xl border text-sm transition-colors ${protocoloBalanca === p
                                                ? 'bg-brand-600/20 border-brand-500/50 text-brand-300'
                                                : 'bg-surface-700/30 border-surface-600/50 text-surface-400 hover:border-surface-500 hover:text-surface-200'
                                                }`}
                                        >
                                            <p className="font-semibold">{LABELS_PROTOCOLO[p]}</p>
                                            <p className="text-[10px] opacity-60 mt-0.5">{INFO_PROTOCOLO[p]}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Erro */}
                        {erroBalanca && (
                            <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                                <XCircle size={13} /> {erroBalanca}
                            </div>
                        )}

                        {/* Botões */}
                        <div className="flex gap-2">
                            {!balancaConectada ? (
                                <button
                                    onClick={conectarBalanca}
                                    disabled={conectandoBalanca || !suportaSerial}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                >
                                    {conectandoBalanca
                                        ? <><Loader2 size={15} className="animate-spin" /> Conectando...</>
                                        : <><Plug size={15} /> Conectar Balança</>
                                    }
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setPesoAtual(null)}
                                        className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-medium text-surface-300 bg-surface-700/50 hover:bg-surface-700 transition-colors"
                                        title="Zerar display"
                                    >
                                        <RefreshCw size={14} />
                                    </button>
                                    <button
                                        onClick={desconectarBalanca}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-red-300 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                                    >
                                        <XCircle size={15} /> Desconectar
                                    </button>
                                </>
                            )}
                        </div>

                        {!suportaSerial && (
                            <p className="text-center text-[10px] text-surface-500">
                                ⚠️ Web Serial API não disponível. Use Chrome ou Edge.
                            </p>
                        )}
                    </div>
                )}

                {/* ====== ABA IMPRESSORA ====== */}
                {aba === 'impressora' && (
                    <div className="space-y-4">
                        {/* Status */}
                        <div className={`flex items-center gap-3 p-3 rounded-xl border ${impressoraConectada
                            ? 'bg-green-500/5 border-green-500/30'
                            : 'bg-surface-700/30 border-surface-600/50'
                            }`}>
                            <Printer size={20} className={impressoraConectada ? 'text-green-400' : 'text-surface-500'} />
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-surface-200">
                                    {impressoraConectada ? 'Impressora Conectada' : 'Nenhuma impressora conectada'}
                                </p>
                                <p className="text-xs text-surface-500">
                                    {impressoraConectada
                                        ? `ESC/POS • ${configImpressora.colunas} colunas`
                                        : 'Conecte via USB ou porta Serial'}
                                </p>
                            </div>
                            {impressoraConectada && <CheckCircle size={16} className="text-green-400" />}
                        </div>

                        {/* Configurações da loja */}
                        <div className="space-y-3">
                            <label className={labelClass}>Dados do Cupom</label>
                            <input
                                value={configImpressora.nomeLoja}
                                onChange={e => setConfigImpressora(p => ({ ...p, nomeLoja: e.target.value }))}
                                placeholder="Nome da loja *"
                                className={inputClass}
                            />
                            <input
                                value={configImpressora.cnpjLoja}
                                onChange={e => setConfigImpressora(p => ({ ...p, cnpjLoja: e.target.value }))}
                                placeholder="CNPJ (opcional)"
                                className={inputClass}
                            />
                            <input
                                value={configImpressora.enderecoLoja}
                                onChange={e => setConfigImpressora(p => ({ ...p, enderecoLoja: e.target.value }))}
                                placeholder="Endereço (opcional)"
                                className={inputClass}
                            />
                            <input
                                value={configImpressora.rodape}
                                onChange={e => setConfigImpressora(p => ({ ...p, rodape: e.target.value }))}
                                placeholder="Mensagem de rodapé"
                                className={inputClass}
                            />
                        </div>

                        {/* Opções técnicas */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={`${labelClass} block mb-1.5`}>Colunas</label>
                                <select
                                    value={configImpressora.colunas}
                                    onChange={e => setConfigImpressora(p => ({ ...p, colunas: Number(e.target.value) }))}
                                    className={inputClass}
                                >
                                    <option value={40}>40 col (58mm)</option>
                                    <option value={48}>48 col (80mm)</option>
                                </select>
                            </div>
                            <div>
                                <label className={`${labelClass} block mb-1.5`}>Baud Rate</label>
                                <select
                                    value={configImpressora.baudRate}
                                    onChange={e => setConfigImpressora(p => ({ ...p, baudRate: Number(e.target.value) }))}
                                    className={inputClass}
                                >
                                    <option value={9600}>9600</option>
                                    <option value={19200}>19200</option>
                                    <option value={38400}>38400</option>
                                    <option value={115200}>115200</option>
                                </select>
                            </div>
                        </div>

                        {/* Checkboxes */}
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={configImpressora.cortarPapel}
                                    onChange={e => setConfigImpressora(p => ({ ...p, cortarPapel: e.target.checked }))}
                                    className="w-4 h-4 accent-brand-500"
                                />
                                <span className="text-sm text-surface-300">Cortar papel</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={configImpressora.abrirGaveta}
                                    onChange={e => setConfigImpressora(p => ({ ...p, abrirGaveta: e.target.checked }))}
                                    className="w-4 h-4 accent-brand-500"
                                />
                                <span className="text-sm text-surface-300">Abrir gaveta</span>
                            </label>
                        </div>

                        {/* Erro */}
                        {erroImpressora && (
                            <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                                <XCircle size={13} /> {erroImpressora}
                            </div>
                        )}

                        {/* Botões de conexão */}
                        {!impressoraConectada ? (
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={conectarImpressoraUSB}
                                    disabled={conectandoImpressora || !suportaUSB}
                                    className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                    title="Conectar via USB direto (Web USB)"
                                >
                                    {conectandoImpressora
                                        ? <Loader2 size={14} className="animate-spin" />
                                        : <Usb size={14} />
                                    }
                                    USB
                                </button>
                                <button
                                    onClick={conectarImpressoraSerial}
                                    disabled={conectandoImpressora || !suportaSerial}
                                    className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                    title="Conectar via porta Serial / USB-Serial"
                                >
                                    {conectandoImpressora
                                        ? <Loader2 size={14} className="animate-spin" />
                                        : <Cable size={14} />
                                    }
                                    Serial
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={testarImpressora}
                                    disabled={testando}
                                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-brand-300 bg-brand-600/10 border border-brand-500/20 hover:bg-brand-600/20 transition-colors disabled:opacity-40"
                                >
                                    {testando ? <Loader2 size={14} className="animate-spin" /> : <TestTube2 size={14} />}
                                    Testar
                                </button>
                                <button
                                    onClick={desconectarImpressora}
                                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-red-300 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                                >
                                    <XCircle size={14} /> Desconectar
                                </button>
                            </div>
                        )}

                        {/* Impressão pelo navegador (fallback) */}
                        <div className="pt-2 border-t border-surface-700">
                            <p className="text-[10px] text-surface-500 mb-2 text-center">
                                Alternativa: imprimir pelo diálogo do navegador
                            </p>
                            <button
                                onClick={imprimirCupomFallback}
                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium text-surface-400 bg-surface-700/40 hover:bg-surface-700 border border-surface-600/50 transition-colors"
                            >
                                <Printer size={13} /> Imprimir via Navegador (PDF/Papel)
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}
