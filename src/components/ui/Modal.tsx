// =============================================
// Componente: Modal — Diálogos modais reutilizáveis
// =============================================
import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    aberto: boolean;
    onFechar: () => void;
    titulo: string;
    children: ReactNode;
    tamanho?: 'sm' | 'md' | 'lg' | 'xl';
}

const tamanhos = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
};

export default function Modal({ aberto, onFechar, titulo, children, tamanho = 'md' }: ModalProps) {
    // Fecha com ESC
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onFechar();
        };
        if (aberto) {
            document.addEventListener('keydown', handler);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handler);
            document.body.style.overflow = '';
        };
    }, [aberto, onFechar]);

    if (!aberto) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onFechar}
            />
            {/* Modal */}
            <div
                className={`relative w-full ${tamanhos[tamanho]} bg-surface-800 border border-surface-700 rounded-2xl shadow-2xl animate-fade-in max-h-[90vh] flex flex-col`}
            >
                {/* Cabeçalho */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-surface-700">
                    <h2 className="text-lg font-bold text-surface-100">{titulo}</h2>
                    <button
                        onClick={onFechar}
                        className="p-1.5 rounded-lg text-surface-400 hover:text-surface-200 hover:bg-surface-700 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                {/* Conteúdo */}
                <div className="px-6 py-4 overflow-y-auto flex-1">
                    {children}
                </div>
            </div>
        </div>
    );
}
