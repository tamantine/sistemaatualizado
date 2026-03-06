import React, { useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  CreditCard, 
  Package, 
  CalendarDays,
  Target
} from 'lucide-react';
import { useRelatoriosStore } from '../store/useRelatoriosStore';
import { formatarMoeda } from '../utils/formatters';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export function Relatorios() {
  const { 
    carregando, 
    erro, 
    periodo, 
    setPeriodo, 
    faturamentoTotal, 
    ticketMedio, 
    quantidadeVendas, 
    vendasPorFormaPagamento,
    vendasPorDia
  } = useRelatoriosStore();

  useEffect(() => {
    useRelatoriosStore.getState().carregarDados();
  }, []);

  const CORES_PIZZA = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (carregando) {
    return (
      <div className="flex h-full items-center justify-center p-8 bg-slate-900">
        <div className="flex flex-col items-center gap-4 text-emerald-500">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="font-medium animate-pulse">Compilando Dados Gerenciais...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-slate-900 min-h-[calc(100vh-4rem)] p-6">
      
      {/* ─── CABEÇALHO E FILTROS ───────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-emerald-500" />
            Dashboard Gerencial
          </h1>
          <p className="text-slate-400 mt-1">
            Análise em tempo real do faturamento e indicadores de performance (KPIs).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Período:
          </label>
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value as any)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-sm"
          >
            <option value="hoje">Hoje</option>
            <option value="7dias">Últimos 7 Dias</option>
            <option value="mes">Mês Atual</option>
            <option value="ano">Ano Atual</option>
            <option value="tudo">Todo o Período</option>
          </select>
        </div>
      </div>

      {erro && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl flex items-center gap-3">
          <Target className="h-5 w-5" /> {erro}
        </div>
      )}

      {/* ─── CARDS DE KPIS ─────────────── */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        
        <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-6 shadow-sm hover:border-emerald-500/30 transition-colors">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-emerald-500/10 p-3">
              <TrendingUp className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Faturamento Bruto</p>
              <p className="text-2xl font-bold text-white">{formatarMoeda(faturamentoTotal)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-6 shadow-sm hover:border-blue-500/30 transition-colors">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-blue-500/10 p-3">
              <CreditCard className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Ticket Médio</p>
              <p className="text-2xl font-bold text-white">{formatarMoeda(ticketMedio)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-6 shadow-sm hover:border-purple-500/30 transition-colors">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-purple-500/10 p-3">
              <Target className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Total de Vendas</p>
              <p className="text-2xl font-bold text-white">{quantidadeVendas}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-6 shadow-sm hover:border-amber-500/30 transition-colors">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-amber-500/10 p-3">
              <Package className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Previsão Unid. Vendidas</p>
              <p className="text-2xl font-bold text-white">~{(faturamentoTotal / (ticketMedio || 1) * 3).toFixed(0)}</p>
              <p className="text-xs text-slate-500 mt-1">Est. baseada no ticket</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── ROW DE GRÁFICOS ───────────── */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Gráfico Linear/Área de Vendas no Tempo */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-800/50 p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white">Evolução do Faturamento</h2>
            <p className="text-sm text-slate-400">Métricas financeiras contabilizadas dia-a-dia.</p>
          </div>
          <div className="h-[350px] w-full">
            {vendasPorDia.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={vendasPorDia} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                      <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="data" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis 
                          stroke="#94a3b8" 
                          fontSize={12} 
                          tickLine={false} 
                          axisLine={false}
                          tickFormatter={(value) => `R$ ${value}`}
                      />
                      <Tooltip 
                          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                          itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                          formatter={(value: any) => [formatarMoeda(value), 'Faturado']}
                          labelStyle={{ color: '#f8fafc', marginBottom: '8px' }}
                      />
                      <Area type="monotone" dataKey="valor" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorValor)" />
                  </AreaChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full w-full flex items-center justify-center border-2 border-dashed border-slate-700 rounded-lg">
                    <p className="text-slate-500 font-medium text-sm">O período atual não possui dados financeiros para mapear no gráfico.</p>
                </div>
            )}
            
          </div>
        </div>

        {/* Gráfico de Pizza Lado a Lado */}
        <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white">Formas de Pagamento</h2>
            <p className="text-sm text-slate-400">Distribuição do faturamento por forma recebida.</p>
          </div>
          <div className="h-[300px] w-full mt-8">
            {vendasPorFormaPagamento.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                    data={vendasPorFormaPagamento}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    >
                    {vendasPorFormaPagamento.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CORES_PIZZA[index % CORES_PIZZA.length]} />
                    ))}
                    </Pie>
                    <Tooltip 
                         contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                         itemStyle={{ color: '#fff' }}
                         formatter={(value: any) => [formatarMoeda(value), 'Valor']}
                    />
                    <Legend 
                        verticalAlign="bottom" 
                        height={36} 
                        iconType="circle"
                        wrapperStyle={{ paddingTop: '20px', fontSize: '13px', color: '#94a3b8' }}
                    />
                </PieChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full w-full flex items-center justify-center">
                    <p className="text-slate-500 text-sm text-center">Gráfico desativado.<br/>Nenhuma venda detectada.</p>
                </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
