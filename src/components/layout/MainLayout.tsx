// =============================================
// Componente: MainLayout — Layout principal
// =============================================
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import ToastContainer from '../ui/Toast';
import { useSyncSupabase } from '../../hooks/useSyncSupabase';

export default function MainLayout() {
    // Sincronizar dados com Supabase ao entrar
    useSyncSupabase();

    return (
        <div className="flex h-screen overflow-hidden bg-surface-900">
            {/* Sidebar */}
            <Sidebar />

            {/* Área principal */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <Header />

                {/* Conteúdo da página */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                    <Outlet />
                </main>
            </div>

            {/* Toasts globais */}
            <ToastContainer />
        </div>
    );
}
