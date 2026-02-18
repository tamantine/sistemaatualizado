// =============================================
// Página: Login - Acesso ao Sistema
// Autenticação com Supabase
// =============================================
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { Lock, Mail, Loader2, ArrowRight } from 'lucide-react';

export default function Login() {
    const navigate = useNavigate();
    const { signIn, loading, user } = useAuthStore();
    const { adicionarToast } = useAppStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Redireciona se já estiver logado
    useEffect(() => {
        if (user) navigate('/');
    }, [user, navigate]);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setIsSubmitting(true);

        const { error } = await signIn(email, password);

        if (error) {
            adicionarToast({
                tipo: 'erro',
                titulo: 'Erro ao entrar',
                mensagem: error.message === 'Invalid login credentials'
                    ? 'Credenciais inválidas. Verifique seu e-mail e senha.'
                    : error.message
            });
            setIsSubmitting(false);
        } else {
            navigate('/', { replace: true });
            // Não precisa setar loading false aqui pois redireciona
        }
    }

    return (
        <div className="min-h-screen bg-surface-900 bg-grid-white/[0.02] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>

            <div className="w-full max-w-md relative z-10 animate-fade-in-up">
                {/* Logo & Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-xl shadow-brand-500/20 mb-4 transform hover:scale-105 transition-transform duration-300">
                        <Lock className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Bem-vindo de volta!</h1>
                    <p className="text-surface-400 text-sm">Acesse sua conta para gerenciar seu negócio</p>
                </div>

                {/* Login Form */}
                <div className="glass p-8 rounded-3xl border border-surface-700/50 shadow-2xl backdrop-blur-xl">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-surface-300 ml-1">E-mail</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-surface-500 group-focus-within:text-brand-400 transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seu@email.com"
                                    className="w-full bg-surface-800/50 border border-surface-600 rounded-xl pl-11 pr-4 py-3.5 text-surface-100 placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all text-sm shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-surface-300 ml-1">Senha</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-surface-500 group-focus-within:text-brand-400 transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-surface-800/50 border border-surface-600 rounded-xl pl-11 pr-4 py-3.5 text-surface-100 placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all text-sm shadow-inner"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || loading}
                            className="w-full group relative flex items-center justify-center gap-2 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-brand-500/25 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {isSubmitting || loading ? (
                                <Loader2 className="animate-spin h-5 w-5" />
                            ) : (
                                <>
                                    <span>Entrar no Sistema</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-surface-700/50 text-center">
                        <p className="text-xs text-surface-500">
                            Problemas para acessar? <a href="#" className="text-brand-400 hover:text-brand-300 transition-colors font-medium">Contate o suporte</a>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-xs text-surface-600 font-medium tracking-wide opacity-60">
                        &copy; {new Date().getFullYear()} Sistema Integrado • v1.0.0
                    </p>
                </div>
            </div>
        </div>
    );
}
