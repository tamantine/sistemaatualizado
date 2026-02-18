import { useEffect, useState } from "react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart } from "recharts";
import { DollarSign, ShoppingCart, Package, AlertTriangle, TrendingUp, TrendingDown, ArrowUpRight, Clock } from "lucide-react";
import { dashboardService } from "../services/supabaseService";
import { formatarMoeda, formatarDataHora } from "../utils/formatters";
import type { MetricasDashboard } from "../types";

function CardMetrica({ titulo, valor, icone: Icone, cor, variacao }: { titulo: string; valor: string; icone: React.ElementType; cor: string; variacao?: { valor: number; positivo: boolean }; }) {
    return (
        <div className="glass rounded-2xl p-5 hover:scale-[1.02] transition-transform duration-200">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-surface-400 text-sm font-medium">{titulo}</p>
                    <p className="text-2xl font-bold text-surface-100 mt-1">{valor}</p>
                    {variacao && variacao.valor > 0 && (
                        <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${variacao.positivo ? "text-green-400" : "text-red-400"}`}>
                            {variacao.positivo ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            <span>{variacao.positivo ? "+" : ""}{variacao.valor}% vs ontem</span>
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
    const [dados, setDados] = useState<MetricasDashboard | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<string | null>(null);

    useEffect(() => {
        async function carregarDados() {
            try {
                setErro(null);
                const metricasReais = await dashboardService.obterMetricas();
                setDados(metricasReais as any);
            } catch (error) {
                const mensagem = error instanceof Error ? error.message : 'Erro ao carregar métricas';
                console.error("Erro ao carregar métricas:", error);
                setErro(`Falha ao carregar dados: ${mensagem}`);
            } finally {
                setCarregando(false);
            }
        }
        carregarDados();
    }, []);

    if (carregando) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
            </div>
        );
    }

    if (erro || !dados) {
        return (
            <div className="flex items-center justify-center h-[60vh] flex-col gap-4">
                <div className="text-center">
                    <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-2" />
                    <h2 className="text-xl font-bold text-surface-200">Erro ao carregar Dashboard</h2>
                    <p className="text-surface-400 mt-2">{erro || 'Nenhum dado disponível'}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-500 transition-colors"
                    >
                        Tentar Novamente
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <CardMetrica titulo="Vendas Hoje" valor={formatarMoeda(dados.vendasHoje)} icone={DollarSign} cor="bg-gradient-to-br from-brand-500 to-brand-700" />
                <CardMetrica titulo="Ticket Médio" valor={formatarMoeda(dados.ticketMedio)} icone={ShoppingCart} cor="bg-gradient-to-br from-accent-500 to-accent-700" />
                <CardMetrica titulo="Produtos Vendidos" valor={dados.produtosVendidos.toString()} icone={Package} cor="bg-gradient-to-br from-blue-500 to-blue-700" />
                <CardMetrica titulo="Alertas Ativos" valor={dados.alertasAtivos.toString()} icone={AlertTriangle} cor="bg-gradient-to-br from-red-500 to-red-700" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="glass rounded-2xl p-5 lg:col-span-2">
                    <h3 className="text-surface-200 font-semibold mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-brand-400" /> Desempenho Semanal</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dados.vendasSemana}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="dia" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `R$ ${v}`} />
                                <Tooltip content={<TooltipCustomizado />} />
                                <Area type="monotone" dataKey="valor" stroke="#22c55e" strokeWidth={3} fillOpacity={0.3} fill="#22c55e" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="glass rounded-2xl p-5">
                    <h3 className="text-surface-200 font-semibold mb-4 flex items-center gap-2"><Package size={18} className="text-accent-400" /> Vendas por Categoria</h3>
                    <div className="h-[220px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={dados.vendasPorCategoria} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="valor">
                                    {dados.vendasPorCategoria.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.cor} />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="glass rounded-2xl p-5">
                    <h3 className="text-surface-200 font-semibold mb-4 flex items-center gap-2"><ArrowUpRight size={18} className="text-green-400" /> Top 10 Produtos</h3>
                    <div className="space-y-3">
                        {dados.topProdutos.length > 0 ? dados.topProdutos.map((prod, i) => (
                            <div key={prod.nome} className="flex items-center gap-3">
                                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${i < 3 ? "bg-brand-600/30 text-brand-400" : "bg-surface-700 text-surface-400"}`}>{i + 1}</span>
                                <span className="flex-1 text-sm text-surface-300 truncate">{prod.nome}</span>
                                <span className="text-xs text-surface-500">{prod.quantidade}un</span>
                                <span className="text-sm font-semibold text-surface-200">{formatarMoeda(prod.valor)}</span>
                            </div>
                        )) : <p className="text-surface-500 text-sm text-center py-10">Nenhum dado disponível</p>}
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="glass rounded-2xl p-5">
                        <h3 className="text-surface-200 font-semibold mb-3 flex items-center gap-2"><AlertTriangle size={18} className="text-red-400" /> Alertas de Estoque</h3>
                        <div className="space-y-2">
                            {dados.alertasEstoque.length > 0 ? dados.alertasEstoque.map((alerta, i) => (
                                <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm ${alerta.tipo === "ruptura" ? "bg-red-500/10 border border-red-500/20" : "bg-yellow-500/10 border border-yellow-500/20"}`}>
                                    <div className={`w-2 h-2 rounded-full ${alerta.tipo === "ruptura" ? "bg-red-400" : "bg-yellow-400"}`} />
                                    <span className={`font-medium ${alerta.tipo === "ruptura" ? "text-red-300" : "text-yellow-300"}`}>{alerta.produto}</span>
                                    <span className="text-surface-400 ml-auto text-xs">{alerta.detalhe}</span>
                                </div>
                            )) : <p className="text-surface-500 text-sm text-center py-5">Nenhum alerta ativo</p>}
                        </div>
                    </div>
                    <div className="glass rounded-2xl p-5">
                        <h3 className="text-surface-200 font-semibold mb-3 flex items-center gap-2"><Clock size={18} className="text-blue-400" /> Últimas Vendas</h3>
                        <div className="space-y-2">
                            {dados.ultimasVendas.length > 0 ? dados.ultimasVendas.slice(0, 4).map((venda) => (
                                <div key={venda.id} className="flex items-center justify-between px-3 py-2 rounded-xl bg-surface-800/50 hover:bg-surface-800 transition-colors">
                                    <div><span className="text-sm font-semibold text-surface-200">#{venda.numero_venda}</span><span className="text-xs text-surface-500 ml-2">{venda.operador_nome}</span></div>
                                    <div className="text-right"><p className="text-sm font-bold text-brand-400">{formatarMoeda(venda.total)}</p><p className="text-xs text-surface-500">{formatarDataHora(venda.created_at)}</p></div>
                                </div>
                            )) : <p className="text-surface-500 text-sm text-center py-5">Nenhuma venda registrada hoje</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
