import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, loading, inicializado } = useAuthStore();
    const location = useLocation();

    // Se ainda não inicializou (verificando sessão), mostra loading
    if (!inicializado || loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-surface-900 text-surface-400">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-brand-500" />
                <p className="text-sm font-medium animate-pulse">Carregando sistema...</p>
            </div>
        );
    }

    // Se não tem usuário, redireciona para login
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
}
