// =============================================
// Cliente Supabase — Configuração
// Suporta modo Demo quando não há credenciais
// =============================================
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Flag para verificar se Supabase está configurado
export const isSupabaseConfigured = !!(supabaseUrl && supabaseKey);

// Cliente Supabase (só é criado se estiver configurado)
let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
}

export { supabase };
