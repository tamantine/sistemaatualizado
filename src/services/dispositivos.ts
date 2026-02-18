// =============================================
// Serviço de Dispositivos — Balança e Impressora Térmica
// Padrões profissionais usados em PDVs de supermercados
//
// BALANÇA: Protocolo Toledo Prix (mais usado no Brasil)
//          Suporte também a Filizola e protocolo genérico
//          Comunicação via Web Serial API (Chrome/Edge)
//
// IMPRESSORA: Protocolo ESC/POS (Epson TM, Daruma DR800,
//             Elgin i9, Bematech MP-4200 TH, Sweda SI-300)
//             Comunicação via Web USB ou Web Serial
// =============================================

// =============================================
// DECLARAÇÕES DE TIPO — Web Serial e Web USB
// (APIs experimentais do Chrome/Edge, sem tipos nativos no TS)
// =============================================
declare global {
    interface SerialPort {
        open(options: {
            baudRate: number;
            dataBits?: number;
            stopBits?: number;
            parity?: string;
            flowControl?: string;
        }): Promise<void>;
        close(): Promise<void>;
        readonly readable: ReadableStream<Uint8Array> | null;
        readonly writable: WritableStream<Uint8Array> | null;
    }

    interface Serial {
        requestPort(options?: { filters?: object[] }): Promise<SerialPort>;
    }

    interface USBDevice {
        open(): Promise<void>;
        close(): Promise<void>;
        selectConfiguration(configurationValue: number): Promise<void>;
        claimInterface(interfaceNumber: number): Promise<void>;
        transferOut(endpointNumber: number, data: BufferSource): Promise<{ status: string; bytesWritten: number }>;
        readonly configuration: USBConfiguration | null;
    }

    interface USBConfiguration {
        readonly interfaces: USBInterface[];
    }

    interface USBInterface {
        readonly alternates: USBAlternateInterface[];
    }

    interface USBAlternateInterface {
        readonly endpoints: USBEndpoint[];
    }

    interface USBEndpoint {
        readonly endpointNumber: number;
        readonly direction: 'in' | 'out';
        readonly type: 'bulk' | 'interrupt' | 'isochronous';
    }

    interface USB {
        requestDevice(options: { filters: object[] }): Promise<USBDevice>;
    }
}

// =============================================
// TIPOS
// =============================================
export type ProtocoloBalanca = 'toledo' | 'filizola' | 'urano' | 'generica';
export type TipoConexaoImpressora = 'usb' | 'serial';

export interface ConfigBalanca {
    protocolo: ProtocoloBalanca;
    baudRate: number;
    dataBits: number;
    stopBits: number;
    parity: 'none' | 'even' | 'odd';
}

export interface ConfigImpressora {
    tipo: TipoConexaoImpressora;
    baudRate: number;
    colunas: number; // 40 ou 48 colunas (padrão 80mm = 48)
    cortarPapel: boolean;
    abrirGaveta: boolean;
    nomeLoja: string;
    cnpjLoja: string;
    enderecoLoja: string;
    rodape: string;
}

// Configs padrão das balanças mais comuns no Brasil
export const CONFIGS_BALANCA: Record<ProtocoloBalanca, ConfigBalanca> = {
    toledo: {
        protocolo: 'toledo',
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
    },
    filizola: {
        protocolo: 'filizola',
        baudRate: 4800,
        dataBits: 7,
        stopBits: 1,
        parity: 'even',
    },
    urano: {
        protocolo: 'urano',
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
    },
    generica: {
        protocolo: 'generica',
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
    },
};

// =============================================
// PARSER DE PROTOCOLOS DE BALANÇA
// =============================================

/**
 * Toledo Prix 3/4/5/6
 * Formatos: "ST,GS,+0003.560 kg\r\n" ou "ST,+0003.560 kg\r\n" ou "B0003560\r\n"
 */
function parseToledo(data: string): number | null {
    // Formato padrão Toledo: ST,+XXXX.XXX kg
    const matchST = data.match(/ST[,\s][+\-]?(\d+[.,]\d+)\s*kg/i);
    if (matchST) return parseFloat(matchST[1].replace(',', '.'));

    // Formato alternativo Toledo B: B0003560 (em gramas, sem ponto)
    const matchB = data.match(/B(\d{7})/);
    if (matchB) return parseInt(matchB[1]) / 1000;

    // Formato estabilizado: P+00003.560
    const matchP = data.match(/P[+\-]?(\d+[.,]\d+)/);
    if (matchP) return parseFloat(matchP[1].replace(',', '.'));

    return null;
}

/**
 * Filizola MF/BP
 * Formato: "0000200\r\n" (7 dígitos, últimos 3 são decimais)
 * Ex: 0001500 = 1.500 kg
 */
function parseFilizola(data: string): number | null {
    const match = data.match(/(\d{7})/);
    if (match) {
        const raw = parseInt(match[1]);
        // Remove leituras inválidas (todos zeros = sem produto)
        if (raw === 0) return null;
        return raw / 1000;
    }
    return null;
}

/**
 * Urano US — protocolo similar ao Toledo
 * Formato: "ST,+00003.560 kg\r\n"
 */
function parseUrano(data: string): number | null {
    return parseToledo(data); // protocolo similar
}

/**
 * Genérico — tenta extrair qualquer número decimal com unidade de peso
 */
function parseGenerico(data: string): number | null {
    const match = data.match(/[+\-]?(\d+[.,]\d+)\s*(?:kg|Kg|KG)/i);
    if (match) return parseFloat(match[1].replace(',', '.'));
    const matchG = data.match(/[+\-]?(\d+)\s*g\b/i);
    if (matchG) return parseInt(matchG[1]) / 1000;
    return null;
}

export function parsearPeso(protocolo: ProtocoloBalanca, dados: string): number | null {
    switch (protocolo) {
        case 'toledo': return parseToledo(dados);
        case 'filizola': return parseFilizola(dados);
        case 'urano': return parseUrano(dados);
        case 'generica': return parseGenerico(dados);
    }
}

// =============================================
// SERVIÇO DE BALANÇA — Web Serial API
// =============================================
export class BalancaService {
    private port: SerialPort | null = null;
    private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
    private lendo = false;
    private buffer = '';
    public config: ConfigBalanca = CONFIGS_BALANCA.toledo;

    get conectada() { return this.port !== null && this.lendo; }

    async conectar(
        config: ConfigBalanca,
        onPeso: (peso: number) => void,
        onErro?: (msg: string) => void
    ): Promise<void> {
        if (!('serial' in navigator)) {
            throw new Error('Web Serial API não suportada. Use Chrome ou Edge.');
        }

        try {
            this.config = config;
            this.port = await (navigator as any).serial.requestPort({
                filters: [], // Permite qualquer porta serial
            });

            await this.port!.open({
                baudRate: config.baudRate,
                dataBits: config.dataBits as 7 | 8,
                stopBits: config.stopBits as 1 | 2,
                parity: config.parity,
                flowControl: 'none',
            });

            this.lendo = true;
            this.lerContinuamente(onPeso, onErro);
        } catch (err: any) {
            this.port = null;
            this.lendo = false;
            if (err.name === 'NotFoundError') {
                throw new Error('Nenhuma porta selecionada.');
            }
            throw new Error(`Erro ao conectar: ${err.message}`);
        }
    }

    private async lerContinuamente(
        onPeso: (peso: number) => void,
        onErro?: (msg: string) => void
    ) {
        if (!this.port?.readable) return;

        this.reader = this.port.readable.getReader();
        const decoder = new TextDecoder();

        try {
            while (this.lendo) {
                const { value, done } = await this.reader.read();
                if (done) break;

                this.buffer += decoder.decode(value, { stream: true });

                // Processa quando tiver \n ou \r
                const linhas = this.buffer.split(/[\r\n]+/);
                this.buffer = linhas.pop() || '';

                for (const linha of linhas) {
                    if (!linha.trim()) continue;
                    const peso = parsearPeso(this.config.protocolo, linha);
                    if (peso !== null && peso > 0) {
                        onPeso(peso);
                    }
                }
            }
        } catch (err: any) {
            if (this.lendo) { // Não é desconexão manual
                onErro?.(`Erro de leitura: ${err.message}`);
            }
        } finally {
            this.reader?.releaseLock();
            this.reader = null;
        }
    }

    async desconectar(): Promise<void> {
        this.lendo = false;
        try {
            this.reader?.cancel();
        } catch { /* ok */ }
        try {
            await this.port?.close();
        } catch { /* ok */ }
        this.port = null;
        this.buffer = '';
    }
}

// =============================================
// COMANDOS ESC/POS — Impressora Térmica
// Compatível com: Epson TM-T20/T88, Daruma DR800,
//                Elgin i9/i7, Bematech MP-4200 TH,
//                Sweda SI-300/SI-150
// =============================================

// Bytes de controle ESC/POS
const ESC = 0x1B;
const GS = 0x1D;

export class EscPos {
    private bytes: number[] = [];

    // Inicializar impressora
    init(): this {
        this.bytes.push(ESC, 0x40); // ESC @
        return this;
    }

    // Alinhar texto
    alinhar(pos: 'left' | 'center' | 'right'): this {
        const map = { left: 0, center: 1, right: 2 };
        this.bytes.push(ESC, 0x61, map[pos]);
        return this;
    }

    // Negrito
    negrito(on: boolean): this {
        this.bytes.push(ESC, 0x45, on ? 1 : 0);
        return this;
    }

    // Tamanho do texto
    tamanho(duplo: boolean): this {
        this.bytes.push(GS, 0x21, duplo ? 0x11 : 0x00);
        return this;
    }

    // Texto com encoding Windows-1252 (compatível com impressoras BR)
    texto(text: string): this {
        const encoded = this.encodeWin1252(text);
        this.bytes.push(...encoded);
        return this;
    }

    // Linha
    linha(text = ''): this {
        return this.texto(text + '\n');
    }

    // Linha separadora
    separador(char = '-', colunas = 48): this {
        return this.linha(char.repeat(colunas));
    }

    // Duas colunas (esquerda + direita)
    duasColunas(esq: string, dir: string, colunas = 48): this {
        const maxEsq = colunas - dir.length - 1;
        const esqTrunc = esq.substring(0, maxEsq).padEnd(maxEsq);
        return this.linha(`${esqTrunc} ${dir}`);
    }

    // Cortar papel (full cut)
    cortar(full = true): this {
        this.bytes.push(GS, 0x56, full ? 0x00 : 0x01);
        return this;
    }

    // Abrir gaveta de dinheiro
    abrirGaveta(): this {
        this.bytes.push(ESC, 0x70, 0x00, 0x19, 0xFA); // ESC p 0 25 250
        return this;
    }

    // Feed de linhas
    feed(linhas = 3): this {
        this.bytes.push(ESC, 0x64, linhas);
        return this;
    }

    // Encoding Windows-1252 para caracteres BR (ã, ç, etc.)
    private encodeWin1252(text: string): number[] {
        const map: Record<string, number> = {
            'Á': 0xC1, 'À': 0xC0, 'Â': 0xC2, 'Ã': 0xC3, 'Ä': 0xC4,
            'á': 0xE1, 'à': 0xE0, 'â': 0xE2, 'ã': 0xE3, 'ä': 0xE4,
            'É': 0xC9, 'È': 0xC8, 'Ê': 0xCA, 'Ë': 0xCB,
            'é': 0xE9, 'è': 0xE8, 'ê': 0xEA, 'ë': 0xEB,
            'Í': 0xCD, 'Ì': 0xCC, 'Î': 0xCE, 'Ï': 0xCF,
            'í': 0xED, 'ì': 0xEC, 'î': 0xEE, 'ï': 0xEF,
            'Ó': 0xD3, 'Ò': 0xD2, 'Ô': 0xD4, 'Õ': 0xD5, 'Ö': 0xD6,
            'ó': 0xF3, 'ò': 0xF2, 'ô': 0xF4, 'õ': 0xF5, 'ö': 0xF6,
            'Ú': 0xDA, 'Ù': 0xD9, 'Û': 0xDB, 'Ü': 0xDC,
            'ú': 0xFA, 'ù': 0xF9, 'û': 0xFB, 'ü': 0xFC,
            'Ç': 0xC7, 'ç': 0xE7, 'Ñ': 0xD1, 'ñ': 0xF1,
            'R$': 0x52, '°': 0xB0,
        };
        const result: number[] = [];
        for (const char of text) {
            if (map[char] !== undefined) {
                result.push(map[char]);
            } else if (char.charCodeAt(0) < 256) {
                result.push(char.charCodeAt(0));
            } else {
                result.push(0x3F); // '?'
            }
        }
        return result;
    }

    // Retorna o buffer de bytes
    toUint8Array(): Uint8Array {
        return new Uint8Array(this.bytes);
    }
}

// =============================================
// GERADOR DE CUPOM — layout profissional
// =============================================
export interface DadosCupom {
    nomeLoja: string;
    cnpjLoja: string;
    enderecoLoja: string;
    rodape: string;
    operador: string;
    colunas: number;
    numeroCaixa: number;
    itens: {
        nome: string;
        quantidade: number;
        unidade: string;
        preco_unitario: number;
        desconto: number;
        subtotal: number;
    }[];
    subtotal: number;
    desconto: number;
    total: number;
    formaPagamento: string;
    valorPago: number;
    troco: number;
    dataHora: Date;
    numeroVenda?: number;
}

const formasPagamento: Record<string, string> = {
    dinheiro: 'DINHEIRO',
    debito: 'CARTAO DEBITO',
    credito: 'CARTAO CREDITO',
    pix: 'PIX',
    multiplo: 'MULTIPLOS',
};

function formatarValor(v: number): string {
    return `R$ ${v.toFixed(2).replace('.', ',')}`;
}

function formatarData(d: Date): string {
    return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function gerarCupom(dados: DadosCupom, config: ConfigImpressora): Uint8Array {
    const { colunas } = config;
    const esc = new EscPos();

    esc.init();

    // === CABEÇALHO ===
    esc.alinhar('center');
    esc.negrito(true);
    esc.tamanho(true);
    esc.linha(dados.nomeLoja.toUpperCase().substring(0, colunas / 2));
    esc.tamanho(false);
    esc.negrito(false);

    if (dados.enderecoLoja) esc.linha(dados.enderecoLoja.substring(0, colunas));
    if (dados.cnpjLoja) esc.linha(`CNPJ: ${dados.cnpjLoja}`);

    esc.separador('=', colunas);
    esc.alinhar('center');
    esc.negrito(true);
    esc.linha('CUPOM NAO FISCAL');
    esc.negrito(false);
    esc.separador('=', colunas);

    // Info da venda
    esc.alinhar('left');
    esc.linha(`Data: ${formatarData(dados.dataHora)}`);
    esc.linha(`Caixa: ${dados.numeroCaixa}  Operador: ${dados.operador}`);
    if (dados.numeroVenda) esc.linha(`Venda: #${String(dados.numeroVenda).padStart(6, '0')}`);

    esc.separador('-', colunas);

    // === ITENS ===
    esc.negrito(true);
    if (colunas >= 48) {
        esc.linha('ITEM  DESCRICAO              QTD    UNIT    TOTAL');
    } else {
        esc.linha('ITEM  DESCRICAO         QTD  TOTAL');
    }
    esc.negrito(false);
    esc.separador('-', colunas);

    dados.itens.forEach((item, idx) => {
        const num = String(idx + 1).padStart(3, ' ');
        const nome = item.nome.substring(0, colunas >= 48 ? 22 : 14).padEnd(colunas >= 48 ? 22 : 14);
        const qtd = `${item.quantidade.toFixed(item.unidade === 'KG' ? 3 : 0)} ${item.unidade}`.padStart(7);
        const unit = `R$${item.preco_unitario.toFixed(2)}`.padStart(8);
        const total = `R$${item.subtotal.toFixed(2)}`.padStart(8);

        if (colunas >= 48) {
            esc.linha(`${num}  ${nome} ${qtd}${unit}${total}`);
        } else {
            esc.linha(`${num}  ${nome}${qtd} R$${item.subtotal.toFixed(2)}`);
        }
        if (item.desconto > 0) {
            esc.linha(`     Desconto: -R$${item.desconto.toFixed(2)}`);
        }
    });

    esc.separador('-', colunas);

    // === TOTAIS ===
    esc.alinhar('right');
    if (dados.desconto > 0) {
        esc.duasColunas('Subtotal:', formatarValor(dados.subtotal), colunas);
        esc.duasColunas('Desconto:', `-${formatarValor(dados.desconto)}`, colunas);
    }

    esc.negrito(true);
    esc.tamanho(true);
    esc.alinhar('center');
    esc.linha(`TOTAL: ${formatarValor(dados.total)}`);
    esc.tamanho(false);
    esc.negrito(false);

    esc.separador('-', colunas);

    // === PAGAMENTO ===
    esc.alinhar('left');
    const fpLabel = formasPagamento[dados.formaPagamento] || dados.formaPagamento.toUpperCase();
    esc.duasColunas(fpLabel + ':', formatarValor(dados.valorPago), colunas);
    if (dados.troco > 0) {
        esc.negrito(true);
        esc.duasColunas('TROCO:', formatarValor(dados.troco), colunas);
        esc.negrito(false);
    }

    esc.separador('=', colunas);

    // === RODAPÉ ===
    esc.alinhar('center');
    if (dados.rodape) {
        esc.linha(dados.rodape.substring(0, colunas));
    } else {
        esc.linha('Obrigado pela preferencia!');
        esc.linha('Volte sempre!');
    }

    esc.feed(4);

    if (config.cortarPapel) esc.cortar();
    if (config.abrirGaveta) esc.abrirGaveta();

    return esc.toUint8Array();
}

// =============================================
// SERVIÇO DE IMPRESSORA TÉRMICA — Web Serial / Web USB
// =============================================
export class ImpressoraService {
    private port: SerialPort | null = null;
    private usbDevice: USBDevice | null = null;
    private usbEndpoint: number | null = null;
    public config: ConfigImpressora;

    constructor(config: ConfigImpressora) {
        this.config = config;
    }

    get conectada() {
        return this.port !== null || this.usbDevice !== null;
    }

    async conectarSerial(): Promise<void> {
        if (!('serial' in navigator)) {
            throw new Error('Web Serial API não suportada. Use Chrome ou Edge.');
        }

        const port = await (navigator as any).serial.requestPort({ filters: [] });
        await port.open({
            baudRate: this.config.baudRate || 9600,
            dataBits: 8,
            stopBits: 1,
            parity: 'none',
        });
        this.port = port;
        this.usbDevice = null;
    }

    async conectarUSB(): Promise<void> {
        if (!('usb' in navigator)) {
            throw new Error('Web USB API não suportada. Use Chrome ou Edge.');
        }

        // Filtros para impressoras ESC/POS mais comuns (vendorId)
        const filters = [
            { vendorId: 0x04B8 }, // Epson
            { vendorId: 0x1504 }, // Daruma
            { vendorId: 0x0FE6 }, // Bematech
            { vendorId: 0x154F }, // Elgin
            { vendorId: 0x0DD4 }, // Custom (genérico)
            { vendorId: 0x20D1 }, // Sweda
        ];

        try {
            const device = await (navigator as any).usb.requestDevice({ filters });
            await device.open();
            await device.selectConfiguration(1);
            await device.claimInterface(0);

            // Encontra o endpoint de saída (bulk out)
            const iface = device.configuration.interfaces[0];
            const alt = iface.alternates[0];
            const endpoint = alt.endpoints.find(
                (ep: any) => ep.direction === 'out' && ep.type === 'bulk'
            );

            if (!endpoint) throw new Error('Endpoint USB não encontrado.');

            this.usbDevice = device;
            this.usbEndpoint = endpoint.endpointNumber;
            this.port = null;
        } catch (err: any) {
            if (err.name === 'NotFoundError') throw new Error('Nenhuma impressora USB selecionada.');
            throw err;
        }
    }

    async imprimir(dados: Uint8Array): Promise<void> {
        if (this.port) {
            const writer = this.port.writable!.getWriter();
            try {
                await writer.write(dados);
            } finally {
                writer.releaseLock();
            }
        } else if (this.usbDevice && this.usbEndpoint !== null) {
            await (this.usbDevice as any).transferOut(this.usbEndpoint, dados);
        } else {
            throw new Error('Impressora não conectada.');
        }
    }

    async testar(): Promise<void> {
        const esc = new EscPos();
        esc.init()
            .alinhar('center')
            .negrito(true)
            .linha('=== TESTE DE IMPRESSAO ===')
            .negrito(false)
            .linha('Impressora conectada com sucesso!')
            .linha('ESC/POS Protocol OK')
            .separador('-', this.config.colunas)
            .linha('Hortifruti Master PDV')
            .feed(3)
            .cortar();
        await this.imprimir(esc.toUint8Array());
    }

    async desconectar(): Promise<void> {
        try { await this.port?.close(); } catch { /* ok */ }
        try { await this.usbDevice?.close(); } catch { /* ok */ }
        this.port = null;
        this.usbDevice = null;
        this.usbEndpoint = null;
    }
}

// =============================================
// FALLBACK: Impressão via Diálogo do Navegador
// Gera HTML formatado para papel térmico 80mm
// =============================================
export function imprimirCupomNavegador(dados: DadosCupom): void {
    const html = gerarHtmlCupom(dados);
    const win = window.open('', '_blank', 'width=320,height=600');
    if (!win) {
        alert('Permita pop-ups para imprimir o cupom.');
        return;
    }
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => {
        win.print();
        win.close();
    }, 500);
}

function gerarHtmlCupom(dados: DadosCupom): string {
    const fp = formasPagamento[dados.formaPagamento] || dados.formaPagamento;
    const itensHtml = dados.itens.map((item, i) => `
        <div class="item">
            <span class="num">${i + 1}.</span>
            <span class="nome">${item.nome}</span>
            <div class="detalhe">
                <span>${item.quantidade.toFixed(item.unidade === 'KG' ? 3 : 0)} ${item.unidade} x R$ ${item.preco_unitario.toFixed(2)}</span>
                <span class="subtotal">R$ ${item.subtotal.toFixed(2)}</span>
            </div>
            ${item.desconto > 0 ? `<div class="desconto">Desconto: -R$ ${item.desconto.toFixed(2)}</div>` : ''}
        </div>
    `).join('');

    return `<!DOCTYPE html><html><head>
    <meta charset="UTF-8">
    <title>Cupom</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Courier New', monospace; font-size: 12px; width: 80mm; padding: 4mm; }
        h1 { font-size: 14px; text-align: center; }
        .center { text-align: center; }
        .right { text-align: right; }
        .bold { font-weight: bold; }
        .sep { border-top: 1px dashed #000; margin: 4px 0; }
        .sep2 { border-top: 2px solid #000; margin: 4px 0; }
        .info { font-size: 11px; }
        .item { margin: 3px 0; }
        .item .nome { font-weight: bold; display: block; }
        .item .detalhe { display: flex; justify-content: space-between; }
        .item .desconto { color: #555; font-size: 10px; }
        .total { font-size: 16px; font-weight: bold; text-align: center; margin: 6px 0; }
        .pgto { display: flex; justify-content: space-between; }
        .footer { text-align: center; font-size: 11px; margin-top: 8px; }
        @media print {
            @page { margin: 0; size: 80mm auto; }
            body { width: 80mm; }
        }
    </style>
    </head><body>
    <h1>${dados.nomeLoja}</h1>
    ${dados.enderecoLoja ? `<p class="center info">${dados.enderecoLoja}</p>` : ''}
    ${dados.cnpjLoja ? `<p class="center info">CNPJ: ${dados.cnpjLoja}</p>` : ''}
    <div class="sep2"></div>
    <p class="center bold">CUPOM NAO FISCAL</p>
    <div class="sep2"></div>
    <p class="info">Data: ${formatarData(dados.dataHora)}</p>
    <p class="info">Operador: ${dados.operador} | Cx: ${dados.numeroCaixa}</p>
    ${dados.numeroVenda ? `<p class="info">Venda: #${String(dados.numeroVenda).padStart(6, '0')}</p>` : ''}
    <div class="sep"></div>
    ${itensHtml}
    <div class="sep"></div>
    ${dados.desconto > 0 ? `
        <div class="pgto"><span>Subtotal:</span><span>R$ ${dados.subtotal.toFixed(2)}</span></div>
        <div class="pgto"><span>Desconto:</span><span>-R$ ${dados.desconto.toFixed(2)}</span></div>
    ` : ''}
    <div class="total">TOTAL: R$ ${dados.total.toFixed(2)}</div>
    <div class="sep"></div>
    <div class="pgto bold"><span>${fp}:</span><span>R$ ${dados.valorPago.toFixed(2)}</span></div>
    ${dados.troco > 0 ? `<div class="pgto bold"><span>TROCO:</span><span>R$ ${dados.troco.toFixed(2)}</span></div>` : ''}
    <div class="sep2"></div>
    <div class="footer">
        ${dados.rodape || 'Obrigado pela preferencia!<br>Volte sempre!'}
    </div>
    </body></html>`;
}
