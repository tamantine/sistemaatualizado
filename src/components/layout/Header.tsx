// =============================================
// Componente: Header — Barra superior
// =============================================
import { useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { Menu, Bell, Search } from 'lucide-react';
import { useState } from 'react';

// Mapa de títulos por rota
const titulosRota: Record<string, string> = {
    '/': 'Dashboard',
    '/pdv': 'Frente de Caixa',
    '/estoque': 'Gestão de Estoque',
    '/clientes': 'Clientes & CRM',
    '/financeiro': 'Financeiro',
    '/compras': 'Compras',
    '/promocoes': 'Promoções',
    '/fornecedores': 'Fornecedores',
    '/relatorios': 'Relatórios',
    '/fiscal': 'Fiscal',
    '/hortifruti': 'Módulo Hortifruti',
};

export default function Header() {
    const location = useLocation();
    const { setSidebarAberta, sidebarAberta } = useAppStore();
    const [buscaAberta, setBuscaAberta] = useState(false);
    const titulo = titulosRota[location.pathname] || 'Hortifruti Master';

    return (
        <header className="h-16 bg-surface-900/80 backdrop-blur-md border-b border-surface-700/50 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
            {/* Lado esquerdo */}
            <div className="flex items-center gap-3">
                {/* Botão menu mobile */}
                <button
                    onClick={() => setSidebarAberta(!sidebarAberta)}
                    className="p-2 rounded-lg text-surface-400 hover:text-surface-200 hover:bg-surface-800 transition-colors lg:hidden"
                >
                    <Menu size={20} />
                </button>
                <div>
                    <h1 className="text-lg font-bold text-surface-100">{titulo}</h1>
                    <p className="text-xs text-surface-500 hidden sm:block">
                        {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
            </div>

            {/* Lado direito */}
            <div className="flex items-center gap-2">
                {/* Busca global */}
                {buscaAberta ? (
                    <div className="animate-fade-in flex items-center gap-2 bg-surface-800 rounded-xl px-3 py-1.5 border border-surface-700">
                        <Search size={16} className="text-surface-400" />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            className="bg-transparent border-none outline-none text-sm text-surface-200 w-40 placeholder:text-surface-500"
                            autoFocus
                            onBlur={() => setBuscaAberta(false)}
                        />
                    </div>
                ) : (
                    <button
                        onClick={() => setBuscaAberta(true)}
                        className="p-2 rounded-lg text-surface-400 hover:text-surface-200 hover:bg-surface-800 transition-colors"
                    >
                        <Search size={20} />
                    </button>
                )}

                {/* Notificações */}
                <button className="relative p-2 rounded-lg text-surface-400 hover:text-surface-200 hover:bg-surface-800 transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-accent-500 rounded-full" />
                </button>
            </div>
        </header>
    );
}
