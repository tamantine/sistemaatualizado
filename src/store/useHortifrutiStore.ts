// =============================================
// Store: Módulo Hortifruti Especializado
// Qualidade, Rastreabilidade, Perdas, Sazonalidade
// =============================================
import { create } from 'zustand';

// Registro de qualidade de lote
export interface RegistroQualidade {
    id: string;
    produto_nome: string;
    lote: string;
    fornecedor_nome: string;
    data_recebimento: string;
    data_validade: string;
    classificacao: 'extra' | 'primeira' | 'segunda' | 'terceira';
    aparencia: number; // 1-5
    textura: number;    // 1-5
    aroma: number;      // 1-5
    temperatura: number; // °C
    peso_recebido: number;
    peso_conferido: number;
    diferenca_peso: number;
    status: 'aprovado' | 'aprovado_restricao' | 'rejeitado';
    observacoes?: string;
    foto_url?: string;
    created_at: string;
}

// Registro de perda
export interface RegistroPerda {
    id: string;
    produto_nome: string;
    categoria: string;
    quantidade: number;
    unidade: string;
    valor_perda: number;
    motivo: 'vencimento' | 'avaria' | 'maturacao' | 'transporte' | 'armazenamento' | 'outro';
    data_registro: string;
    responsavel: string;
    destino: 'descarte' | 'doacao' | 'compostagem' | 'promocao';
    observacoes?: string;
}

// Info de sazonalidade
export interface InfoSazonal {
    mes: string;
    mesNum: number;
    produtos_safra: string[];
    qualidade_media: number;
    custo_medio: 'baixo' | 'medio' | 'alto';
    dica: string;
}

// Rastreio de produto
export interface Rastreio {
    id: string;
    produto_nome: string;
    codigo_rastreio: string;
    origem: string;
    produtor: string;
    data_colheita: string;
    data_chegada: string;
    transporte: string;
    temperatura_transporte: string;
    certificacoes: string[];
    etapas: { data: string; local: string; evento: string; status: 'concluido' | 'atual' | 'pendente' }[];
}

type AbaHortifruti = 'qualidade' | 'perdas' | 'sazonalidade' | 'rastreabilidade';

// Dados mock
const qualidadeMock: RegistroQualidade[] = [
    { id: 'q-1', produto_nome: 'Banana Prata', lote: 'LP-2026-0218A', fornecedor_nome: 'Sítio Boa Vista', data_recebimento: '2026-02-18', data_validade: '2026-02-25', classificacao: 'extra', aparencia: 5, textura: 5, aroma: 4, temperatura: 14, peso_recebido: 50, peso_conferido: 49.2, diferenca_peso: -0.8, status: 'aprovado', created_at: '2026-02-18' },
    { id: 'q-2', produto_nome: 'Tomate Italiano', lote: 'LP-2026-0217A', fornecedor_nome: 'Distribuidora Frutas Brasil', data_recebimento: '2026-02-17', data_validade: '2026-02-24', classificacao: 'primeira', aparencia: 4, textura: 4, aroma: 4, temperatura: 8, peso_recebido: 80, peso_conferido: 78.5, diferenca_peso: -1.5, status: 'aprovado', created_at: '2026-02-17' },
    { id: 'q-3', produto_nome: 'Alface Crespa', lote: 'LP-2026-0218B', fornecedor_nome: 'Ceasa Central', data_recebimento: '2026-02-18', data_validade: '2026-02-21', classificacao: 'primeira', aparencia: 4, textura: 3, aroma: 4, temperatura: 5, peso_recebido: 30, peso_conferido: 29.0, diferenca_peso: -1.0, status: 'aprovado_restricao', observacoes: 'Folhas externas levemente murchas', created_at: '2026-02-18' },
    { id: 'q-4', produto_nome: 'Morango', lote: 'LP-2026-0216A', fornecedor_nome: 'Sítio Boa Vista', data_recebimento: '2026-02-16', data_validade: '2026-02-19', classificacao: 'segunda', aparencia: 3, textura: 3, aroma: 5, temperatura: 4, peso_recebido: 20, peso_conferido: 18.5, diferenca_peso: -1.5, status: 'aprovado_restricao', observacoes: 'Alguns frutos amassados — destinar à promoção', created_at: '2026-02-16' },
    { id: 'q-5', produto_nome: 'Abacate Avocado', lote: 'LP-2026-0215A', fornecedor_nome: 'Distribuidora Frutas Brasil', data_recebimento: '2026-02-15', data_validade: '2026-02-22', classificacao: 'extra', aparencia: 5, textura: 5, aroma: 5, temperatura: 12, peso_recebido: 40, peso_conferido: 39.8, diferenca_peso: -0.2, status: 'aprovado', created_at: '2026-02-15' },
    { id: 'q-6', produto_nome: 'Mamão Papaia', lote: 'LP-2026-0214A', fornecedor_nome: 'Ceasa Central', data_recebimento: '2026-02-14', data_validade: '2026-02-18', classificacao: 'terceira', aparencia: 2, textura: 2, aroma: 3, temperatura: 18, peso_recebido: 60, peso_conferido: 55.0, diferenca_peso: -5.0, status: 'rejeitado', observacoes: 'Lote com maturação excessiva e manchas', created_at: '2026-02-14' },
];

const perdasMock: RegistroPerda[] = [
    { id: 'p-1', produto_nome: 'Alface Crespa', categoria: 'Verduras', quantidade: 5, unidade: 'UN', valor_perda: 17.50, motivo: 'vencimento', data_registro: '2026-02-17', responsavel: 'Carlos', destino: 'compostagem' },
    { id: 'p-2', produto_nome: 'Morango', categoria: 'Frutas', quantidade: 3, unidade: 'CX', valor_perda: 89.70, motivo: 'maturacao', data_registro: '2026-02-16', responsavel: 'Maria', destino: 'promocao' },
    { id: 'p-3', produto_nome: 'Banana Prata', categoria: 'Frutas', quantidade: 8, unidade: 'KG', valor_perda: 31.92, motivo: 'maturacao', data_registro: '2026-02-15', responsavel: 'Carlos', destino: 'doacao' },
    { id: 'p-4', produto_nome: 'Tomate Italiano', categoria: 'Legumes', quantidade: 4, unidade: 'KG', valor_perda: 35.60, motivo: 'avaria', data_registro: '2026-02-14', responsavel: 'Ana', destino: 'descarte' },
    { id: 'p-5', produto_nome: 'Mamão Papaia', categoria: 'Frutas', quantidade: 10, unidade: 'KG', valor_perda: 59.90, motivo: 'transporte', data_registro: '2026-02-13', responsavel: 'Carlos', destino: 'descarte' },
    { id: 'p-6', produto_nome: 'Rúcula Orgânica', categoria: 'Verduras', quantidade: 12, unidade: 'UN', valor_perda: 47.88, motivo: 'armazenamento', data_registro: '2026-02-12', responsavel: 'Maria', destino: 'compostagem' },
    { id: 'p-7', produto_nome: 'Abacaxi Pérola', categoria: 'Frutas', quantidade: 2, unidade: 'UN', valor_perda: 15.80, motivo: 'avaria', data_registro: '2026-02-11', responsavel: 'Ana', destino: 'descarte' },
    { id: 'p-8', produto_nome: 'Espinafre', categoria: 'Verduras', quantidade: 6, unidade: 'UN', valor_perda: 23.94, motivo: 'vencimento', data_registro: '2026-02-10', responsavel: 'Carlos', destino: 'compostagem' },
];

const sazonalidadeMock: InfoSazonal[] = [
    { mes: 'Janeiro', mesNum: 1, produtos_safra: ['Manga', 'Melancia', 'Abacaxi', 'Pêssego', 'Uva'], qualidade_media: 4.5, custo_medio: 'baixo', dica: 'Maior oferta de frutas tropicais. Ideal para promoções de verão.' },
    { mes: 'Fevereiro', mesNum: 2, produtos_safra: ['Manga', 'Abacate', 'Goiaba', 'Figo', 'Uva Niágara'], qualidade_media: 4.3, custo_medio: 'baixo', dica: 'Mês de Carnaval — prepare kits de frutas refrescantes.' },
    { mes: 'Março', mesNum: 3, produtos_safra: ['Abacate', 'Caqui', 'Maracujá', 'Banana', 'Goiaba'], qualidade_media: 4.2, custo_medio: 'medio', dica: 'Transição verão-outono. Frutas tropicais ainda em alta.' },
    { mes: 'Abril', mesNum: 4, produtos_safra: ['Caqui', 'Kiwi', 'Tangerina', 'Maçã', 'Pera'], qualidade_media: 4.0, custo_medio: 'medio', dica: 'Início das frutas de outono. Tangerina começa a ter boa qualidade.' },
    { mes: 'Maio', mesNum: 5, produtos_safra: ['Tangerina', 'Laranja', 'Kiwi', 'Maçã', 'Abacate'], qualidade_media: 4.1, custo_medio: 'medio', dica: 'Cítricos em alta qualidade. Ideal para sucos e kits vitamínicos.' },
    { mes: 'Junho', mesNum: 6, produtos_safra: ['Laranja', 'Tangerina', 'Morango', 'Maçã', 'Pinhão'], qualidade_media: 4.4, custo_medio: 'baixo', dica: 'Morango na safra — preço acessível. Monte cestas de inverno.' },
    { mes: 'Julho', mesNum: 7, produtos_safra: ['Morango', 'Laranja', 'Mexerica', 'Maçã', 'Lima'], qualidade_media: 4.5, custo_medio: 'baixo', dica: 'Pico do morango. Ótima época para kits de café da manhã.' },
    { mes: 'Agosto', mesNum: 8, produtos_safra: ['Morango', 'Laranja Lima', 'Mexerica', 'Jabuticaba', 'Maçã'], qualidade_media: 4.3, custo_medio: 'medio', dica: 'Final da safra de morango. Verduras de folha ganham qualidade.' },
    { mes: 'Setembro', mesNum: 9, produtos_safra: ['Manga Rosa', 'Jabuticaba', 'Abacaxi', 'Melão', 'Mamão'], qualidade_media: 4.0, custo_medio: 'medio', dica: 'Início da primavera. Variedade começa a aumentar.' },
    { mes: 'Outubro', mesNum: 10, produtos_safra: ['Manga', 'Melão', 'Mamão', 'Abacaxi', 'Lichia'], qualidade_media: 4.2, custo_medio: 'medio', dica: 'Frutas tropicais retornando. Prepare-se para o aumento de oferta.' },
    { mes: 'Novembro', mesNum: 11, produtos_safra: ['Manga', 'Melancia', 'Lichia', 'Pêssego', 'Ameixa'], qualidade_media: 4.4, custo_medio: 'baixo', dica: 'Grande variedade. Ideal para montar cestas de Natal.' },
    { mes: 'Dezembro', mesNum: 12, produtos_safra: ['Melancia', 'Uva Itália', 'Pêssego', 'Ameixa', 'Cereja'], qualidade_media: 4.6, custo_medio: 'baixo', dica: 'Uva, pêssego e cereja na safra. Alto volume para festas.' },
];

const rastreiosMock: Rastreio[] = [
    {
        id: 'r-1', produto_nome: 'Banana Prata', codigo_rastreio: 'RT-2026-BAN-001', origem: 'Vale do Ribeira, SP',
        produtor: 'Sítio Boa Vista', data_colheita: '2026-02-16', data_chegada: '2026-02-18',
        transporte: 'Caminhão Refrigerado', temperatura_transporte: '12-14°C',
        certificacoes: ['Selo Orgânico', 'Rainforest Alliance'],
        etapas: [
            { data: '2026-02-16', local: 'Sítio Boa Vista — Vale do Ribeira', evento: 'Colheita', status: 'concluido' },
            { data: '2026-02-16', local: 'Packing House', evento: 'Classificação e embalagem', status: 'concluido' },
            { data: '2026-02-17', local: 'Rodovia SP-079', evento: 'Transporte refrigerado', status: 'concluido' },
            { data: '2026-02-18', local: 'Hortifruti Master', evento: 'Recebimento e inspeção', status: 'concluido' },
            { data: '2026-02-18', local: 'Gôndola Loja', evento: 'Disponível para venda', status: 'atual' },
        ],
    },
    {
        id: 'r-2', produto_nome: 'Tomate Italiano', codigo_rastreio: 'RT-2026-TOM-003', origem: 'Mogi das Cruzes, SP',
        produtor: 'Fazenda Tomate Real', data_colheita: '2026-02-15', data_chegada: '2026-02-17',
        transporte: 'Caminhão Refrigerado', temperatura_transporte: '8-10°C',
        certificacoes: ['Selo de Conformidade CEASA'],
        etapas: [
            { data: '2026-02-15', local: 'Fazenda Tomate Real — Mogi das Cruzes', evento: 'Colheita seletiva', status: 'concluido' },
            { data: '2026-02-15', local: 'Galpão de beneficiamento', evento: 'Lavagem e classificação', status: 'concluido' },
            { data: '2026-02-16', local: 'CEASA — São Paulo', evento: 'Comercialização', status: 'concluido' },
            { data: '2026-02-17', local: 'Hortifruti Master', evento: 'Recebimento e inspeção', status: 'concluido' },
            { data: '2026-02-17', local: 'Câmara fria', evento: 'Armazenamento controlado', status: 'atual' },
        ],
    },
];

interface HortifrutiState {
    abaAtiva: AbaHortifruti;
    registrosQualidade: RegistroQualidade[];
    registrosPerdas: RegistroPerda[];
    sazonalidade: InfoSazonal[];
    rastreios: Rastreio[];
    mesSelecionado: number;
    modalQualidade: boolean;
    modalPerda: boolean;

    setAbaAtiva: (aba: AbaHortifruti) => void;
    setMesSelecionado: (mes: number) => void;
    setModalQualidade: (v: boolean) => void;
    setModalPerda: (v: boolean) => void;
    adicionarQualidade: (r: RegistroQualidade) => void;
    adicionarPerda: (r: RegistroPerda) => void;

    estatisticas: () => {
        totalInspecoes: number; aprovados: number; rejeitados: number; taxaAprovacao: number;
        totalPerdas: number; valorPerdas: number; perdasPorMotivo: { motivo: string; qtd: number; valor: number }[];
        perdasPorDestino: { destino: string; qtd: number }[];
    };
}

export const useHortifrutiStore = create<HortifrutiState>((set, get) => ({
    abaAtiva: 'qualidade',
    registrosQualidade: qualidadeMock,
    registrosPerdas: perdasMock,
    sazonalidade: sazonalidadeMock,
    rastreios: rastreiosMock,
    mesSelecionado: new Date().getMonth() + 1,
    modalQualidade: false,
    modalPerda: false,

    setAbaAtiva: (aba) => set({ abaAtiva: aba }),
    setMesSelecionado: (mes) => set({ mesSelecionado: mes }),
    setModalQualidade: (v) => set({ modalQualidade: v }),
    setModalPerda: (v) => set({ modalPerda: v }),
    adicionarQualidade: (r) => set((s) => ({ registrosQualidade: [r, ...s.registrosQualidade] })),
    adicionarPerda: (r) => set((s) => ({ registrosPerdas: [r, ...s.registrosPerdas] })),

    estatisticas: () => {
        const { registrosQualidade, registrosPerdas } = get();
        const aprovados = registrosQualidade.filter((r) => r.status === 'aprovado').length;
        const rejeitados = registrosQualidade.filter((r) => r.status === 'rejeitado').length;

        const porMotivo = ['vencimento', 'avaria', 'maturacao', 'transporte', 'armazenamento', 'outro'].map((m) => {
            const items = registrosPerdas.filter((p) => p.motivo === m);
            return { motivo: m, qtd: items.length, valor: items.reduce((a, i) => a + i.valor_perda, 0) };
        }).filter((m) => m.qtd > 0);

        const porDestino = ['descarte', 'doacao', 'compostagem', 'promocao'].map((d) => ({
            destino: d, qtd: registrosPerdas.filter((p) => p.destino === d).length,
        })).filter((d) => d.qtd > 0);

        return {
            totalInspecoes: registrosQualidade.length,
            aprovados,
            rejeitados,
            taxaAprovacao: registrosQualidade.length > 0 ? Math.round((aprovados / registrosQualidade.length) * 100) : 0,
            totalPerdas: registrosPerdas.length,
            valorPerdas: registrosPerdas.reduce((a, p) => a + p.valor_perda, 0),
            perdasPorMotivo: porMotivo,
            perdasPorDestino: porDestino,
        };
    },
}));
