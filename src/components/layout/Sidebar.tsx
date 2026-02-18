// =============================================
// Componente: Sidebar — Navegação lateral
// =============================================
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { useAuthStore } from '../../store/useAuthStore';
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    Users,
    DollarSign,
    Truck,
    Tag,
    BarChart3,
    Leaf,
    FileText,
    ShoppingBag,
    X,
    ChevronLeft,
    LogOut,
} from 'lucide-react';

// Itens do menu
const menuItens = [
    { path: '/', label: 'Dashboard', icone: LayoutDashboard },
    { path: '/pdv', label: 'PDV', icone: ShoppingCart },
    { path: '/estoque', label: 'Estoque', icone: Package },
    { path: '/clientes', label: 'Clientes', icone: Users },
    { path: '/financeiro', label: 'Financeiro', icone: DollarSign },
    { path: '/compras', label: 'Compras', icone: Truck },
    { path: '/promocoes', label: 'Promoções', icone: Tag },
    { path: '/fornecedores', label: 'Fornecedores', icone: ShoppingBag },
    { path: '/relatorios', label: 'Relatórios', icone: BarChart3 },
    { path: '/fiscal', label: 'Fiscal', icone: FileText },
    { path: '/hortifruti', label: 'Hortifruti', icone: Leaf },
];

export default function Sidebar() {
    const { sidebarAberta, toggleSidebar, setSidebarAberta } = useAppStore();
    const { user, signOut } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <>
            {/* Overlay mobile */}
            {sidebarAberta && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setSidebarAberta(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full z-40 flex flex-col bg-surface-900 border-r border-surface-700/50 transition-all duration-300 ${sidebarAberta ? 'w-64' : 'w-20'
                    } lg:relative`}
            >
                {/* Logo */}
                <div className="flex items-center gap-3 px-5 h-16 border-b border-surface-700/50">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shrink-0">
                        <Leaf size={20} className="text-white" />
                    </div>
                    {sidebarAberta && (
                        <div className="animate-fade-in">
                            <h1 className="font-bold text-base text-surface-100 leading-tight">Hortifruti</h1>
                            <p className="text-[10px] text-brand-400 font-semibold tracking-wider uppercase">Master</p>
                        </div>
                    )}
                    {/* Botão fechar (desktop: colapsar, mobile: fechar) */}
                    <button
                        onClick={toggleSidebar}
                        className="ml-auto p-1.5 rounded-lg text-surface-400 hover:text-surface-200 hover:bg-surface-800 transition-colors lg:block hidden"
                    >
                        <ChevronLeft size={18} className={`transition-transform ${!sidebarAberta ? 'rotate-180' : ''}`} />
                    </button>
                    <button
                        onClick={() => setSidebarAberta(false)}
                        className="ml-auto p-1.5 rounded-lg text-surface-400 hover:text-surface-200 lg:hidden"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Menu */}
                <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                    {menuItens.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => {
                                if (window.innerWidth < 1024) setSidebarAberta(false);
                            }}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive
                                    ? 'bg-brand-600/20 text-brand-400 shadow-sm'
                                    : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800'
                                } ${!sidebarAberta ? 'justify-center' : ''}`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icone
                                        size={20}
                                        className={`shrink-0 ${isActive ? 'text-brand-400' : 'text-surface-500 group-hover:text-surface-300'}`}
                                    />
                                    {sidebarAberta && <span className="animate-fade-in">{item.label}</span>}
                                    {isActive && sidebarAberta && (
                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse-green" />
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Footer da sidebar */}
                <div className="p-4 border-t border-surface-700/50">
                    {sidebarAberta ? (
                        <div className="flex items-center gap-3 px-2 mb-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                {user?.email?.substring(0, 2).toUpperCase() || 'US'}
                            </div>
                            <div className="animate-fade-in overflow-hidden">
                                <p className="text-sm font-semibold text-surface-200 truncate" title={user?.email || ''}>
                                    {user?.email?.split('@')[0] || 'Usuário'}
                                </p>
                                <p className="text-xs text-surface-500 truncate">Gerente</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-center mb-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-xs font-bold shrink-0" title={user?.email}>
                                {user?.email?.substring(0, 2).toUpperCase() || 'US'}
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleLogout}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 ${!sidebarAberta ? 'justify-center' : ''}`}
                    >
                        <LogOut size={20} className="shrink-0" />
                        {sidebarAberta && <span className="animate-fade-in">Sair</span>}
                    </button>
                </div>
            </aside>
        </>
    );
}
