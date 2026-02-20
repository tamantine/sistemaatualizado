-- =============================================
-- Schema do Banco de Dados - Sistema Hortifruti PDV
-- Execute este script no SQL Editor do Supabase
-- =============================================

-- Tabela de Categorias de Produtos
CREATE TABLE IF NOT EXISTS categorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    descricao TEXT,
    cor TEXT DEFAULT '#22c55e',
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Fornecedores
CREATE TABLE IF NOT EXISTS fornecedores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    cnpj TEXT,
    telefone TEXT,
    email TEXT,
    endereco TEXT,
    contato TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Produtos
CREATE TABLE IF NOT EXISTS produtos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    codigo TEXT UNIQUE,
    codigo_barras TEXT,
    categoria_id UUID REFERENCES categorias(id),
    fornecedor_id UUID REFERENCES fornecedores(id),
    unidade TEXT DEFAULT 'KG',
    preco_custo DECIMAL(10,2) DEFAULT 0,
    preco_venda DECIMAL(10,2) DEFAULT 0,
    estoque_atual DECIMAL(10,3) DEFAULT 0,
    estoque_minimo DECIMAL(10,3) DEFAULT 0,
    data_validade DATE,
    lote TEXT,
    localizacao TEXT,
    imagem_url TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Clientes
CREATE TABLE IF NOT EXISTS clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    cpf TEXT,
    telefone TEXT,
    email TEXT,
    endereco TEXT,
    cidade TEXT,
    estado TEXT,
    cep TEXT,
    data_nascimento DATE,
    observacoes TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Vendas
CREATE TABLE IF NOT EXISTS vendas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_venda TEXT NOT NULL,
    cliente_id UUID REFERENCES clientes(id),
    operador_id UUID,
    operador_nome TEXT,
    caixa_id TEXT,
    numero_caixa INTEGER DEFAULT 1,
    subtotal DECIMAL(10,2) DEFAULT 0,
    desconto DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) DEFAULT 0,
    forma_pagamento TEXT,
    valor_pago DECIMAL(10,2) DEFAULT 0,
    troco DECIMAL(10,2) DEFAULT 0,
    status TEXT DEFAULT 'concluida',
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Itens de Venda
CREATE TABLE IF NOT EXISTS venda_itens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venda_id UUID REFERENCES vendas(id) ON DELETE CASCADE,
    produto_id UUID REFERENCES produtos(id),
    produto_nome TEXT,
    quantidade DECIMAL(10,3) DEFAULT 0,
    unidade TEXT,
    preco_unitario DECIMAL(10,2) DEFAULT 0,
    desconto DECIMAL(10,2) DEFAULT 0,
    subtotal DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Contas a Pagar
CREATE TABLE IF NOT EXISTS contas_pagar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    descricao TEXT NOT NULL,
    valor DECIMAL(10,2) DEFAULT 0,
    valor_pago DECIMAL(10,2) DEFAULT 0,
    data_vencimento DATE NOT NULL,
    data_pagamento DATE,
    status TEXT DEFAULT 'pendente',
    categoria TEXT,
    documento TEXT,
    fornecedor_id UUID REFERENCES fornecedores(id),
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Contas a Receber
CREATE TABLE IF NOT EXISTS contas_receber (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    descricao TEXT NOT NULL,
    valor DECIMAL(10,2) DEFAULT 0,
    valor_recebido DECIMAL(10,2) DEFAULT 0,
    data_vencimento DATE NOT NULL,
    data_recebimento DATE,
    status TEXT DEFAULT 'pendente',
    cliente_id UUID REFERENCES clientes(id),
    venda_id UUID REFERENCES vendas(id),
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Caixas
CREATE TABLE IF NOT EXISTS caixas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero INTEGER NOT NULL,
    operador_id UUID,
    operador_nome TEXT,
    saldo_inicial DECIMAL(10,2) DEFAULT 0,
    saldo_final DECIMAL(10,2) DEFAULT 0,
    status TEXT DEFAULT 'fechado',
    data_abertura TIMESTAMPTZ,
    data_fechamento TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Movimentações de Caixa
CREATE TABLE IF NOT EXISTS caixa_movimentacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    caixa_id UUID REFERENCES caixas(id),
    tipo TEXT NOT NULL,
    valor DECIMAL(10,2) DEFAULT 0,
    descricao TEXT,
    operador_id UUID,
    operador_nome TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Pedidos de Compra
CREATE TABLE IF NOT EXISTS pedidos_compra (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_pedido TEXT NOT NULL,
    fornecedor_id UUID REFERENCES fornecedores(id),
    fornecedor_nome TEXT,
    data_pedido DATE,
    data_entrega DATE,
    status TEXT DEFAULT 'pendente',
    valor_total DECIMAL(10,2) DEFAULT 0,
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Itens de Pedido de Compra
CREATE TABLE IF NOT EXISTS pedido_compra_itens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id UUID REFERENCES pedidos_compra(id) ON DELETE CASCADE,
    produto_id UUID REFERENCES produtos(id),
    produto_nome TEXT,
    quantidade DECIMAL(10,3) DEFAULT 0,
    unidade TEXT,
    preco_unitario DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Promoções
CREATE TABLE IF NOT EXISTS promocoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    descricao TEXT,
    tipo TEXT DEFAULT 'desconto',
    valor DECIMAL(10,2) DEFAULT 0,
    data_inicio DATE,
    data_fim DATE,
    ativa BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Produtos em Promoção
CREATE TABLE IF NOT EXISTS promocao_produtos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    promocao_id UUID REFERENCES promocoes(id) ON DELETE CASCADE,
    produto_id UUID REFERENCES produtos(id),
    preco_promocional DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Configurações de Row Level Security (RLS)
-- =============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE venda_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas_pagar ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas_receber ENABLE ROW LEVEL SECURITY;
ALTER TABLE caixas ENABLE ROW LEVEL SECURITY;
ALTER TABLE caixa_movimentacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos_compra ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedido_compra_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE promocoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE promocao_produtos ENABLE ROW LEVEL SECURITY;

-- Política para permitir tudo (em desenvolvimento)
-- Em produção, você deve criar políticas mais restritivas
CREATE POLICY "Allow all" ON categorias FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON fornecedores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON produtos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON clientes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON vendas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON venda_itens FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON contas_pagar FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON contas_receber FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON caixas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON caixa_movimentacoes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON pedidos_compra FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON pedido_compra_itens FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON promocoes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON promocao_produtos FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- Índices para melhorar performance
-- =============================================

CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON produtos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_produtos_codigo ON produtos(codigo);
CREATE INDEX IF NOT EXISTS idx_produtos_codigo_barras ON produtos(codigo_barras);
CREATE INDEX IF NOT EXISTS idx_vendas_data ON vendas(created_at);
CREATE INDEX IF NOT EXISTS idx_vendas_cliente ON vendas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_vencimento ON contas_pagar(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_contas_receber_vencimento ON contas_receber(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_status ON contas_pagar(status);
CREATE INDEX IF NOT EXISTS idx_contas_receber_status ON contas_receber(status);
