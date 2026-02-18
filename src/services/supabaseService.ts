// =============================================
// Serviço Supabase — Camada de acesso ao banco
// Centraliza todas as queries CRUD para cada tabela
// =============================================
import { supabase } from '../lib/supabase';
import type {
    Categoria, Produto, Fornecedor, Cliente, Caixa,
    Venda, VendaItem, VendaPagamento, MovimentacaoEstoque,
    ContaPagar, ContaReceber, MovimentacaoCaixa,
    PedidoCompra, PedidoCompraItem, Promocao,
} from '../types';

// =============================================
// Helpers
// =============================================
function tratarErro(error: unknown, contexto: string): never {
    console.error(`[Supabase] Erro em ${contexto}:`, error);
    throw new Error(`Falha ao ${contexto}`);
}

// =============================================
// CATEGORIAS
// =============================================
export const categoriasService = {
    async listar(): Promise<Categoria[]> {
        const { data, error } = await supabase
            .from('categorias')
            .select('*')
            .order('nome');
        if (error) tratarErro(error, 'listar categorias');
        return data as Categoria[];
    },

    async criar(cat: Omit<Categoria, 'id' | 'created_at' | 'updated_at'>): Promise<Categoria> {
        const { data, error } = await supabase
            .from('categorias')
            .insert(cat)
            .select()
            .single();
        if (error) tratarErro(error, 'criar categoria');
        return data as Categoria;
    },

    async atualizar(id: string, cat: Partial<Categoria>): Promise<Categoria> {
        const { data, error } = await supabase
            .from('categorias')
            .update({ ...cat, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();
        if (error) tratarErro(error, 'atualizar categoria');
        return data as Categoria;
    },

    async remover(id: string): Promise<void> {
        const { error } = await supabase.from('categorias').delete().eq('id', id);
        if (error) tratarErro(error, 'remover categoria');
    },
};

// =============================================
// PRODUTOS
// =============================================
export const produtosService = {
    async listar(): Promise<Produto[]> {
        const { data, error } = await supabase
            .from('produtos')
            .select('*, categoria:categorias(*), fornecedor:fornecedores(*)')
            .order('nome');
        if (error) tratarErro(error, 'listar produtos');
        return data as Produto[];
    },

    async buscarPorId(id: string): Promise<Produto> {
        const { data, error } = await supabase
            .from('produtos')
            .select('*, categoria:categorias(*), fornecedor:fornecedores(*)')
            .eq('id', id)
            .single();
        if (error) tratarErro(error, 'buscar produto');
        return data as Produto;
    },

    async criar(prod: Omit<Produto, 'id' | 'created_at' | 'updated_at' | 'categoria' | 'fornecedor'>): Promise<Produto> {
        const { data, error } = await supabase
            .from('produtos')
            .insert(prod)
            .select('*, categoria:categorias(*), fornecedor:fornecedores(*)')
            .single();
        if (error) tratarErro(error, 'criar produto');
        return data as Produto;
    },

    async atualizar(id: string, prod: Partial<Produto>): Promise<Produto> {
        // Remove campos de relação antes de enviar
        const { categoria, fornecedor, ...dados } = prod;
        const { data, error } = await supabase
            .from('produtos')
            .update({ ...dados, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select('*, categoria:categorias(*), fornecedor:fornecedores(*)')
            .single();
        if (error) tratarErro(error, 'atualizar produto');
        return data as Produto;
    },

    async remover(id: string): Promise<void> {
        const { error } = await supabase.from('produtos').delete().eq('id', id);
        if (error) tratarErro(error, 'remover produto');
    },

    async atualizarEstoque(id: string, novoEstoque: number): Promise<void> {
        const { error } = await supabase
            .from('produtos')
            .update({ estoque_atual: novoEstoque, updated_at: new Date().toISOString() })
            .eq('id', id);
        if (error) tratarErro(error, 'atualizar estoque');
    },
};

// =============================================
// FORNECEDORES
// =============================================
export const fornecedoresService = {
    async listar(): Promise<Fornecedor[]> {
        const { data, error } = await supabase
            .from('fornecedores')
            .select('*')
            .order('razao_social');
        if (error) tratarErro(error, 'listar fornecedores');
        return data as Fornecedor[];
    },

    async criar(forn: Omit<Fornecedor, 'id' | 'created_at' | 'updated_at'>): Promise<Fornecedor> {
        const { data, error } = await supabase
            .from('fornecedores')
            .insert(forn)
            .select()
            .single();
        if (error) tratarErro(error, 'criar fornecedor');
        return data as Fornecedor;
    },

    async atualizar(id: string, forn: Partial<Fornecedor>): Promise<Fornecedor> {
        const { data, error } = await supabase
            .from('fornecedores')
            .update({ ...forn, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();
        if (error) tratarErro(error, 'atualizar fornecedor');
        return data as Fornecedor;
    },

    async remover(id: string): Promise<void> {
        const { error } = await supabase.from('fornecedores').delete().eq('id', id);
        if (error) tratarErro(error, 'remover fornecedor');
    },
};

// =============================================
// CLIENTES
// =============================================
export const clientesService = {
    async listar(): Promise<Cliente[]> {
        const { data, error } = await supabase
            .from('clientes')
            .select('*')
            .order('nome');
        if (error) tratarErro(error, 'listar clientes');
        return data as Cliente[];
    },

    async criar(cli: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>): Promise<Cliente> {
        const { data, error } = await supabase
            .from('clientes')
            .insert(cli)
            .select()
            .single();
        if (error) tratarErro(error, 'criar cliente');
        return data as Cliente;
    },

    async atualizar(id: string, cli: Partial<Cliente>): Promise<Cliente> {
        const { data, error } = await supabase
            .from('clientes')
            .update({ ...cli, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();
        if (error) tratarErro(error, 'atualizar cliente');
        return data as Cliente;
    },

    async remover(id: string): Promise<void> {
        const { error } = await supabase.from('clientes').delete().eq('id', id);
        if (error) tratarErro(error, 'remover cliente');
    },

    async atualizarPontos(id: string, pontos: number): Promise<void> {
        const { error } = await supabase
            .from('clientes')
            .update({ pontos_fidelidade: pontos, updated_at: new Date().toISOString() })
            .eq('id', id);
        if (error) tratarErro(error, 'atualizar pontos');
    },
};

// =============================================
// CAIXAS
// =============================================
export const caixasService = {
    async buscarAberto(): Promise<Caixa | null> {
        const { data, error } = await supabase
            .from('caixas')
            .select('*')
            .eq('status', 'aberto')
            .order('aberto_em', { ascending: false })
            .limit(1)
            .maybeSingle();
        if (error) tratarErro(error, 'buscar caixa aberto');
        return data as Caixa | null;
    },

    async abrir(caixa: Omit<Caixa, 'id' | 'created_at'>): Promise<Caixa> {
        const { data, error } = await supabase
            .from('caixas')
            .insert(caixa)
            .select()
            .single();
        if (error) tratarErro(error, 'abrir caixa');
        return data as Caixa;
    },

    async atualizar(id: string, dados: Partial<Caixa>): Promise<Caixa> {
        const { data, error } = await supabase
            .from('caixas')
            .update(dados)
            .eq('id', id)
            .select()
            .single();
        if (error) tratarErro(error, 'atualizar caixa');
        return data as Caixa;
    },

    async fechar(id: string, dados: Partial<Caixa>): Promise<Caixa> {
        const { data, error } = await supabase
            .from('caixas')
            .update({ ...dados, status: 'fechado', fechado_em: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();
        if (error) tratarErro(error, 'fechar caixa');
        return data as Caixa;
    },
};

// =============================================
// VENDAS
// =============================================
export const vendasService = {
    async listar(limite = 50): Promise<Venda[]> {
        const { data, error } = await supabase
            .from('vendas')
            .select('*, itens:venda_itens(*), pagamentos:venda_pagamentos(*), cliente:clientes(*)')
            .order('created_at', { ascending: false })
            .limit(limite);
        if (error) tratarErro(error, 'listar vendas');
        return data as Venda[];
    },

    async criar(venda: Omit<Venda, 'id' | 'created_at' | 'numero_venda' | 'itens' | 'pagamentos' | 'cliente'>): Promise<Venda> {
        const { data, error } = await supabase
            .from('vendas')
            .insert(venda)
            .select()
            .single();
        if (error) tratarErro(error, 'criar venda');
        return data as Venda;
    },

    async criarCompleta(
        venda: Omit<Venda, 'id' | 'created_at' | 'numero_venda' | 'itens' | 'pagamentos' | 'cliente'>,
        itens: Omit<VendaItem, 'id' | 'created_at' | 'venda_id' | 'produto'>[],
        pagamentos: Omit<VendaPagamento, 'id' | 'created_at' | 'venda_id'>[]
    ): Promise<Venda> {
        // 1. Criar a venda
        const { data: vendaCriada, error: erroVenda } = await supabase
            .from('vendas')
            .insert(venda)
            .select()
            .single();
        if (erroVenda) tratarErro(erroVenda, 'criar venda');
        const vendaId = (vendaCriada as Venda).id;

        // 2. Criar itens
        if (itens.length > 0) {
            const itensComVendaId = itens.map(item => ({ ...item, venda_id: vendaId }));
            const { error: erroItens } = await supabase
                .from('venda_itens')
                .insert(itensComVendaId);
            if (erroItens) tratarErro(erroItens, 'criar itens da venda');
        }

        // 3. Criar pagamentos
        if (pagamentos.length > 0) {
            const pagamentosComVendaId = pagamentos.map(p => ({ ...p, venda_id: vendaId }));
            const { error: erroPagtos } = await supabase
                .from('venda_pagamentos')
                .insert(pagamentosComVendaId);
            if (erroPagtos) tratarErro(erroPagtos, 'criar pagamentos da venda');
        }

        // 4. Atualizar estoque dos produtos
        for (const item of itens) {
            const { data: prod } = await supabase
                .from('produtos')
                .select('estoque_atual')
                .eq('id', item.produto_id)
                .single();
            if (prod) {
                await supabase
                    .from('produtos')
                    .update({ estoque_atual: Math.max(0, (prod.estoque_atual || 0) - item.quantidade) })
                    .eq('id', item.produto_id);
            }
        }

        return vendaCriada as Venda;
    },

    async vendasHoje(): Promise<Venda[]> {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const { data, error } = await supabase
            .from('vendas')
            .select('*, itens:venda_itens(*)')
            .gte('created_at', hoje.toISOString())
            .eq('status', 'finalizada')
            .order('created_at', { ascending: false });
        if (error) tratarErro(error, 'listar vendas de hoje');
        return data as Venda[];
    },
};

// =============================================
// MOVIMENTAÇÕES DE ESTOQUE
// =============================================
export const movimentacoesEstoqueService = {
    async listar(limite = 100): Promise<MovimentacaoEstoque[]> {
        const { data, error } = await supabase
            .from('movimentacoes_estoque')
            .select('*, produto:produtos(nome, unidade)')
            .order('created_at', { ascending: false })
            .limit(limite);
        if (error) tratarErro(error, 'listar movimentações de estoque');
        return data as MovimentacaoEstoque[];
    },

    async criar(mov: Omit<MovimentacaoEstoque, 'id' | 'created_at' | 'produto'>): Promise<MovimentacaoEstoque> {
        const { data, error } = await supabase
            .from('movimentacoes_estoque')
            .insert(mov)
            .select()
            .single();
        if (error) tratarErro(error, 'criar movimentação de estoque');
        return data as MovimentacaoEstoque;
    },
};

// =============================================
// MOVIMENTAÇÕES DE CAIXA (sangria/suprimento)
// =============================================
export const movimentacoesCaixaService = {
    async listarPorCaixa(caixaId: string): Promise<MovimentacaoCaixa[]> {
        const { data, error } = await supabase
            .from('movimentacoes_caixa')
            .select('*')
            .eq('caixa_id', caixaId)
            .order('created_at', { ascending: false });
        if (error) tratarErro(error, 'listar movimentações de caixa');
        return data as MovimentacaoCaixa[];
    },

    async criar(mov: Omit<MovimentacaoCaixa, 'id' | 'created_at'>): Promise<MovimentacaoCaixa> {
        const { data, error } = await supabase
            .from('movimentacoes_caixa')
            .insert(mov)
            .select()
            .single();
        if (error) tratarErro(error, 'criar movimentação de caixa');
        return data as MovimentacaoCaixa;
    },
};

// =============================================
// CONTAS A PAGAR
// =============================================
export const contasPagarService = {
    async listar(): Promise<ContaPagar[]> {
        const { data, error } = await supabase
            .from('contas_pagar')
            .select('*, fornecedor:fornecedores(*)')
            .order('data_vencimento');
        if (error) tratarErro(error, 'listar contas a pagar');
        return data as ContaPagar[];
    },

    async criar(conta: Omit<ContaPagar, 'id' | 'created_at' | 'updated_at' | 'fornecedor'>): Promise<ContaPagar> {
        const { data, error } = await supabase
            .from('contas_pagar')
            .insert(conta)
            .select('*, fornecedor:fornecedores(*)')
            .single();
        if (error) tratarErro(error, 'criar conta a pagar');
        return data as ContaPagar;
    },

    async atualizar(id: string, dados: Partial<ContaPagar>): Promise<ContaPagar> {
        const { fornecedor, ...rest } = dados;
        const { data, error } = await supabase
            .from('contas_pagar')
            .update({ ...rest, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select('*, fornecedor:fornecedores(*)')
            .single();
        if (error) tratarErro(error, 'atualizar conta a pagar');
        return data as ContaPagar;
    },

    async remover(id: string): Promise<void> {
        const { error } = await supabase.from('contas_pagar').delete().eq('id', id);
        if (error) tratarErro(error, 'remover conta a pagar');
    },

    async confirmarPagamento(id: string): Promise<ContaPagar> {
        const hoje = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
            .from('contas_pagar')
            .update({ status: 'pago', data_pagamento: hoje, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select('*, fornecedor:fornecedores(*)')
            .single();
        if (error) tratarErro(error, 'confirmar pagamento');
        return data as ContaPagar;
    },
};

// =============================================
// CONTAS A RECEBER
// =============================================
export const contasReceberService = {
    async listar(): Promise<ContaReceber[]> {
        const { data, error } = await supabase
            .from('contas_receber')
            .select('*, cliente:clientes(*)')
            .order('data_vencimento');
        if (error) tratarErro(error, 'listar contas a receber');
        return data as ContaReceber[];
    },

    async criar(conta: Omit<ContaReceber, 'id' | 'created_at' | 'updated_at' | 'cliente'>): Promise<ContaReceber> {
        const { data, error } = await supabase
            .from('contas_receber')
            .insert(conta)
            .select('*, cliente:clientes(*)')
            .single();
        if (error) tratarErro(error, 'criar conta a receber');
        return data as ContaReceber;
    },

    async atualizar(id: string, dados: Partial<ContaReceber>): Promise<ContaReceber> {
        const { ...rest } = dados;
        const { data, error } = await supabase
            .from('contas_receber')
            .update({ ...rest, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select('*, cliente:clientes(*)')
            .single();
        if (error) tratarErro(error, 'atualizar conta a receber');
        return data as ContaReceber;
    },

    async remover(id: string): Promise<void> {
        const { error } = await supabase.from('contas_receber').delete().eq('id', id);
        if (error) tratarErro(error, 'remover conta a receber');
    },

    async confirmarRecebimento(id: string, valorRecebido: number): Promise<ContaReceber> {
        const hoje = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
            .from('contas_receber')
            .update({ status: 'recebido', data_recebimento: hoje, valor_recebido: valorRecebido, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select('*, cliente:clientes(*)')
            .single();
        if (error) tratarErro(error, 'confirmar recebimento');
        return data as ContaReceber;
    },
};

// =============================================
// PEDIDOS DE COMPRA
// =============================================
export const pedidosCompraService = {
    async listar(): Promise<PedidoCompra[]> {
        const { data, error } = await supabase
            .from('pedidos_compra')
            .select('*, fornecedor:fornecedores(*), itens:pedido_compra_itens(*, produto:produtos(nome, unidade, preco_custo))')
            .order('created_at', { ascending: false });
        if (error) tratarErro(error, 'listar pedidos de compra');
        return data as PedidoCompra[];
    },

    async criar(
        pedido: Omit<PedidoCompra, 'id' | 'created_at' | 'updated_at' | 'numero_pedido' | 'fornecedor' | 'itens'>,
        itens: Omit<PedidoCompraItem, 'id' | 'created_at' | 'pedido_id' | 'produto'>[]
    ): Promise<PedidoCompra> {
        const { data: pedidoCriado, error: erroPedido } = await supabase
            .from('pedidos_compra')
            .insert(pedido)
            .select()
            .single();
        if (erroPedido) tratarErro(erroPedido, 'criar pedido de compra');
        const pedidoId = (pedidoCriado as PedidoCompra).id;

        if (itens.length > 0) {
            const itensComPedidoId = itens.map(item => ({ ...item, pedido_id: pedidoId }));
            const { error: erroItens } = await supabase
                .from('pedido_compra_itens')
                .insert(itensComPedidoId);
            if (erroItens) tratarErro(erroItens, 'criar itens do pedido');
        }

        return pedidoCriado as PedidoCompra;
    },

    async atualizar(id: string, dados: Partial<PedidoCompra>): Promise<PedidoCompra> {
        const { ...rest } = dados;
        const { data, error } = await supabase
            .from('pedidos_compra')
            .update({ ...rest, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select('*, fornecedor:fornecedores(*), itens:pedido_compra_itens(*, produto:produtos(nome, unidade))')
            .single();
        if (error) tratarErro(error, 'atualizar pedido de compra');
        return data as PedidoCompra;
    },

    async remover(id: string): Promise<void> {
        await supabase.from('pedido_compra_itens').delete().eq('pedido_id', id);
        const { error } = await supabase.from('pedidos_compra').delete().eq('id', id);
        if (error) tratarErro(error, 'remover pedido de compra');
    },
};

// =============================================
// PROMOÇÕES
// =============================================
export const promocoesService = {
    async listar(): Promise<Promocao[]> {
        const { data, error } = await supabase
            .from('promocoes')
            .select('*')
            .order('data_inicio', { ascending: false });
        if (error) tratarErro(error, 'listar promoções');
        return data as Promocao[];
    },

    async criar(promo: Omit<Promocao, 'id' | 'created_at' | 'updated_at' | 'produtos'>): Promise<Promocao> {
        const { data, error } = await supabase
            .from('promocoes')
            .insert(promo)
            .select()
            .single();
        if (error) tratarErro(error, 'criar promoção');
        return data as Promocao;
    },

    async atualizar(id: string, dados: Partial<Promocao>): Promise<Promocao> {
        const { ...rest } = dados;
        const { data, error } = await supabase
            .from('promocoes')
            .update({ ...rest, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();
        if (error) tratarErro(error, 'atualizar promoção');
        return data as Promocao;
    },

    async remover(id: string): Promise<void> {
        await supabase.from('promocao_produtos').delete().eq('promocao_id', id);
        const { error } = await supabase.from('promocoes').delete().eq('id', id);
        if (error) tratarErro(error, 'remover promoção');
    },
};

// =============================================
// DASHBOARD — Métricas agregadas
// =============================================
export const dashboardService = {
    async obterMetricas() {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        // Vendas de hoje
        const { data: vendasHoje } = await supabase
            .from('vendas')
            .select('total, forma_pagamento, created_at')
            .gte('created_at', hoje.toISOString())
            .eq('status', 'finalizada');

        const totalVendasHoje = (vendasHoje || []).reduce((a, v) => a + Number(v.total), 0);
        const qtdVendasHoje = (vendasHoje || []).length;
        const ticketMedio = qtdVendasHoje > 0 ? totalVendasHoje / qtdVendasHoje : 0;

        // Produtos com estoque baixo
        const { data: alertas } = await supabase
            .from('produtos')
            .select('nome, estoque_atual, estoque_minimo, data_validade')
            .eq('ativo', true)
            .or('estoque_atual.lte.estoque_minimo');

        // Últimas vendas
        const { data: ultimasVendas } = await supabase
            .from('vendas')
            .select('*')
            .eq('status', 'finalizada')
            .order('created_at', { ascending: false })
            .limit(5);

        return {
            vendasHoje: totalVendasHoje,
            ticketMedio,
            produtosVendidos: qtdVendasHoje,
            alertasAtivos: (alertas || []).length,
            ultimasVendas: ultimasVendas || [],
            alertasEstoque: (alertas || []).map((p) => ({
                produto: p.nome,
                tipo: (Number(p.estoque_atual) <= Number(p.estoque_minimo) ? 'ruptura' : 'vencimento') as 'ruptura' | 'vencimento',
                detalhe: `Estoque: ${p.estoque_atual} (mínimo: ${p.estoque_minimo})`,
            })),
        };
    },
};
