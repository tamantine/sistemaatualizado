// =============================================
// Store: Autenticação (Supabase Auth)
// =============================================
import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
    user: User | null;
    session: Session | null;
    loading: boolean;
    inicializado: boolean;

    // Ações
    signIn: (email: string, pass: string) => Promise<{ error: any }>;
    signOut: () => Promise<void>;
    initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    session: null,
    loading: false,
    inicializado: false,

    initialize: async () => {
        // Verificar sessão atual
        const { data: { session } } = await supabase.auth.getSession();
        set({
            session,
            user: session?.user ?? null,
            inicializado: true
        });

        // Escutar mudanças na autenticação
        supabase.auth.onAuthStateChange((_event, session) => {
            set({
                session,
                user: session?.user ?? null,
                inicializado: true
            });
        });
    },

    signIn: async (email, password) => {
        set({ loading: true });
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        set({ loading: false });
        return { error };
    },

    signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null, session: null });
    },
}));
