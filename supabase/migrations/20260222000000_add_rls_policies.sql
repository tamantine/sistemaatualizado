-- =============================================
-- Recriar políticas RLS para todas as tabelas
-- =============================================

-- Fornecedores - políticas
DROP POLICY IF EXISTS "Allow all" ON fornecedores;
CREATE POLICY "Allow all" ON fornecedores FOR ALL USING (true) WITH CHECK (true);

-- Categorias
DROP POLICY IF EXISTS "Allow all" ON categorias;
CREATE POLICY "Allow all" ON categorias FOR ALL USING (true) WITH CHECK (true);

-- Produtos
DROP POLICY IF EXISTS "Allow all" ON produtos;
CREATE POLICY "Allow all" ON produtos FOR ALL USING (true) WITH CHECK (true);

-- Clientes
DROP POLICY IF EXISTS "Allow all" ON clientes;
CREATE POLICY "Allow all" ON clientes FOR ALL USING (true) WITH CHECK (true);

-- Vendas
DROP POLICY IF EXISTS "Allow all" ON vendas;
CREATE POLICY "Allow all" ON vendas FOR ALL USING (true) WITH CHECK (true);

-- Venda Itens
DROP POLICY IF EXISTS "Allow all" ON venda_itens;
CREATE POLICY "Allow all" ON venda_itens FOR ALL USING (true) WITH CHECK (true);

-- Venda Pagamentos
DROP POLICY IF EXISTS "Allow all" ON venda_pagamentos;
CREATE POLICY "Allow all" ON venda_pagamentos FOR ALL USING (true) WITH CHECK (true);

-- Caixas
DROP POLICY IF EXISTS "Allow all" ON caixas;
CREATE POLICY "Allow all" ON caixas FOR ALL USING (true) WITH CHECK (true);

-- Movimentações Caixa
DROP POLICY IF EXISTS "Allow all" ON movimentacoes_caixa;
CREATE POLICY "Allow all" ON movimentacoes_caixa FOR ALL USING (true) WITH CHECK (true);

-- Movimentações Estoque
DROP POLICY IF EXISTS "Allow all" ON movimentacoes_estoque;
CREATE POLICY "Allow all" ON movimentacoes_estoque FOR ALL USING (true) WITH CHECK (true);

-- Contas Pagar
DROP POLICY IF EXISTS "Allow all" ON contas_pagar;
CREATE POLICY "Allow all" ON contas_pagar FOR ALL USING (true) WITH CHECK (true);

-- Contas Receber
DROP POLICY IF EXISTS "Allow all" ON contas_receber;
CREATE POLICY "Allow all" ON contas_receber FOR ALL USING (true) WITH CHECK (true);

-- Pedidos Compra
DROP POLICY IF EXISTS "Allow all" ON pedidos_compra;
CREATE POLICY "Allow all" ON pedidos_compra FOR ALL USING (true) WITH CHECK (true);

-- Itens Pedido Compra
DROP POLICY IF EXISTS "Allow all" ON pedido_compra_itens;
CREATE POLICY "Allow all" ON pedido_compra_itens FOR ALL USING (true) WITH CHECK (true);

-- Promoções
DROP POLICY IF EXISTS "Allow all" ON promocoes;
CREATE POLICY "Allow all" ON promocoes FOR ALL USING (true) WITH CHECK (true);

-- Produtos Promoção
DROP POLICY IF EXISTS "Allow all" ON promocao_produtos;
CREATE POLICY "Allow all" ON promocao_produtos FOR ALL USING (true) WITH CHECK (true);

-- Registros Qualidade
DROP POLICY IF EXISTS "Allow all" ON registros_qualidade;
CREATE POLICY "Allow all" ON registros_qualidade FOR ALL USING (true) WITH CHECK (true);

-- Perdas
DROP POLICY IF EXISTS "Allow all" ON perdas;
CREATE POLICY "Allow all" ON perdas FOR ALL USING (true) WITH CHECK (true);

-- Rastreios
DROP POLICY IF EXISTS "Allow all" ON rastreios;
CREATE POLICY "Allow all" ON rastreios FOR ALL USING (true) WITH CHECK (true);

-- Sazonalidade
DROP POLICY IF EXISTS "Allow all" ON sazonalidade;
CREATE POLICY "Allow all" ON sazonalidade FOR ALL USING (true) WITH CHECK (true);
