// =============================================
// Store: Autenticação (Supabase Auth + Modo Demo)
// =============================================
import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
    user: User | null;
    session: Session | null;
    loading: boolean;
    inicializado: boolean;
    modoDemo: boolean;

    // Ações
    signIn: (email: string, pass: string) => Promise<{ error: any }>;
    signOut: () => Promise<void>;
    initialize: () => Promise<void>;
    demoLogin: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    session: null,
    loading: false,
    inicializado: false,
    modoDemo: false,

    initialize: async () => {
        // Se Supabase não está configurado, marca como inicializado
        if (!isSupabaseConfigured || !supabase) {
            set({ inicializado: true });
            return;
        }

        try {
            // Timeout de 5 segundos para evitar travar
            const sessionPromise = supabase.auth.getSession();
            const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('Timeout ao obter sessão')), 5000)
            );

            const { data: { session } } = await Promise.race([
                sessionPromise,
                timeoutPromise,
            ]);

            set({
                session,
                user: session?.user ?? null,
                inicializado: true,
            });

            // Escutar mudanças na autenticação (sem bloquear)
            supabase.auth.onAuthStateChange((_event, session) => {
                // Não sobrescreve se estiver em modo demo
                if (!get().modoDemo) {
                    set({
                        session,
                        user: session?.user ?? null,
                        inicializado: true,
                    });
                }
            });
        } catch {
            // Marca como inicializado mesmo com erro, para a UI não ficar presa
            set({
                inicializado: true,
                user: null,
                session: null,
            });
        }
    },

    demoLogin: () => {
        // Cria um usuário demo sem precisar do Supabase
        const demoUser = {
            id: 'demo-user-00000000-0000-0000-0000-000000000000',
            aud: 'authenticated',
            role: 'authenticated',
            email: 'demo@hortifruti.com.br',
            email_confirmed_at: new Date().toISOString(),
            phone: '',
            confirmed_at: new Date().toISOString(),
            last_sign_in_at: new Date().toISOString(),
            app_metadata: { provider: 'demo', providers: ['demo'] },
            user_metadata: { nome: 'Usuário Demo', cargo: 'Gerente' },
            identities: [],
            factors: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        } as unknown as User;

        set({
            user: demoUser,
            session: null,
            inicializado: true,
            modoDemo: true,
        });
    },

    signIn: async (email, password) => {
        if (!supabase) {
            set({ loading: false });
            return { error: new Error('Supabase não configurado') };
        }
        set({ loading: true });
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            set({ loading: false });
            return { error };
        } catch (err) {
            set({ loading: false });
            return { error: err };
        }
    },

    signOut: async () => {
        const { modoDemo } = get();
        if (!modoDemo && supabase) {
            try {
                await supabase.auth.signOut();
            } catch {
                // Silencia erro de logout
            }
        }
        set({ user: null, session: null, modoDemo: false, inicializado: true });
    },
}));
