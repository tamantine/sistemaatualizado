// =============================================
// Store do PDV (Zustand) — Integrado com Supabase
// Controle de caixa, carrinho, vendas em espera
// =============================================
import { create } from 'zustand';
import type { Produto, Caixa } from '../types';
import { produtosMock } from '../services/mockData';
import { produtosService, caixasService, vendasService } from '../services/supabaseService';

// Item no carrinho do PDV
export interface CarrinhoItem {
    id: string;
    produto: Produto;
    quantidade: number;
    preco_unitario: number;
    desconto: number;
    subtotal: number;
}

// Venda em espera
export interface VendaEspera {
    id: string;
    itens: CarrinhoItem[];
    cliente_nome?: string;
    observacao?: string;
    criado_em: string;
}

interface PDVState {
    // Caixa
    caixa: Caixa | null;
    caixaAberto: boolean;

    // Catálogo de produtos
    produtos: Produto[];
    buscaProduto: string;

    // Carrinho
    itens: CarrinhoItem[];
    clienteNome: string;
    observacao: string;

    // Descontos
    descontoGeral: number; // percentual
    descontoValor: number; // valor fixo

    // Vendas em espera
    vendasEspera: VendaEspera[];

    // Modais
    modalPagamento: boolean;
    modalCaixa: boolean;
    modalSangria: boolean;
    modalEspera: boolean;

    // Ações do caixa
    abrirCaixa: (valorAbertura: number, operador: string) => void;
    fecharCaixa: () => void;

    // Ações do carrinho
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

    // Vendas em espera
    salvarEmEspera: () => void;
    recuperarEspera: (id: string) => void;
    removerEspera: (id: string) => void;

    // Modais
    setModalPagamento: (aberto: boolean) => void;
    setModalCaixa: (aberto: boolean) => void;
    setModalSangria: (aberto: boolean) => void;
    setModalEspera: (aberto: boolean) => void;

    // Supabase
    usandoMock: boolean;
    carregarProdutos: () => Promise<void>;
    registrarVenda: (formaPagamento: string, valorPago: number, troco: number, pagamentos?: { forma_pagamento: string; valor: number }[]) => Promise<void>;

    // Getters computados
    subtotal: () => number;
    totalDesconto: () => number;
    total: () => number;
    totalItens: () => number;
    produtosFiltrados: () => Produto[];
}

export const usePDVStore = create<PDVState>((set, get) => ({
    // Estado inicial
    caixa: null,
    caixaAberto: false,
    produtos: [],
    buscaProduto: '',
    itens: [],
    clienteNome: '',
    observacao: '',
    descontoGeral: 0,
    descontoValor: 0,
    vendasEspera: [],
    modalPagamento: false,
    modalCaixa: false,
    modalSangria: false,
    modalEspera: false,
    usandoMock: false,

    // Carregar produtos do Supabase
    carregarProdutos: async () => {
        try {
            const produtos = await produtosService.listar();
            set({ produtos, usandoMock: false });
        } catch {
            console.warn('[PDV] Supabase indisponível, usando mock');
            set({ produtos: produtosMock, usandoMock: true });
        }
    },

    // --- Caixa ---
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
            const caixa = await caixasService.abrir(dadosCaixa);
            set({ caixa, caixaAberto: true, modalCaixa: false });
        } catch {
            // Fallback: cria caixa local
            const caixa: Caixa = { id: crypto.randomUUID(), ...dadosCaixa };
            set({ caixa, caixaAberto: true, modalCaixa: false });
        }
    },

    fecharCaixa: async () => {
        const { caixa } = get();
        if (caixa) {
            try {
                await caixasService.fechar(caixa.id, {
                    valor_fechamento: caixa.valor_dinheiro + caixa.valor_cartao_debito + caixa.valor_cartao_credito + caixa.valor_pix,
                });
            } catch { /* continua mesmo sem salvar */ }
        }
        set((s) => ({
            caixa: s.caixa ? { ...s.caixa, status: 'fechado' as const, fechado_em: new Date().toISOString() } : null,
            caixaAberto: false,
        }));
    },

    // --- Carrinho ---
    setBuscaProduto: (buscaProduto) => set({ buscaProduto }),

    adicionarItem: (produto, quantidade = 1) => {
        set((s) => {
            // Verifica se o produto já está no carrinho
            const existente = s.itens.find((i) => i.produto.id === produto.id);
            if (existente) {
                return {
                    itens: s.itens.map((i) =>
                        i.produto.id === produto.id
                            ? {
                                ...i,
                                quantidade: i.quantidade + quantidade,
                                subtotal: (i.quantidade + quantidade) * i.preco_unitario - i.desconto,
                            }
                            : i
                    ),
                };
            }

            const precoReal = produto.em_promocao && produto.preco_promocional
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
                    ? { ...i, quantidade, subtotal: quantidade * i.preco_unitario - i.desconto }
                    : i
            ),
        })),

    atualizarDesconto: (itemId, desconto) =>
        set((s) => ({
            itens: s.itens.map((i) =>
                i.id === itemId
                    ? { ...i, desconto, subtotal: i.quantidade * i.preco_unitario - desconto }
                    : i
            ),
        })),

    limparCarrinho: () =>
        set({ itens: [], clienteNome: '', observacao: '', descontoGeral: 0, descontoValor: 0 }),

    setClienteNome: (clienteNome) => set({ clienteNome }),
    setObservacao: (observacao) => set({ observacao }),
    setDescontoGeral: (descontoGeral) => set({ descontoGeral }),
    setDescontoValor: (descontoValor) => set({ descontoValor }),

    // --- Vendas em espera ---
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
            clienteNome: espera.cliente_nome || '',
            observacao: espera.observacao || '',
            vendasEspera: s.vendasEspera.filter((v) => v.id !== id),
            modalEspera: false,
        }));
    },

    removerEspera: (id) =>
        set((s) => ({ vendasEspera: s.vendasEspera.filter((v) => v.id !== id) })),

    // --- Modais ---
    setModalPagamento: (modalPagamento) => set({ modalPagamento }),
    setModalCaixa: (modalCaixa) => set({ modalCaixa }),
    setModalSangria: (modalSangria) => set({ modalSangria }),
    setModalEspera: (modalEspera) => set({ modalEspera }),

    // --- Getters computados ---
    subtotal: () => get().itens.reduce((acc, i) => acc + i.subtotal, 0),

    totalDesconto: () => {
        const { descontoGeral, descontoValor } = get();
        const sub = get().subtotal();
        const descontoPct = (sub * descontoGeral) / 100;
        return descontoPct + descontoValor;
    },

    total: () => {
        const sub = get().subtotal();
        const desc = get().totalDesconto();
        return Math.max(0, sub - desc);
    },

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

    // --- Registrar venda no Supabase ---
    registrarVenda: async (formaPagamento, valorPago, troco, pagamentos) => {
        const { itens, caixa, clienteNome, observacao, descontoGeral, descontoValor, usandoMock } = get();
        if (itens.length === 0) return;

        const sub = get().subtotal();

        const totalVenda = get().total();

        if (!usandoMock) {
            try {
                const vendaData = {
                    caixa_id: caixa?.id || undefined,
                    cliente_id: undefined,
                    operador_nome: caixa?.operador_nome || 'Operador',
                    subtotal: sub,
                    desconto_valor: descontoValor,
                    desconto_percentual: descontoGeral,
                    total: totalVenda,
                    forma_pagamento: formaPagamento as 'dinheiro' | 'debito' | 'credito' | 'pix' | 'multiplo',
                    valor_pago: valorPago,
                    troco,
                    status: 'finalizada' as const,
                    observacoes: [clienteNome ? `Cliente: ${clienteNome}` : '', observacao].filter(Boolean).join(' | ') || undefined,
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

                const vendaPagamentos = pagamentos && pagamentos.length > 0
                    ? pagamentos.map((p) => ({ forma_pagamento: p.forma_pagamento as 'dinheiro' | 'debito' | 'credito' | 'pix', valor: p.valor }))
                    : [{ forma_pagamento: formaPagamento as 'dinheiro' | 'debito' | 'credito' | 'pix', valor: totalVenda }];

                await vendasService.criarCompleta(vendaData, vendaItens, vendaPagamentos);

                // Atualizar caixa no Supabase
                if (caixa) {
                    const atualizacaoCaixa: Partial<Caixa> = {
                        total_vendas: (caixa.total_vendas || 0) + 1,
                    };
                    if (formaPagamento === 'dinheiro') {
                        atualizacaoCaixa.valor_dinheiro = (caixa.valor_dinheiro || 0) + totalVenda - troco;
                    } else if (formaPagamento === 'debito') {
                        atualizacaoCaixa.valor_cartao_debito = (caixa.valor_cartao_debito || 0) + totalVenda;
                    } else if (formaPagamento === 'credito') {
                        atualizacaoCaixa.valor_cartao_credito = (caixa.valor_cartao_credito || 0) + totalVenda;
                    } else if (formaPagamento === 'pix') {
                        atualizacaoCaixa.valor_pix = (caixa.valor_pix || 0) + totalVenda;
                    }
                    try { await caixasService.atualizar(caixa.id, atualizacaoCaixa); } catch { /* ok */ }
                    set({ caixa: { ...caixa, ...atualizacaoCaixa } });
                }
            } catch (err) {
                console.error('[PDV] Erro ao registrar venda no Supabase:', err);
            }
        }

        // Limpar carrinho
        set({ itens: [], clienteNome: '', observacao: '', descontoGeral: 0, descontoValor: 0, modalPagamento: false });
    },
}));
