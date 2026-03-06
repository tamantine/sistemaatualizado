// =============================================
// Store: Autenticação com Firebase Auth
// Login com email/senha - sem confirmação de email
// =============================================
import { create } from 'zustand';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../lib/firebase';

interface AuthState {
    user: User | null;
    loading: boolean;
    inicializado: boolean;
    modoDemo: boolean;
    error: string | null;

    // Ações
    signIn: (email: string, pass: string) => Promise<{ error: any }>;
    signUp: (email: string, pass: string) => Promise<{ error: any }>;
    signOut: () => Promise<void>;
    initialize: () => void;
    demoLogin: () => void;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    loading: true,
    inicializado: false,
    modoDemo: false,
    error: null,

    initialize: () => {
        // Escuta mudanças de autenticação com tratamento de erro
        try {
            onAuthStateChanged(auth, (user) => {
                set({ 
                    user, 
                    loading: false, 
                    inicializado: true,
                    modoDemo: false 
                });
            }, (error) => {
                // Erro no observer de autenticação
                console.warn('[Auth] Erro no observer de autenticação:', error);
                set({ 
                    user: null, 
                    loading: false, 
                    inicializado: true,
                    modoDemo: false 
                });
            });
        } catch (error) {
            // Erro ao inicializar auth
            console.warn('[Auth] Erro ao inicializar auth:', error);
            set({ 
                user: null, 
                loading: false, 
                inicializado: true,
                modoDemo: false 
            });
        }
    },

    signIn: async (email, password) => {
        set({ loading: true, error: null });
        try {
            await signInWithEmailAndPassword(auth, email, password);
            set({ loading: false, error: null });
            return { error: null };
        } catch (error: any) {
            let mensagem = 'Erro ao fazer login';
            
            if (error.code === 'auth/invalid-email') {
                mensagem = 'Email inválido';
            } else if (error.code === 'auth/user-not-found') {
                mensagem = 'Usuário não encontrado';
            } else if (error.code === 'auth/wrong-password') {
                mensagem = 'Senha incorreta';
            } else if (error.code === 'auth/invalid-credential') {
                mensagem = 'Email ou senha incorretos';
            } else if (error.code === 'auth/network-request-failed') {
                mensagem = 'Erro de conexão. Verifique sua internet.';
            }
            
            set({ loading: false, error: mensagem });
            return { error: { message: mensagem } };
        }
    },

    signUp: async (email, password) => {
        set({ loading: true, error: null });
        try {
            // Cria usuário sem precisar confirmar email
            await createUserWithEmailAndPassword(auth, email, password);
            set({ loading: false, error: null });
            return { error: null };
        } catch (error: any) {
            let mensagem = 'Erro ao criar conta';
            
            if (error.code === 'auth/email-already-in-use') {
                mensagem = 'Este email já está cadastrado';
            } else if (error.code === 'auth/invalid-email') {
                mensagem = 'Email inválido';
            } else if (error.code === 'auth/weak-password') {
                mensagem = 'Senha muito fraca (mínimo 6 caracteres)';
            } else if (error.code === 'auth/network-request-failed') {
                mensagem = 'Erro de conexão. Verifique sua internet.';
            }
            
            set({ loading: false, error: mensagem });
            return { error: { message: mensagem } };
        }
    },

    signOut: async () => {
        try {
            await firebaseSignOut(auth);
            set({ user: null, modoDemo: false });
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
            // Mesmo com erro, limpa o estado local
            set({ user: null, modoDemo: false });
        }
    },

    demoLogin: () => {
        // Modo demo - cria usuário fake
        set({
            user: null,
            modoDemo: true,
            loading: false,
            inicializado: true,
        });
    },

    clearError: () => set({ error: null }),
}));
