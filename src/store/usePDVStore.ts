// =============================================
// Store do PDV (Zustand) — Integrado com Firebase (Firestore)
//
// COMPORTAMENTO:
//  • Produtos carregados do Firebase (vazio = lista vazia, não mock)
//  • Caixa sincronizado com Firebase + fallback localStorage
//  • Vendas registradas no Firebase; fallback local em caso de falha
//  • Nunca injeta dados de exemplo automaticamente
// =============================================

import { create } from 'zustand';
import type { Produto, Caixa, MovimentacaoCaixa } from '../types';
import {
  produtosService,
  caixasService,
  vendasService,
  movimentacoesCaixaService,
} from '../services/database';
import { gerarRelatorioFechamentoPDF } from '../utils/pdfGenerator';

// ─────────────────────────────────────────────
// Tipos locais
// ─────────────────────────────────────────────

export interface CarrinhoItem {
  id: string;
  produto: Produto;
  quantidade: number;
  preco_unitario: number;
  desconto: number;
  subtotal: number;
}

export interface VendaEspera {
  id: string;
  itens: CarrinhoItem[];
  cliente_nome?: string;
  observacao?: string;
  criado_em: string;
}

export interface VendaFinalizada {
  id: string;
  cliente_nome?: string;
  operador_nome?: string;
  data: string;
  forma_pagamento: string;
  pagamentos?: { forma: string; valor: number }[];
  total: number;
  subtotal: number;
  desconto: number;
  troco: number;
  valor_pago: number;
  itens: {
    nome: string;
    quantidade: number;
    unidade: string;
    preco_unitario: number;
    desconto: number;
    subtotal: number;
  }[];
}

// ─────────────────────────────────────────────
// Interface do estado
// ─────────────────────────────────────────────

interface PDVState {
  // Caixa
  caixa: Caixa | null;
  caixaAberto: boolean;

  // Catálogo de produtos (vindo do Firebase)
  produtos: Produto[];
  buscaProduto: string;
  /** true quando há falha de conexão com Firebase */
  offlineFallback: boolean;

  // Carrinho
  itens: CarrinhoItem[];
  clienteNome: string;
  observacao: string;

  // Descontos
  descontoGeral: number;   // percentual
  descontoValor: number;   // valor fixo

  // Vendas em espera
  vendasEspera: VendaEspera[];

  // Histórico de movimentações do caixa (sangria/suprimento)
  movimentacoes: MovimentacaoCaixa[];

  // Última venda finalizada (para impressão de cupom)
  ultimaVenda: VendaFinalizada | null;

  // Modais
  modalPagamento: boolean;
  modalCaixa: boolean;
  modalSangria: boolean;
  modalEspera: boolean;

  // ─── Ações do caixa ────────────────────────
  abrirCaixa: (valorAbertura: number, operador: string) => Promise<void>;
  fecharCaixa: () => Promise<void>;
  verificarCaixaAberto: () => Promise<void>;
  registrarMovimentacao: (
    tipo: 'sangria' | 'suprimento',
    valor: number,
    motivo: string
  ) => Promise<void>;

  // ─── Ações do carrinho ─────────────────────
  setBuscaProduto: (busca: string) => void;
  adicionarItem: (produto: Produto, quantidade?: number) => void;
  removerItem: (itemId: string) => void;
  atualizarQuantidade: (itemId: string, quantidade: number) => void;
  atualizarDesconto: (itemId: string, desconto: number) => void;
  limparCarrinho: () => void;
  setClienteNome: (nome: string) => void;
  setObservacao: (obs: string) => void;
  setDescontoGeral: (desconto: number) => void;
  setDescontoValor: (valor: number) => void;

  // ─── Vendas em espera ──────────────────────
  salvarEmEspera: () => void;
  recuperarEspera: (id: string) => void;
  removerEspera: (id: string) => void;

  // ─── Modais ────────────────────────────────
  setModalPagamento: (aberto: boolean) => void;
  setModalCaixa: (aberto: boolean) => void;
  setModalSangria: (aberto: boolean) => void;
  setModalEspera: (aberto: boolean) => void;
  limparUltimaVenda: () => void;

  // ─── Firebase ──────────────────────────────
  carregarProdutos: () => Promise<void>;
  registrarVenda: (
    formaPagamento: string,
    valorPago: number,
    troco: number,
    pagamentos?: { forma_pagamento: string; valor: number }[]
  ) => Promise<VendaFinalizada | null>;

  // ─── Getters computados ────────────────────
  subtotal: () => number;
  totalDesconto: () => number;
  total: () => number;
  totalItens: () => number;
  produtosFiltrados: () => Produto[];
}

// ─────────────────────────────────────────────
// Helpers de contador local (modo offline)
// ─────────────────────────────────────────────

function getContadorVendasLocal(): number {
  try {
    const v = localStorage.getItem('pdv_contador_vendas');
    return v ? parseInt(v, 10) : 0;
  } catch {
    return 0;
  }
}

function incrementarContadorVendasLocal(): number {
  const n = getContadorVendasLocal() + 1;
  try {
    localStorage.setItem('pdv_contador_vendas', String(n));
  } catch { /* storage indisponível */ }
  return n;
}

// ─────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────

export const usePDVStore = create<PDVState>((set, get) => ({
  // Estado inicial — sempre limpo, sem dados de exemplo
  caixa: null,
  caixaAberto: false,
  produtos: [],
  buscaProduto: '',
  offlineFallback: false,
  itens: [],
  clienteNome: '',
  observacao: '',
  descontoGeral: 0,
  descontoValor: 0,
  vendasEspera: [],
  movimentacoes: [],
  ultimaVenda: null,
  modalPagamento: false,
  modalCaixa: false,
  modalSangria: false,
  modalEspera: false,

  // ─────────────────────────────────────────
  // Carregamento de produtos do Firebase
  // ─────────────────────────────────────────

  carregarProdutos: async () => {
    try {
      const produtos = await produtosService.listar();
      // Retornou com sucesso (mesmo que lista vazia) → usa dados reais do cliente
      set({ produtos, offlineFallback: false });
      console.log(`[PDV] ✅ ${produtos.length} produto(s) carregado(s) do Firebase.`);
    } catch (err) {
      // Falha de conexão → lista vazia, sem dados de exemplo
      console.error('[PDV] ❌ Falha ao carregar produtos do Firebase:', err);
      set({ produtos: [], offlineFallback: true });
    }
  },

  // ─────────────────────────────────────────
  // Caixa
  // ─────────────────────────────────────────

  verificarCaixaAberto: async () => {
    // SEMPRE busca apenas no Firebase - nunca usa localStorage
    // Se não houver caixa aberto no Firebase, inicia fechado
    
    // Limpa dados antigos do localStorage para garantir estado limpo
    localStorage.removeItem('pdv_caixa');
    
    try {
      const caixaFirebase = await caixasService.buscarAberto();
      if (caixaFirebase) {
        set({ caixa: caixaFirebase, caixaAberto: true });
        return;
      }
    } catch {
      /* Firebase indisponível — inicia com caixa fechado */
    }

    // Sempre inicia com caixa fechado quando não há dados no Firebase
    set({ caixa: null, caixaAberto: false });
  },

  abrirCaixa: async (valorAbertura, operador) => {
    const dadosCaixa = {
      numero: 1,
      operador_nome: operador,
      status: 'aberto' as const,
      valor_abertura: valorAbertura,
      valor_dinheiro: valorAbertura,
      valor_cartao_debito: 0,
      valor_cartao_credito: 0,
      valor_pix: 0,
      valor_sangria: 0,
      valor_suprimento: 0,
      total_vendas: 0,
      aberto_em: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    try {
      const caixaCriada = await caixasService.abrir(dadosCaixa);
      if (caixaCriada) {
        localStorage.setItem('pdv_caixa', JSON.stringify(caixaCriada));
        set({ caixa: caixaCriada, caixaAberto: true, modalCaixa: false });
        return;
      }
    } catch { /* Firebase indisponível → cria caixa local */ }

    const caixa: Caixa = { id: crypto.randomUUID(), ...dadosCaixa };
    localStorage.setItem('pdv_caixa', JSON.stringify(caixa));
    set({ caixa, caixaAberto: true, modalCaixa: false });
  },

  fecharCaixa: async () => {
    const { caixa } = get();
    if (caixa) {
      try {
        const valor_fechamento = (caixa.valor_dinheiro ?? 0) +
          (caixa.valor_cartao_debito ?? 0) +
          (caixa.valor_cartao_credito ?? 0) +
          (caixa.valor_pix ?? 0);
          
        await caixasService.fechar(caixa.id, { valor_fechamento });
        
        caixa.status = 'fechado';
        caixa.valor_fechamento = valor_fechamento;
        caixa.fechado_em = new Date().toISOString();

        // Busca Vendas e Movimentações para PDF
        const vendas = await vendasService.listarPorCaixa(caixa.id);
        const movimentacoes = await movimentacoesCaixaService.listarPorCaixa(caixa.id);
        
        gerarRelatorioFechamentoPDF(caixa, vendas, movimentacoes);
        
      } catch (err) { 
        console.error('[PDV] Erro ao fechar caixa e gerar relatório:', err);
      }
    }
    localStorage.removeItem('pdv_caixa');
    set((s) => ({
      caixa: s.caixa
        ? { ...s.caixa, status: 'fechado' as const, fechado_em: new Date().toISOString() }
        : null,
      caixaAberto: false,
    }));
  },

  // ─────────────────────────────────────────
  // Sangria / Suprimento
  // ─────────────────────────────────────────

  registrarMovimentacao: async (tipo, valor, motivo) => {
    const { caixa } = get();
    if (!caixa) return;

    const caixaAtualizado: Caixa = {
      ...caixa,
      valor_dinheiro:
        tipo === 'sangria'
          ? (caixa.valor_dinheiro ?? 0) - valor
          : (caixa.valor_dinheiro ?? 0) + valor,
      valor_sangria:
        tipo === 'sangria'
          ? (caixa.valor_sangria ?? 0) + valor
          : (caixa.valor_sangria ?? 0),
      valor_suprimento:
        tipo === 'suprimento'
          ? (caixa.valor_suprimento ?? 0) + valor
          : (caixa.valor_suprimento ?? 0),
    };

    const movLocal: MovimentacaoCaixa = {
      id: crypto.randomUUID(),
      caixa_id: caixa.id,
      tipo,
      valor,
      motivo,
      operador_nome: caixa.operador_nome,
      created_at: new Date().toISOString(),
    };

    set((s) => ({
      caixa: caixaAtualizado,
      movimentacoes: [movLocal, ...s.movimentacoes],
    }));
    localStorage.setItem('pdv_caixa', JSON.stringify(caixaAtualizado));

    try {
      await movimentacoesCaixaService.criar({
        caixa_id: caixa.id,
        tipo,
        valor,
        motivo,
        operador_nome: caixa.operador_nome,
      });
      await caixasService.atualizar(caixa.id, {
        valor_dinheiro: caixaAtualizado.valor_dinheiro,
        valor_sangria: caixaAtualizado.valor_sangria,
        valor_suprimento: caixaAtualizado.valor_suprimento,
      });
    } catch (err) {
      console.warn('[PDV] Movimentação salva localmente (Firebase indisponível):', err);
    }
  },

  // ─────────────────────────────────────────
  // Carrinho
  // ─────────────────────────────────────────

  setBuscaProduto: (buscaProduto) => set({ buscaProduto }),

  adicionarItem: (produto, quantidade = 1) => {
    set((s) => {
      const existente = s.itens.find((i) => i.produto.id === produto.id);
      if (existente) {
        return {
          itens: s.itens.map((i) =>
            i.produto.id === produto.id
              ? {
                  ...i,
                  quantidade: i.quantidade + quantidade,
                  subtotal: Math.max(
                    0,
                    (i.quantidade + quantidade) * i.preco_unitario - i.desconto
                  ),
                }
              : i
          ),
        };
      }

      const precoReal =
        produto.em_promocao && produto.preco_promocional
          ? produto.preco_promocional
          : produto.preco_venda;

      const novoItem: CarrinhoItem = {
        id: crypto.randomUUID(),
        produto,
        quantidade,
        preco_unitario: precoReal,
        desconto: 0,
        subtotal: quantidade * precoReal,
      };

      return { itens: [...s.itens, novoItem] };
    });
  },

  removerItem: (itemId) =>
    set((s) => ({ itens: s.itens.filter((i) => i.id !== itemId) })),

  atualizarQuantidade: (itemId, quantidade) =>
    set((s) => ({
      itens: s.itens.map((i) =>
        i.id === itemId
          ? { ...i, quantidade, subtotal: Math.max(0, quantidade * i.preco_unitario - i.desconto) }
          : i
      ),
    })),

  atualizarDesconto: (itemId, desconto) =>
    set((s) => ({
      itens: s.itens.map((i) =>
        i.id === itemId
          ? {
              ...i,
              desconto: Math.max(0, desconto),
              subtotal: Math.max(0, i.quantidade * i.preco_unitario - desconto),
            }
          : i
      ),
    })),

  limparCarrinho: () =>
    set({ itens: [], clienteNome: '', observacao: '', descontoGeral: 0, descontoValor: 0 }),

  setClienteNome: (clienteNome) => set({ clienteNome }),
  setObservacao: (observacao) => set({ observacao }),
  setDescontoGeral: (descontoGeral) => set({ descontoGeral }),
  setDescontoValor: (descontoValor) => set({ descontoValor }),
  limparUltimaVenda: () => set({ ultimaVenda: null }),

  // ─────────────────────────────────────────
  // Vendas em espera
  // ─────────────────────────────────────────

  salvarEmEspera: () => {
    const { itens, clienteNome, observacao } = get();
    if (itens.length === 0) return;

    const espera: VendaEspera = {
      id: crypto.randomUUID(),
      itens: [...itens],
      cliente_nome: clienteNome,
      observacao,
      criado_em: new Date().toISOString(),
    };

    set((s) => ({
      vendasEspera: [...s.vendasEspera, espera],
      itens: [],
      clienteNome: '',
      observacao: '',
      descontoGeral: 0,
      descontoValor: 0,
      modalEspera: false,
    }));
  },

  recuperarEspera: (id) => {
    const espera = get().vendasEspera.find((v) => v.id === id);
    if (!espera) return;
    set((s) => ({
      itens: espera.itens,
      clienteNome: espera.cliente_nome ?? '',
      observacao: espera.observacao ?? '',
      vendasEspera: s.vendasEspera.filter((v) => v.id !== id),
      modalEspera: false,
    }));
  },

  removerEspera: (id) =>
    set((s) => ({ vendasEspera: s.vendasEspera.filter((v) => v.id !== id) })),

  // ─────────────────────────────────────────
  // Modais
  // ─────────────────────────────────────────

  setModalPagamento: (modalPagamento) => set({ modalPagamento }),
  setModalCaixa: (modalCaixa) => set({ modalCaixa }),
  setModalSangria: (modalSangria) => set({ modalSangria }),
  setModalEspera: (modalEspera) => set({ modalEspera }),

  // ─────────────────────────────────────────
  // Getters computados
  // ─────────────────────────────────────────

  subtotal: () => get().itens.reduce((acc, i) => acc + i.subtotal, 0),

  totalDesconto: () => {
    const { descontoGeral, descontoValor } = get();
    const sub = get().subtotal();
    return (sub * descontoGeral) / 100 + descontoValor;
  },

  total: () => Math.max(0, get().subtotal() - get().totalDesconto()),

  totalItens: () => get().itens.reduce((acc, i) => acc + i.quantidade, 0),

  produtosFiltrados: () => {
    const { produtos, buscaProduto } = get();
    if (!buscaProduto.trim()) return produtos.filter((p) => p.ativo);
    const q = buscaProduto.toLowerCase();
    return produtos.filter(
      (p) =>
        p.ativo &&
        (p.nome.toLowerCase().includes(q) ||
          p.codigo?.toLowerCase().includes(q) ||
          p.codigo_barras?.includes(buscaProduto))
    );
  },

  // ─────────────────────────────────────────
  // Registrar venda no Firebase
  // ─────────────────────────────────────────

  registrarVenda: async (formaPagamento, valorPago, troco, pagamentos) => {
    const { itens, caixa, clienteNome, observacao, descontoGeral, descontoValor } = get();
    if (itens.length === 0) return null;

    const sub = get().subtotal();
    const totalVenda = get().total();
    const vendaId = crypto.randomUUID();
    const now = new Date().toISOString();
    const numeroVenda = incrementarContadorVendasLocal();

    const vendaFinalizada: VendaFinalizada = {
      id: vendaId,
      cliente_nome: clienteNome || undefined,
      operador_nome: caixa?.operador_nome ?? 'Operador',
      data: now,
      forma_pagamento: formaPagamento,
      pagamentos: pagamentos?.map((p) => ({ forma: p.forma_pagamento, valor: p.valor })),
      total: totalVenda,
      subtotal: sub,
      desconto: get().totalDesconto(),
      troco,
      valor_pago: valorPago,
      itens: itens.map((i) => ({
        nome: i.produto.nome,
        quantidade: i.quantidade,
        unidade: i.produto.unidade,
        preco_unitario: i.preco_unitario,
        desconto: i.desconto,
        subtotal: i.subtotal,
      })),
    };

    // Tenta registrar no Firebase
    try {
      const vendaData = {
        numero_venda: numeroVenda,
        caixa_id: caixa?.id || null,
        cliente_id: null,
        operador_nome: caixa?.operador_nome ?? 'Operador',
        subtotal: sub,
        desconto_valor: descontoValor,
        desconto_percentual: descontoGeral,
        total: totalVenda,
        forma_pagamento: formaPagamento as 'dinheiro' | 'debito' | 'credito' | 'pix' | 'multiplo',
        valor_pago: valorPago,
        troco,
        status: 'finalizada' as const,
        observacoes:
          [clienteNome ? `Cliente: ${clienteNome}` : '', observacao].filter(Boolean).join(' | ') ||
          null,
      };

      const vendaItens = itens.map((i) => ({
        produto_id: i.produto.id,
        produto_nome: i.produto.nome,
        quantidade: i.quantidade,
        preco_unitario: i.preco_unitario,
        desconto: i.desconto,
        subtotal: i.subtotal,
        unidade: i.produto.unidade,
      }));

      const vendaPagamentos =
        pagamentos && pagamentos.length > 0
          ? pagamentos.map((p) => ({
              forma_pagamento: p.forma_pagamento as 'dinheiro' | 'debito' | 'credito' | 'pix',
              valor: p.valor,
            }))
          : [
              {
                forma_pagamento: formaPagamento as 'dinheiro' | 'debito' | 'credito' | 'pix',
                valor: totalVenda,
              },
            ];

      const vendaSalva = await vendasService.criarCompleta(vendaData, vendaItens, vendaPagamentos);
      if (vendaSalva) {
        vendaFinalizada.id = vendaSalva.id ?? vendaId;
      }

      // Atualizar caixa no Firebase
      if (caixa) {
        const atualizacaoCaixa: Partial<Caixa> = {
          total_vendas: (caixa.total_vendas ?? 0) + 1,
        };

        if (pagamentos && pagamentos.length > 0) {
          let dinheiro = caixa.valor_dinheiro ?? 0;
          let debito = caixa.valor_cartao_debito ?? 0;
          let credito = caixa.valor_cartao_credito ?? 0;
          let pix = caixa.valor_pix ?? 0;
          for (const p of pagamentos) {
            if (p.forma_pagamento === 'dinheiro') dinheiro += (p.valor - troco);
            else if (p.forma_pagamento === 'debito') debito += p.valor;
            else if (p.forma_pagamento === 'credito') credito += p.valor;
            else if (p.forma_pagamento === 'pix') pix += p.valor;
          }
          atualizacaoCaixa.valor_dinheiro = dinheiro;
          atualizacaoCaixa.valor_cartao_debito = debito;
          atualizacaoCaixa.valor_cartao_credito = credito;
          atualizacaoCaixa.valor_pix = pix;
        } else {
          if (formaPagamento === 'dinheiro')
            atualizacaoCaixa.valor_dinheiro = (caixa.valor_dinheiro ?? 0) + valorPago - troco;
          else if (formaPagamento === 'debito')
            atualizacaoCaixa.valor_cartao_debito = (caixa.valor_cartao_debito ?? 0) + totalVenda;
          else if (formaPagamento === 'credito')
            atualizacaoCaixa.valor_cartao_credito = (caixa.valor_cartao_credito ?? 0) + totalVenda;
          else if (formaPagamento === 'pix')
            atualizacaoCaixa.valor_pix = (caixa.valor_pix ?? 0) + totalVenda;
        }

        try {
          await caixasService.atualizar(caixa.id, atualizacaoCaixa);
        } catch { /* ok — caixa atualizado apenas localmente */ }

        const caixaAtualizado = { ...caixa, ...atualizacaoCaixa };
        set({ caixa: caixaAtualizado });
        localStorage.setItem('pdv_caixa', JSON.stringify(caixaAtualizado));
      }
    } catch (err) {
      console.warn('[PDV] ⚠️ Venda salva localmente (Firebase indisponível):', err);

      // Backup local: mantém as últimas 100 vendas offline
      try {
        const vendasLocais = JSON.parse(
          localStorage.getItem('pdv_vendas_offline') ?? '[]'
        );
        vendasLocais.push({ ...vendaFinalizada, numero: numeroVenda });
        localStorage.setItem(
          'pdv_vendas_offline',
          JSON.stringify(vendasLocais.slice(-100))
        );
      } catch { /* storage indisponível */ }

      // Atualiza caixa localmente
      if (caixa) {
        const caixaAtualizado = {
          ...caixa,
          total_vendas: (caixa.total_vendas ?? 0) + 1,
          valor_dinheiro:
            formaPagamento === 'dinheiro'
              ? (caixa.valor_dinheiro ?? 0) + valorPago - troco
              : (caixa.valor_dinheiro ?? 0),
          valor_cartao_debito:
            formaPagamento === 'debito'
              ? (caixa.valor_cartao_debito ?? 0) + totalVenda
              : (caixa.valor_cartao_debito ?? 0),
          valor_cartao_credito:
            formaPagamento === 'credito'
              ? (caixa.valor_cartao_credito ?? 0) + totalVenda
              : (caixa.valor_cartao_credito ?? 0),
          valor_pix:
            formaPagamento === 'pix'
              ? (caixa.valor_pix ?? 0) + totalVenda
              : (caixa.valor_pix ?? 0),
        };
        set({ caixa: caixaAtualizado });
        localStorage.setItem('pdv_caixa', JSON.stringify(caixaAtualizado));
      }
    }

    // Limpar carrinho e registrar última venda para impressão
    set({
      itens: [],
      clienteNome: '',
      observacao: '',
      descontoGeral: 0,
      descontoValor: 0,
      modalPagamento: false,
      ultimaVenda: vendaFinalizada,
    });

    return vendaFinalizada;
  },
}));
