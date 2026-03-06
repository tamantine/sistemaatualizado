import { create } from 'zustand';
import { vendasService, produtosService } from '../services/database';
import type { Venda } from '../types';
import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, isWithinInterval, startOfYear, endOfYear } from 'date-fns';

type Periodo = 'hoje' | '7dias' | 'mes' | 'ano' | 'tudo';

interface RelatoriosState {
  vendasFiltradas: Venda[];
  periodo: Periodo;
  carregando: boolean;
  erro: string | null;
  
  // Métricas agregadas
  faturamentoTotal: number;
  ticketMedio: number;
  quantidadeVendas: number;
  produtosVendidos: number;
  
  // Dados de Gráficos
  vendasPorDia: { data: string; valor: number }[];
  vendasPorFormaPagamento: { name: string; value: number }[];
  topProdutos: { nome: string; quantidade: number; valor: number }[];

  // Ações
  setPeriodo: (periodo: Periodo) => void;
  carregarDados: () => Promise<void>;
}

export const useRelatoriosStore = create<RelatoriosState>((set, get) => ({
  vendasFiltradas: [],
  periodo: '7dias',
  carregando: false,
  erro: null,
  
  faturamentoTotal: 0,
  ticketMedio: 0,
  quantidadeVendas: 0,
  produtosVendidos: 0,
  
  vendasPorDia: [],
  vendasPorFormaPagamento: [],
  topProdutos: [],

  setPeriodo: (periodo) => {
    set({ periodo });
    get().carregarDados();
  },

  carregarDados: async () => {
    set({ carregando: true, erro: null });
    try {
      const periodoStr = get().periodo;
      const agora = new Date();
      let inicio: Date;
      let fim: Date = endOfDay(agora);

      switch (periodoStr) {
        case 'hoje':
          inicio = startOfDay(agora);
          break;
        case '7dias':
          inicio = startOfDay(subDays(agora, 7));
          break;
        case 'mes':
          inicio = startOfMonth(agora);
          fim = endOfMonth(agora);
          break;
        case 'ano':
          inicio = startOfYear(agora);
          fim = endOfYear(agora);
          break;
        case 'tudo':
        default:
          inicio = new Date(2000, 0, 1);
          break;
      }

      // Buscando 1000 últimas vendas no firebase
      // (Para algo muito escalável, precisaríamos de Cloud Functions p/ sumarizar o banco todo)
      const todasVendas = await vendasService.listar(1500);
      
      const vendasNoPeriodo = todasVendas.filter(v => 
        isWithinInterval(new Date(v.created_at), { start: inicio, end: fim })
      );

      // --- CÁLCULO DAS MÉTRICAS GERAIS ---
      // Apenas vendas que não foram canceladas
      const vendasValidas = vendasNoPeriodo.filter(v => v.status !== 'cancelada' && v.status !== 'em_espera');
      
      const qtd = vendasValidas.length;
      const faturamento = vendasValidas.reduce((acc, v) => acc + (v.total || 0), 0);
      const ticketM = qtd > 0 ? (faturamento / qtd) : 0;
      
      // Quantidade de produtos vendidos (Baseando nos VendaItem se exisitirem - No setup atual não guardamos a cascata das querys aqui logo de cara,
      // mas podemos aproximar ou tentar ler de movimentacoesEstoque. Pro momento: Aproximação do subtotal)
      const mockProdutosVendidos = vendasValidas.reduce((acc, v) => acc + ((v.total || 0) > 0 ? 3 : 0), 0); // Placeholder

      // --- VENDAS POR FORMA DE PAGAMENTO ---
      const pgtoMap: Record<string, number> = {};
      vendasValidas.forEach(v => {
        const fp = v.forma_pagamento || 'N/A';
        pgtoMap[fp] = (pgtoMap[fp] || 0) + (v.total || 0);
      });
      const graficoPgto = Object.entries(pgtoMap).map(([name, value]) => ({ 
          name: name.toUpperCase(), 
          value: Number(value.toFixed(2)) 
        }));

      // --- VENDAS POR DIA (Gráfico de Área) ---
      const diaMap: Record<string, number> = {};
      vendasValidas.forEach(v => {
        const dia = new Date(v.created_at).toLocaleDateString();
        diaMap[dia] = (diaMap[dia] || 0) + (v.total || 0);
      });
      const graficoDias = Object.entries(diaMap)
        .sort((a, b) => {
            const [diaA, mesA, anoA] = a[0].split('/');
            const [diaB, mesB, anoB] = b[0].split('/');
            return new Date(`${anoA}-${mesA}-${diaA}`).getTime() - new Date(`${anoB}-${mesB}-${diaB}`).getTime();
        })
        .map(([data, valor]) => ({ data: data.substring(0,5), valor: Number(valor.toFixed(2)) }));

      set({
        vendasFiltradas: vendasValidas,
        faturamentoTotal: faturamento,
        quantidadeVendas: qtd,
        ticketMedio: ticketM,
        produtosVendidos: mockProdutosVendidos,
        vendasPorFormaPagamento: graficoPgto,
        vendasPorDia: graficoDias,
        carregando: false
      });

    } catch (error: any) {
      console.error('[RelatoriosStore] Erro ao carregar dados:', error);
      set({ erro: error.message || 'Falha ao processar relatórios', carregando: false });
    }
  }
}));
