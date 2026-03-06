-- =============================================
-- Índices para as tabelas existentes
-- =============================================

-- Verificar se as tabelas existem e adicionar índices apropriados

-- Tabela venda_pagamentos - índices
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'venda_pagamentos') THEN
        CREATE INDEX IF NOT EXISTS idx_venda_pagamentos_venda ON venda_pagamentos(venda_id);
    END IF;
END $$;

-- Tabela movimentacoes_estoque - índices
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'movimentacoes_estoque') THEN
        -- Verificar se coluna produto_id existe
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'movimentacoes_estoque' AND column_name = 'produto_id') THEN
            CREATE INDEX IF NOT EXISTS idx_movimentacoes_estoque_produto ON movimentacoes_estoque(produto_id);
        END IF;
        -- Verificar se coluna tipo existe
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'movimentacoes_estoque' AND column_name = 'tipo') THEN
            CREATE INDEX IF NOT EXISTS idx_movimentacoes_estoque_tipo ON movimentacoes_estoque(tipo);
        END IF;
    END IF;
END $$;

-- Tabela registros_qualidade - índices
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'registros_qualidade') THEN
        -- Verificar se coluna produto_id existe
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registros_qualidade' AND column_name = 'produto_id') THEN
            CREATE INDEX IF NOT EXISTS idx_registros_qualidade_produto ON registros_qualidade(produto_id);
        END IF;
    END IF;
END $$;

-- Tabela perdas - índices
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'perdas') THEN
        -- Verificar se coluna produto_id existe
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'perdas' AND column_name = 'produto_id') THEN
            CREATE INDEX IF NOT EXISTS idx_perdas_produto ON perdas(produto_id);
        END IF;
        -- Verificar se coluna data_registro existe
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'perdas' AND column_name = 'data_registro') THEN
            CREATE INDEX IF NOT EXISTS idx_perdas_data ON perdas(data_registro);
        END IF;
    END IF;
END $$;

-- Tabela rastreios - índices
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rastreios') THEN
        -- Verificar se coluna produto_id existe
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rastreios' AND column_name = 'produto_id') THEN
            CREATE INDEX IF NOT EXISTS idx_rastreios_produto ON rastreios(produto_id);
        END IF;
        -- Verificar se coluna fornecedor_id existe
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rastreios' AND column_name = 'fornecedor_id') THEN
            CREATE INDEX IF NOT EXISTS idx_rastreios_fornecedor ON rastreios(fornecedor_id);
        END IF;
    END IF;
END $$;

-- Tabela sazonalidade - índices
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sazonalidade') THEN
        -- Verificar se coluna produto_id existe
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sazonalidade' AND column_name = 'produto_id') THEN
            CREATE INDEX IF NOT EXISTS idx_sazonalidade_produto ON sazonalidade(produto_id);
        END IF;
        -- Verificar se coluna mes_num existe
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sazonalidade' AND column_name = 'mes_num') THEN
            CREATE INDEX IF NOT EXISTS idx_sazonalidade_mes ON sazonalidade(mes_num);
        END IF;
    END IF;
END $$;
