// =============================================
// Store Global do App (Zustand)
// =============================================
import { create } from 'zustand';
import type { Toast } from '../types';

// Tipos válidos para toast
type ToastTipo = 'sucesso' | 'erro' | 'aviso' | 'info';

function isValidToastTipo(tipo: unknown): tipo is ToastTipo {
    return tipo === 'sucesso' || tipo === 'erro' || tipo === 'aviso' || tipo === 'info';
}

interface AppState {
    // Sidebar
    sidebarAberta: boolean;
    toggleSidebar: () => void;
    setSidebarAberta: (aberta: boolean) => void;

    // Toasts
    toasts: Toast[];
    adicionarToast: (toast: Omit<Toast, 'id'>) => void;
    removerToast: (id: string) => void;

    // Usuário atual (mock)
    usuario: { nome: string; cargo: string };
}

export const useAppStore = create<AppState>((set) => ({
    // Sidebar
    sidebarAberta: true,
    toggleSidebar: () => set((s) => ({ sidebarAberta: !s.sidebarAberta })),
    setSidebarAberta: (aberta) => set({ sidebarAberta: aberta }),

    // Toasts - com validação defensiva
    toasts: [],
    adicionarToast: (toast) => {
        // Validação defensiva do toast
        if (!toast || typeof toast !== 'object') {
            console.warn('[AppStore] Toast inválido:', toast);
            return;
        }
        
        // Garante que o tipo seja válido
        const toastValidado: Toast = {
            id: crypto.randomUUID(),
            tipo: isValidToastTipo(toast.tipo) ? toast.tipo : 'info',
            titulo: toast.titulo || 'Notificação',
            mensagem: toast.mensagem,
        };
        
        set((s) => ({ toasts: [...s.toasts, toastValidado] }));
        
        // Remove automaticamente após 4 segundos
        setTimeout(() => {
            try {
                set((s) => ({ toasts: s.toasts.filter((t) => t.id !== toastValidado.id) }));
            } catch (e) {
                console.warn('[AppStore] Erro ao remover toast automaticamente:', e);
            }
        }, 4000);
    },
    removerToast: (id) => {
        if (!id || typeof id !== 'string') {
            console.warn('[AppStore] ID inválido para removerToast:', id);
            return;
        }
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    },

    // Usuário mock
    usuario: { nome: 'Carlos Silva', cargo: 'Gerente' },
}));
