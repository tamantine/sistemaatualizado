// =============================================
// Componente: Cupom Não Fiscal
// Exibido após finalizar uma venda no PDV
// Suporta impressão via navegador (janela popup)
// =============================================
import { useRef } from 'react';
import { formatarMoeda } from '../../utils/formatters';
import { Printer, X, Receipt } from 'lucide-react';

interface ItemCupom {
    nome: string;
    quantidade: number;
    unidade: string;
    preco_unitario: number;
    desconto: number;
    subtotal: number;
}

interface CupomNaoFiscalProps {
    venda: {
        id: string;
        cliente_nome?: string;
        operador_nome?: string;
        data: string;
        forma_pagamento: string;
        total: number;
        subtotal?: number;
        desconto?: number;
        troco?: number;
        valor_pago?: number;
        pagamentos?: { forma: string; valor: number }[];
    };
    itens: ItemCupom[];
    onFechar: () => void;
}

// Labels amigáveis para forma de pagamento
const labelPagamento: Record<string, string> = {
    dinheiro: '💵 Dinheiro',
    debito: '💳 Cartão Débito',
    credito: '💳 Cartão Crédito',
    pix: '📱 PIX',
    multiplo: '🔀 Multiplos',
};

// Recupera configurações da impressora salvas em localStorage
function getConfigLoja() {
    try {
        const s = localStorage.getItem('pdv_config_impressora');
        if (s) return JSON.parse(s);
    } catch { /* ok */ }
    return {};
}

export default function CupomNaoFiscal({ venda, itens, onFechar }: CupomNaoFiscalProps) {
    const printRef = useRef<HTMLDivElement>(null);
    const config = getConfigLoja();

    const nomeLoja = config.nomeLoja || 'HORTIFRUTI MASTER';
    const cnpjLoja = config.cnpjLoja || '';
    const enderecoLoja = config.enderecoLoja || '';
    const rodapeLoja = config.rodape || 'Obrigado pela preferência! Volte sempre!';

    const handlePrint = () => {
        const printContent = printRef.current;
        if (!printContent) return;

        const printWindow = window.open('', '_blank', 'width=340,height=700');
        if (!printWindow) {
            alert('Permita pop-ups para imprimir o cupom.');
            return;
        }

        const styles = `
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.3; background: white; color: black; }
                .cupom { width: 300px; padding: 8px; }
                .sep-dashed { border: none; border-top: 1px dashed #000; margin: 6px 0; }
                .sep-solid { border: none; border-top: 2px solid #000; margin: 6px 0; }
                .titulo { text-align: center; font-weight: bold; font-size: 15px; text-transform: uppercase; }
                .subtitulo { text-align: center; font-size: 10px; color: #333; }
                .center { text-align: center; }
                .bold { font-weight: bold; }
                .item-row { display: flex; justify-content: space-between; font-size: 11px; margin: 2px 0; }
                .item-nome { flex: 1; font-weight: bold; word-break: break-word; }
                .item-detalhe { display: flex; justify-content: space-between; font-size: 10px; color: #555; margin-left: 8px; }
                .item-desc { font-size: 10px; color: #dc2626; margin-left: 8px; }
                .total-section { margin: 4px 0; }
                .total-row { display: flex; justify-content: space-between; font-size: 12px; padding: 1px 0; }
                .total-grande { font-size: 16px; font-weight: bold; text-align: center; padding: 6px 0; border-top: 2px solid #000; border-bottom: 2px solid #000; margin: 4px 0; }
                .pgto-row { display: flex; justify-content: space-between; font-size: 11px; padding: 1px 0; }
                .troco { color: #16a34a; font-weight: bold; }
                .rodape { text-align: center; font-size: 10px; margin-top: 10px; color: #555; }
                .doc-id { text-align: center; font-size: 9px; color: #aaa; margin-top: 6px; letter-spacing: 1px; }
                .cupom-header { text-align: center; background: #000; color: #fff; padding: 4px; font-weight: bold; font-size: 11px; margin-bottom: 6px; }
                .pgto-badge { display: inline-block; background: #000; color: #fff; font-size: 10px; padding: 2px 6px; border-radius: 3px; }
                @media print {
                    @page { margin: 0; size: 80mm auto; }
                    body { width: 80mm; }
                    .no-print { display: none; }
                }
            </style>
        `;

        printWindow.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Cupom</title>${styles}</head><body>`);
        printWindow.document.write(printContent.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();

        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 400);
    };

    const dataFormatada = new Date(venda.data).toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    });

    const subtotal = venda.subtotal ?? itens.reduce((acc, item) => acc + (item.quantidade * item.preco_unitario), 0);
    const totalDesconto = venda.desconto ?? itens.reduce((acc, item) => acc + item.desconto, 0);

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-4 animate-fade-in">
            <div className="bg-surface-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-surface-600">
                {/* Header */}
                <div className="bg-gradient-to-r from-brand-600 to-brand-700 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Receipt size={20} className="text-white" />
                        <div>
                            <h2 className="text-white font-bold text-sm">✅ Venda Finalizada!</h2>
                            <p className="text-brand-200 text-xs">Cupom pronto para impressão</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-white font-bold text-lg">{formatarMoeda(venda.total)}</p>
                        <p className="text-brand-200 text-xs">{labelPagamento[venda.forma_pagamento] || venda.forma_pagamento}</p>
                    </div>
                </div>

                {/* Preview do cupom */}
                <div className="p-4 max-h-[65vh] overflow-y-auto custom-scrollbar">
                    <div
                        ref={printRef}
                        className="bg-white text-black p-3 rounded text-xs font-mono border border-gray-200"
                        style={{ fontFamily: "'Courier New', monospace", fontSize: '11px', lineHeight: '1.3' }}
                    >
                        {/* Cabeçalho */}
                        <div className="titulo">{nomeLoja}</div>
                        {enderecoLoja && <div className="subtitulo">{enderecoLoja}</div>}
                        {cnpjLoja && <div className="subtitulo">CNPJ: {cnpjLoja}</div>}

                        <div className="sep-solid"></div>
                        <div className="cupom-header">CUPOM NÃO FISCAL</div>
                        <div className="sep-dashed"></div>

                        {/* Dados da venda */}
                        <div className="subtitulo" style={{ textAlign: 'left', fontSize: '10px' }}>
                            <div>Data: {dataFormatada}</div>
                            {venda.operador_nome && <div>Operador: {venda.operador_nome}</div>}
                            {venda.cliente_nome && <div>Cliente: {venda.cliente_nome}</div>}
                        </div>

                        <div className="sep-dashed"></div>

                        {/* Cabeçalho itens */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 'bold', borderBottom: '1px solid #ccc', paddingBottom: '2px', marginBottom: '3px' }}>
                            <span style={{ flex: 1 }}>PRODUTO</span>
                            <span style={{ width: '50px', textAlign: 'center' }}>QTD</span>
                            <span style={{ width: '60px', textAlign: 'right' }}>VALOR</span>
                        </div>

                        {/* Itens */}
                        {itens.map((item, index) => (
                            <div key={index} style={{ marginBottom: '4px' }}>
                                <div className="item-row">
                                    <span className="item-nome">{index + 1}. {item.nome}</span>
                                </div>
                                <div className="item-detalhe">
                                    <span>
                                        {item.quantidade.toFixed(item.unidade === 'KG' ? 3 : 0)} {item.unidade}
                                        {' × '}R$ {item.preco_unitario.toFixed(2)}
                                    </span>
                                    <span style={{ fontWeight: 'bold' }}>R$ {item.subtotal.toFixed(2)}</span>
                                </div>
                                {item.desconto > 0 && (
                                    <div className="item-desc">  Desconto: -R$ {item.desconto.toFixed(2)}</div>
                                )}
                            </div>
                        ))}

                        <div className="sep-dashed"></div>

                        {/* Totais */}
                        <div className="total-section">
                            {totalDesconto > 0 && (
                                <>
                                    <div className="total-row">
                                        <span>Subtotal:</span>
                                        <span>R$ {subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="total-row" style={{ color: '#dc2626' }}>
                                        <span>Desconto:</span>
                                        <span>-R$ {totalDesconto.toFixed(2)}</span>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="total-grande">
                            TOTAL: R$ {venda.total.toFixed(2)}
                        </div>

                        {/* Pagamentos */}
                        <div className="total-section">
                            {venda.pagamentos && venda.pagamentos.length > 0 ? (
                                <>
                                    {venda.pagamentos.map((p, i) => (
                                        <div key={i} className="pgto-row">
                                            <span>{labelPagamento[p.forma] || p.forma.toUpperCase()}:</span>
                                            <span style={{ fontWeight: 'bold' }}>R$ {p.valor.toFixed(2)}</span>
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <div className="pgto-row">
                                    <span>{labelPagamento[venda.forma_pagamento] || venda.forma_pagamento.toUpperCase()}:</span>
                                    <span style={{ fontWeight: 'bold' }}>R$ {(venda.valor_pago || venda.total).toFixed(2)}</span>
                                </div>
                            )}
                            {(venda.troco ?? 0) > 0 && (
                                <div className="pgto-row troco">
                                    <span>TROCO:</span>
                                    <span>R$ {(venda.troco ?? 0).toFixed(2)}</span>
                                </div>
                            )}
                        </div>

                        <div className="sep-solid"></div>

                        {/* Rodapé */}
                        <div className="rodape">
                            <div style={{ fontWeight: 'bold', fontSize: '11px' }}>{rodapeLoja}</div>
                        </div>

                        <div className="doc-id">
                            #{venda.id.substring(0, 12).toUpperCase()}
                        </div>
                    </div>
                </div>

                {/* Botões de ação */}
                <div className="px-4 pb-4 flex gap-2">
                    <button
                        onClick={handlePrint}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 transition-all shadow-lg shadow-brand-600/25"
                    >
                        <Printer size={16} /> Imprimir Cupom
                    </button>
                    <button
                        onClick={onFechar}
                        className="flex items-center justify-center gap-1 px-4 py-3 rounded-xl text-sm font-semibold text-surface-300 bg-surface-700 hover:bg-surface-600 transition-colors"
                    >
                        <X size={16} /> Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}
