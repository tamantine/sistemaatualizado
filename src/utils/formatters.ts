// =============================================
// Funções utilitárias de formatação
// =============================================

// Formata valor monetário em Real brasileiro
export function formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(valor);
}

// Formata data no padrão brasileiro
export function formatarData(data: string): string {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(data));
}

// Formata data e hora
export function formatarDataHora(data: string): string {
    return new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
    }).format(new Date(data));
}

// Formata número com casas decimais
export function formatarNumero(valor: number, casas: number = 2): string {
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: casas,
        maximumFractionDigits: casas,
    }).format(valor);
}

// Formata peso (kg)
export function formatarPeso(valor: number): string {
    return `${formatarNumero(valor, 3)} kg`;
}

// Gera um ID único simples
export function gerarId(): string {
    return crypto.randomUUID();
}

// Calcula margem de lucro
export function calcularMargem(custo: number, venda: number): number {
    if (custo === 0) return 0;
    return ((venda - custo) / custo) * 100;
}

// Trunca texto com reticências
export function truncarTexto(texto: string, max: number): string {
    if (texto.length <= max) return texto;
    return texto.slice(0, max) + '...';
}

// Retorna cor do status
export function corStatus(status: string): string {
    const cores: Record<string, string> = {
        ativo: 'text-green-400',
        finalizada: 'text-green-400',
        pago: 'text-green-400',
        recebido: 'text-green-400',
        aberto: 'text-green-400',
        pendente: 'text-yellow-400',
        em_andamento: 'text-blue-400',
        em_espera: 'text-yellow-400',
        aprovado: 'text-blue-400',
        atrasado: 'text-red-400',
        cancelado: 'text-red-400',
        fechado: 'text-surface-400',
        vencendo: 'text-orange-400',
        critico: 'text-red-400',
    };
    return cores[status] || 'text-surface-400';
}

// Retorna bg do status
export function bgStatus(status: string): string {
    const cores: Record<string, string> = {
        ativo: 'bg-green-500/20 text-green-400',
        finalizada: 'bg-green-500/20 text-green-400',
        pago: 'bg-green-500/20 text-green-400',
        recebido: 'bg-green-500/20 text-green-400',
        aberto: 'bg-green-500/20 text-green-400',
        pendente: 'bg-yellow-500/20 text-yellow-400',
        em_andamento: 'bg-blue-500/20 text-blue-400',
        em_espera: 'bg-yellow-500/20 text-yellow-400',
        aprovado: 'bg-blue-500/20 text-blue-400',
        atrasado: 'bg-red-500/20 text-red-400',
        cancelado: 'bg-red-500/20 text-red-400',
        fechado: 'bg-surface-500/20 text-surface-400',
    };
    return cores[status] || 'bg-surface-500/20 text-surface-400';
}
