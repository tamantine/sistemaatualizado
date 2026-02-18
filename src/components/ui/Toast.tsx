// =============================================
// Componente: Toast — Sistema de Notificações
// =============================================
import { useAppStore } from '../../store/useAppStore';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const icones = {
    sucesso: CheckCircle,
    erro: AlertCircle,
    aviso: AlertTriangle,
    info: Info,
};

const cores = {
    sucesso: 'border-green-500 bg-green-500/10 text-green-400',
    erro: 'border-red-500 bg-red-500/10 text-red-400',
    aviso: 'border-yellow-500 bg-yellow-500/10 text-yellow-400',
    info: 'border-blue-500 bg-blue-500/10 text-blue-400',
};

export default function ToastContainer() {
    const { toasts, removerToast } = useAppStore();

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 max-w-sm">
            {toasts.map((toast) => {
                const Icone = icones[toast.tipo];
                return (
                    <div
                        key={toast.id}
                        className={`animate-fade-in flex items-start gap-3 p-4 rounded-xl border backdrop-blur-sm ${cores[toast.tipo]}`}
                    >
                        <Icone size={20} className="shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm">{toast.titulo}</p>
                            {toast.mensagem && (
                                <p className="text-xs opacity-80 mt-0.5">{toast.mensagem}</p>
                            )}
                        </div>
                        <button
                            onClick={() => removerToast(toast.id)}
                            className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
                        >
                            <X size={16} />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
