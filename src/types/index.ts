// =============================================
// HORTIFRUTI MASTER — Tipos TypeScript
// =============================================

// Categoria de produto
export interface Categoria {
    id: string;
    nome: string;
    descricao?: string;
    cor: string;
    icone?: string;
    ativo: boolean;
    created_at: string;
    updated_at: string;
}

// Fornecedor
export interface Fornecedor {
    id: string;
    razao_social: string;
    nome_fantasia?: string;
    cnpj_cpf?: string;
    inscricao_estadual?: string;
    tipo: 'fisica' | 'juridica' | 'produtor_rural';
    telefone?: string;
    email?: string;
    endereco?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
    contato_nome?: string;
    contato_telefone?: string;
    observacoes?: string;
    ativo: boolean;
    created_at: string;
    updated_at: string;
}

// Produto
export interface Produto {
    id: string;
    nome: string;
    codigo?: string;
    codigo_barras?: string;
    categoria_id?: string;
    fornecedor_id?: string;
    unidade: 'KG' | 'UN' | 'CX' | 'PCT' | 'DZ' | 'L';
    preco_custo: number;
    preco_venda: number;
    margem_lucro?: number;
    estoque_atual: number;
    estoque_minimo: number;
    data_validade?: string;
    lote?: string;
    localizacao?: string;
    peso_medio?: number;
    ncm?: string;
    cest?: string;
    cfop?: string;
    icms_aliquota: number;
    pis_aliquota: number;
    cofins_aliquota: number;
    em_promocao: boolean;
    preco_promocional?: number;
    promocao_inicio?: string;
    promocao_fim?: string;
    ativo: boolean;
    imagem_url?: string;
    created_at: string;
    updated_at: string;
    // Relações (join)
    categoria?: Categoria;
    fornecedor?: Fornecedor;
}

// Cliente
export interface Cliente {
    id: string;
    nome: string;
    cpf_cnpj?: string;
    telefone?: string;
    email?: string;
    endereco?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
    data_nascimento?: string;
    limite_credito: number;
    saldo_credito: number;
    pontos_fidelidade: number;
    observacoes?: string;
    ativo: boolean;
    created_at: string;
    updated_at: string;
}

// Caixa
export interface Caixa {
    id: string;
    numero: number;
    operador_nome: string;
    status: 'aberto' | 'fechado';
    valor_abertura: number;
    valor_fechamento?: number;
    valor_dinheiro: number;
    valor_cartao_debito: number;
    valor_cartao_credito: number;
    valor_pix: number;
    valor_sangria: number;
    valor_suprimento: number;
    total_vendas: number;
    aberto_em: string;
    fechado_em?: string;
    observacoes?: string;
    created_at: string;
}

// Forma de pagamento
export type FormaPagamento = 'dinheiro' | 'debito' | 'credito' | 'pix' | 'crediario' | 'multiplo';

// Venda
export interface Venda {
    id: string;
    numero_venda: number;
    caixa_id?: string;
    cliente_id?: string;
    operador_nome?: string;
    subtotal: number;
    desconto_valor: number;
    desconto_percentual: number;
    total: number;
    forma_pagamento: FormaPagamento;
    valor_pago: number;
    troco: number;
    status: 'em_andamento' | 'finalizada' | 'cancelada' | 'em_espera';
    observacoes?: string;
    created_at: string;
    itens?: VendaItem[];
    pagamentos?: VendaPagamento[];
    cliente?: Cliente;
}

// Item de venda
export interface VendaItem {
    id: string;
    venda_id: string;
    produto_id: string;
    produto_nome: string;
    quantidade: number;
    preco_unitario: number;
    desconto: number;
    subtotal: number;
    unidade?: string;
    created_at: string;
    produto?: Produto;
}

// Pagamento de venda (múltiplo)
export interface VendaPagamento {
    id: string;
    venda_id: string;
    forma_pagamento: Exclude<FormaPagamento, 'multiplo'>;
    valor: number;
    created_at: string;
}

// Movimentação de estoque
export interface MovimentacaoEstoque {
    id: string;
    produto_id: string;
    tipo: 'entrada' | 'saida' | 'ajuste' | 'perda' | 'venda';
    quantidade: number;
    estoque_anterior?: number;
    estoque_posterior?: number;
    motivo?: string;
    documento?: string;
    usuario_nome?: string;
    created_at: string;
    produto?: Produto;
}

// Contas a pagar
export interface ContaPagar {
    id: string;
    fornecedor_id?: string;
    descricao: string;
    valor: number;
    valor_pago: number;
    data_vencimento: string;
    data_pagamento?: string;
    status: 'pendente' | 'pago' | 'atrasado' | 'cancelado';
    categoria?: string;
    documento?: string;
    observacoes?: string;
    created_at: string;
    updated_at: string;
    fornecedor?: Fornecedor;
}

// Contas a receber
export interface ContaReceber {
    id: string;
    cliente_id?: string;
    venda_id?: string;
    descricao: string;
    valor: number;
    valor_recebido: number;
    data_vencimento: string;
    data_recebimento?: string;
    parcela_atual: number;
    total_parcelas: number;
    status: 'pendente' | 'recebido' | 'atrasado' | 'cancelado';
    observacoes?: string;
    created_at: string;
    updated_at: string;
    cliente?: Cliente;
}

// Movimentação de caixa (sangria/suprimento)
export interface MovimentacaoCaixa {
    id: string;
    caixa_id: string;
    tipo: 'sangria' | 'suprimento';
    valor: number;
    motivo?: string;
    operador_nome?: string;
    created_at: string;
}

// Pedido de compra
export interface PedidoCompra {
    id: string;
    fornecedor_id: string;
    numero_pedido: number;
    status: 'pendente' | 'aprovado' | 'recebido' | 'cancelado';
    valor_total: number;
    data_previsao?: string;
    data_recebimento?: string;
    observacoes?: string;
    created_at: string;
    updated_at: string;
    fornecedor?: Fornecedor;
    itens?: PedidoCompraItem[];
}

// Item de pedido de compra
export interface PedidoCompraItem {
    id: string;
    pedido_id: string;
    produto_id: string;
    quantidade: number;
    preco_unitario: number;
    subtotal: number;
    created_at: string;
    produto?: Produto;
}

// Promoção
export interface Promocao {
    id: string;
    nome: string;
    descricao?: string;
    tipo: 'percentual' | 'valor_fixo' | 'quantidade';
    valor_desconto?: number;
    quantidade_minima: number;
    data_inicio: string;
    data_fim: string;
    ativo: boolean;
    created_at: string;
    updated_at: string;
    produtos?: Produto[];
}

// Tabela de preço
export interface TabelaPreco {
    id: string;
    nome: string;
    tipo: 'varejo' | 'atacado' | 'fidelidade' | 'personalizada';
    descricao?: string;
    margem_padrao?: number;
    ativo: boolean;
    created_at: string;
    updated_at: string;
    itens?: TabelaPrecoItem[];
}

// Item de tabela de preço
export interface TabelaPrecoItem {
    id: string;
    tabela_id: string;
    produto_id: string;
    preco: number;
    quantidade_minima?: number;
    created_at: string;
    produto?: Produto;
}

// Métricas do Dashboard
export interface MetricasDashboard {
    vendasHoje: number;
    ticketMedio: number;
    produtosVendidos: number;
    alertasAtivos: number;
    vendasSemana: { dia: string; valor: number }[];
    vendasPorCategoria: { nome: string; valor: number; cor: string }[];
    topProdutos: { nome: string; quantidade: number; valor: number }[];
    ultimasVendas: Venda[];
    alertasEstoque: { produto: string; tipo: 'vencimento' | 'ruptura'; detalhe: string }[];
}

// Toast notification
export interface Toast {
    id: string;
    tipo: 'sucesso' | 'erro' | 'aviso' | 'info';
    titulo: string;
    mensagem?: string;
}
