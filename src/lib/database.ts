// =============================================
// Configuração de Banco de Dados
// Define qual banco usar em toda a aplicação
// =============================================

// Tipos de banco disponíveis
export type DatabaseType = 'firebase' | 'supabase' | 'mock';

// BANCO ATIVO: Altere aqui para mudar o banco de dados
// Opções: 'firebase' | 'supabase' | 'mock'
export const ACTIVE_DATABASE: DatabaseType = 'firebase';

// Verificações de status
export const isFirebaseConfigured = true; // Firebase sempre configurado
export const isSupabaseConfigured = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

// Função para obter o banco ativo
export function getActiveDatabase(): DatabaseType {
    return ACTIVE_DATABASE;
}

// Função para verificar se um banco específico está disponível
export function isDatabaseAvailable(type: DatabaseType): boolean {
    switch (type) {
        case 'firebase':
            return isFirebaseConfigured;
        case 'supabase':
            return isSupabaseConfigured;
        case 'mock':
            return true;
        default:
            return false;
    }
}
