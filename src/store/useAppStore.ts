// =============================================
// Store Global do App (Zustand)
// =============================================
import { create } from 'zustand';
import type { Toast } from '../types';

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

    // Toasts
    toasts: [],
    adicionarToast: (toast) => {
        const id = crypto.randomUUID();
        set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }));
        // Remove automaticamente após 4 segundos
        setTimeout(() => {
            set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
        }, 4000);
    },
    removerToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

    // Usuário mock
    usuario: { nome: 'Carlos Silva', cargo: 'Gerente' },
}));
