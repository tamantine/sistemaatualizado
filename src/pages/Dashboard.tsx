// =============================================
// Página: Dashboard Gerencial
// =============================================
import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Area, AreaChart,
} from 'recharts';
import {
    DollarSign, ShoppingCart, Package, AlertTriangle,
    TrendingUp, TrendingDown, ArrowUpRight, Clock,
} from 'lucide-react';
import { metricasMock } from '../services/mockData';
import { formatarMoeda, formatarDataHora } from '../utils/formatters';

// Card de métrica
function CardMetrica({ titulo, valor, icone: Icone, cor, variacao }: {
    titulo: string;
    valor: string;
    icone: React.ElementType;
    cor: string;
    variacao?: { valor: number; positivo: boolean };
}) {
    return (
        <div className="glass rounded-2xl p-5 hover:scale-[1.02] transition-transform duration-200">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-surface-400 text-sm font-medium">{titulo}</p>
                    <p className="text-2xl font-bold text-surface-100 mt-1">{valor}</p>
                    {variacao && (
                        <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${variacao.positivo ? 'text-green-400' : 'text-red-400'}`}>
                            {variacao.positivo ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            <span>{variacao.positivo ? '+' : ''}{variacao.valor}% vs ontem</span>
                        </div>
                    )}
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cor}`}>
                    <Icone size={24} className="text-white" />
                </div>
            </div>
        </div>
    );
}

// Tooltip customizado para gráficos
function TooltipCustomizado({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="glass rounded-lg px-3 py-2 text-sm">
            <p className="text-surface-300 font-medium">{label}</p>
            {payload.map((p: any, i: number) => (
                <p key={i} style={{ color: p.color }} className="font-semibold">
                    {formatarMoeda(p.value)}
                </p>
            ))}
        </div>
    );
}

export default function Dashboard() {
    const dados = metricasMock;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Cards de métricas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <CardMetrica
                    titulo="Vendas Hoje"
                    valor={formatarMoeda(dados.vendasHoje)}
                    icone={DollarSign}
                    cor="bg-gradient-to-br from-brand-500 to-brand-700"
                    variacao={{ valor: 12.5, positivo: true }}
                />
                <CardMetrica
                    titulo="Ticket Médio"
                    valor={formatarMoeda(dados.ticketMedio)}
                    icone={ShoppingCart}
                    cor="bg-gradient-to-br from-accent-500 to-accent-700"
                    variacao={{ valor: 3.2, positivo: true }}
                />
                <CardMetrica
                    titulo="Produtos Vendidos"
                    valor={dados.produtosVendidos.toString()}
                    icone={Package}
                    cor="bg-gradient-to-br from-blue-500 to-blue-700"
                    variacao={{ valor: 8.1, positivo: true }}
                />
                <CardMetrica
                    titulo="Alertas Ativos"
                    valor={dados.alertasAtivos.toString()}
                    icone={AlertTriangle}
                    cor="bg-gradient-to-br from-red-500 to-red-700"
                />
            </div>

            {/* Gráficos - linha 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Vendas da semana - AreaChart */}
                <div className="glass rounded-2xl p-5 lg:col-span-2">
                    <h3 className="text-surface-200 font-semibold mb-4 flex items-center gap-2">
                        <TrendingUp size={18} className="text-brand-400" />
                        Vendas da Semana
                    </h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={dados.vendasSemana}>
                            <defs>
                                <linearGradient id="gradVendas" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="dia" stroke="#64748b" fontSize={12} />
                            <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                            <Tooltip content={<TooltipCustomizado />} />
                            <Area type="monotone" dataKey="valor" stroke="#16a34a" strokeWidth={3} fill="url(#gradVendas)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Vendas por categoria - PieChart */}
                <div className="glass rounded-2xl p-5">
                    <h3 className="text-surface-200 font-semibold mb-4 flex items-center gap-2">
                        <Package size={18} className="text-accent-400" />
                        Por Categoria
                    </h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie
                                data={dados.vendasPorCategoria}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={80}
                                paddingAngle={3}
                                dataKey="valor"
                            >
                                {dados.vendasPorCategoria.map((item, i) => (
                                    <Cell key={i} fill={item.cor} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        {dados.vendasPorCategoria.map((cat) => (
                            <div key={cat.nome} className="flex items-center gap-2 text-xs">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.cor }} />
                                <span className="text-surface-400">{cat.nome}</span>
                                <span className="text-surface-200 font-semibold ml-auto">{cat.valor}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Gráficos - linha 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Top 10 produtos */}
                <div className="glass rounded-2xl p-5">
                    <h3 className="text-surface-200 font-semibold mb-4 flex items-center gap-2">
                        <ArrowUpRight size={18} className="text-green-400" />
                        Top 10 Produtos
                    </h3>
                    <div className="space-y-3">
                        {dados.topProdutos.map((prod, i) => (
                            <div key={prod.nome} className="flex items-center gap-3">
                                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${i < 3 ? 'bg-brand-600/30 text-brand-400' : 'bg-surface-700 text-surface-400'
                                    }`}>
                                    {i + 1}
                                </span>
                                <span className="flex-1 text-sm text-surface-300 truncate">{prod.nome}</span>
                                <span className="text-xs text-surface-500">{prod.quantidade}un</span>
                                <span className="text-sm font-semibold text-surface-200">{formatarMoeda(prod.valor)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Alertas + Últimas vendas */}
                <div className="space-y-4">
                    {/* Alertas de estoque */}
                    <div className="glass rounded-2xl p-5">
                        <h3 className="text-surface-200 font-semibold mb-3 flex items-center gap-2">
                            <AlertTriangle size={18} className="text-red-400" />
                            Alertas de Estoque
                        </h3>
                        <div className="space-y-2">
                            {dados.alertasEstoque.map((alerta, i) => (
                                <div
                                    key={i}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm ${alerta.tipo === 'ruptura'
                                        ? 'bg-red-500/10 border border-red-500/20'
                                        : 'bg-yellow-500/10 border border-yellow-500/20'
                                        }`}
                                >
                                    <div className={`w-2 h-2 rounded-full ${alerta.tipo === 'ruptura' ? 'bg-red-400' : 'bg-yellow-400'}`} />
                                    <span className={`font-medium ${alerta.tipo === 'ruptura' ? 'text-red-300' : 'text-yellow-300'}`}>
                                        {alerta.produto}
                                    </span>
                                    <span className="text-surface-400 ml-auto text-xs">{alerta.detalhe}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Últimas vendas */}
                    <div className="glass rounded-2xl p-5">
                        <h3 className="text-surface-200 font-semibold mb-3 flex items-center gap-2">
                            <Clock size={18} className="text-blue-400" />
                            Últimas Vendas
                        </h3>
                        <div className="space-y-2">
                            {dados.ultimasVendas.slice(0, 4).map((venda) => (
                                <div key={venda.id} className="flex items-center justify-between px-3 py-2 rounded-xl bg-surface-800/50 hover:bg-surface-800 transition-colors">
                                    <div>
                                        <span className="text-sm font-semibold text-surface-200">#{venda.numero_venda}</span>
                                        <span className="text-xs text-surface-500 ml-2">{venda.operador_nome}</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-brand-400">{formatarMoeda(venda.total)}</p>
                                        <p className="text-xs text-surface-500">{formatarDataHora(venda.created_at)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
