// =============================================
// Store: Módulo Hortifruti Especializado
// Qualidade, Rastreabilidade, Perdas, Sazonalidade
// =============================================
import { create } from 'zustand';
import { qualidadeService, perdasService, rastreiosService, sazonalidadeService } from '../services/supabaseService';

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
    id?: string;
    mes: string;
    mesNum: number;
    mes_num?: number;
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

interface HortifrutiState {
    abaAtiva: AbaHortifruti;
    registrosQualidade: RegistroQualidade[];
    registrosPerdas: RegistroPerda[];
    sazonalidade: InfoSazonal[];
    rastreios: Rastreio[];
    mesSelecionado: number;
    modalQualidade: boolean;
    modalPerda: boolean;
    carregando: boolean;

    setAbaAtiva: (aba: AbaHortifruti) => void;
    setMesSelecionado: (mes: number) => void;
    setModalQualidade: (v: boolean) => void;
    setModalPerda: (v: boolean) => void;

    // Supabase
    carregarDados: () => Promise<void>;
    adicionarQualidade: (r: Omit<RegistroQualidade, 'id' | 'created_at'>) => Promise<void>;
    adicionarPerda: (r: Omit<RegistroPerda, 'id'>) => Promise<void>;

    estatisticas: () => {
        totalInspecoes: number; aprovados: number; rejeitados: number; taxaAprovacao: number;
        totalPerdas: number; valorPerdas: number; perdasPorMotivo: { motivo: string; qtd: number; valor: number }[];
        perdasPorDestino: { destino: string; qtd: number }[];
    };
}

export const useHortifrutiStore = create<HortifrutiState>((set, get) => ({
    abaAtiva: 'qualidade',
    registrosQualidade: [],
    registrosPerdas: [],
    sazonalidade: [],
    rastreios: [],
    mesSelecionado: new Date().getMonth() + 1,
    modalQualidade: false,
    modalPerda: false,
    carregando: false,

    setAbaAtiva: (aba) => set({ abaAtiva: aba }),
    setMesSelecionado: (mes) => set({ mesSelecionado: mes }),
    setModalQualidade: (v) => set({ modalQualidade: v }),
    setModalPerda: (v) => set({ modalPerda: v }),

    carregarDados: async () => {
        set({ carregando: true });
        try {
            const [registrosQualidade, registrosPerdas, sazonalidade, rastreios] = await Promise.all([
                qualidadeService.listar(),
                perdasService.listar(),
                sazonalidadeService.listar(),
                rastreiosService.listar(),
            ]);
            set({ registrosQualidade, registrosPerdas, sazonalidade, rastreios, carregando: false });
        } catch (err) {
            console.error('[Hortifruti] Erro ao carregar dados do Supabase:', err);
            set({ carregando: false });
        }
    },

    adicionarQualidade: async (reg) => {
        try {
            const novo = await qualidadeService.criar(reg);
            set((s) => ({ registrosQualidade: [novo, ...s.registrosQualidade] }));
        } catch (err) {
            console.error('[Hortifruti] Erro ao criar registro de qualidade:', err);
            // Fallback local
            const local = { ...reg, id: crypto.randomUUID(), created_at: new Date().toISOString() } as RegistroQualidade;
            set((s) => ({ registrosQualidade: [local, ...s.registrosQualidade] }));
        }
    },

    adicionarPerda: async (reg) => {
        try {
            const nova = await perdasService.criar(reg);
            set((s) => ({ registrosPerdas: [nova, ...s.registrosPerdas] }));
        } catch (err) {
            console.error('[Hortifruti] Erro ao criar registro de perda:', err);
            // Fallback local
            const local = { ...reg, id: crypto.randomUUID() } as RegistroPerda;
            set((s) => ({ registrosPerdas: [local, ...s.registrosPerdas] }));
        }
    },

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
