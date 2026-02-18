// =============================================
// Dados Mock Realistas — Hortifruti
// =============================================
import type { Categoria, Produto, Fornecedor, Cliente, MetricasDashboard } from '../types';

// ------ Categorias ------
export const categoriasMock: Categoria[] = [
    { id: 'cat-1', nome: 'Frutas', descricao: 'Frutas frescas e da estação', cor: '#22c55e', icone: '🍎', ativo: true, created_at: '2026-01-01', updated_at: '2026-01-01' },
    { id: 'cat-2', nome: 'Verduras', descricao: 'Verduras e folhosas', cor: '#16a34a', icone: '🥬', ativo: true, created_at: '2026-01-01', updated_at: '2026-01-01' },
    { id: 'cat-3', nome: 'Legumes', descricao: 'Legumes frescos', cor: '#ea580c', icone: '🥕', ativo: true, created_at: '2026-01-01', updated_at: '2026-01-01' },
    { id: 'cat-4', nome: 'Temperos', descricao: 'Temperos e ervas', cor: '#eab308', icone: '🌿', ativo: true, created_at: '2026-01-01', updated_at: '2026-01-01' },
    { id: 'cat-5', nome: 'Orgânicos', descricao: 'Produtos orgânicos certificados', cor: '#06b6d4', icone: '🌱', ativo: true, created_at: '2026-01-01', updated_at: '2026-01-01' },
    { id: 'cat-6', nome: 'Importados', descricao: 'Frutas e produtos importados', cor: '#8b5cf6', icone: '🌍', ativo: true, created_at: '2026-01-01', updated_at: '2026-01-01' },
];

// ------ Fornecedores ------
export const fornecedoresMock: Fornecedor[] = [
    { id: 'forn-1', razao_social: 'CEASA Distribuidora Ltda', nome_fantasia: 'CEASA SP', cnpj_cpf: '12.345.678/0001-90', tipo: 'juridica', telefone: '(11) 3333-4444', email: 'contato@ceasa.com', cidade: 'São Paulo', estado: 'SP', ativo: true, created_at: '2026-01-01', updated_at: '2026-01-01' },
    { id: 'forn-2', razao_social: 'Sítio Boa Vista', nome_fantasia: 'Boa Vista Orgânicos', cnpj_cpf: '98.765.432/0001-10', tipo: 'produtor_rural', telefone: '(19) 9999-8888', email: 'sitio@boavista.com', cidade: 'Campinas', estado: 'SP', ativo: true, created_at: '2026-01-01', updated_at: '2026-01-01' },
    { id: 'forn-3', razao_social: 'Frutas Tropicais do Brasil', nome_fantasia: 'Tropical Fruits', cnpj_cpf: '11.222.333/0001-44', tipo: 'juridica', telefone: '(21) 2222-3333', email: 'vendas@tropicalfruits.com', cidade: 'Rio de Janeiro', estado: 'RJ', ativo: true, created_at: '2026-01-01', updated_at: '2026-01-01' },
];

// ------ Produtos ------
export const produtosMock: Produto[] = [
    { id: 'prod-1', nome: 'Banana Prata', codigo: 'FRT001', codigo_barras: '7891234560001', categoria_id: 'cat-1', fornecedor_id: 'forn-1', unidade: 'KG', preco_custo: 2.50, preco_venda: 3.99, margem_lucro: 59.6, estoque_atual: 150, estoque_minimo: 30, data_validade: '2026-02-25', lote: 'L2026-001', ativo: true, em_promocao: false, icms_aliquota: 0, pis_aliquota: 0, cofins_aliquota: 0, created_at: '2026-01-15', updated_at: '2026-02-17' },
    { id: 'prod-2', nome: 'Tomate Italiano', codigo: 'LEG001', codigo_barras: '7891234560002', categoria_id: 'cat-3', fornecedor_id: 'forn-1', unidade: 'KG', preco_custo: 3.80, preco_venda: 5.49, margem_lucro: 44.5, estoque_atual: 80, estoque_minimo: 20, data_validade: '2026-02-22', lote: 'L2026-002', ativo: true, em_promocao: false, icms_aliquota: 0, pis_aliquota: 0, cofins_aliquota: 0, created_at: '2026-01-15', updated_at: '2026-02-17' },
    { id: 'prod-3', nome: 'Maçã Fuji', codigo: 'FRT002', codigo_barras: '7891234560003', categoria_id: 'cat-1', fornecedor_id: 'forn-3', unidade: 'UN', preco_custo: 0.80, preco_venda: 1.20, margem_lucro: 50.0, estoque_atual: 300, estoque_minimo: 50, data_validade: '2026-03-10', lote: 'L2026-003', ativo: true, em_promocao: false, icms_aliquota: 0, pis_aliquota: 0, cofins_aliquota: 0, created_at: '2026-01-15', updated_at: '2026-02-17' },
    { id: 'prod-4', nome: 'Alface Crespa', codigo: 'VER001', codigo_barras: '7891234560004', categoria_id: 'cat-2', fornecedor_id: 'forn-2', unidade: 'UN', preco_custo: 1.50, preco_venda: 2.50, margem_lucro: 66.7, estoque_atual: 45, estoque_minimo: 15, data_validade: '2026-02-20', lote: 'L2026-004', ativo: true, em_promocao: false, icms_aliquota: 0, pis_aliquota: 0, cofins_aliquota: 0, created_at: '2026-01-15', updated_at: '2026-02-17' },
    { id: 'prod-5', nome: 'Laranja Bahia', codigo: 'FRT003', codigo_barras: '7891234560005', categoria_id: 'cat-1', fornecedor_id: 'forn-1', unidade: 'KG', preco_custo: 3.20, preco_venda: 4.99, margem_lucro: 55.9, estoque_atual: 200, estoque_minimo: 40, data_validade: '2026-03-01', lote: 'L2026-005', ativo: true, em_promocao: true, preco_promocional: 3.99, promocao_inicio: '2026-02-15', promocao_fim: '2026-02-22', icms_aliquota: 0, pis_aliquota: 0, cofins_aliquota: 0, created_at: '2026-01-15', updated_at: '2026-02-17' },
    { id: 'prod-6', nome: 'Cenoura', codigo: 'LEG002', codigo_barras: '7891234560006', categoria_id: 'cat-3', fornecedor_id: 'forn-1', unidade: 'KG', preco_custo: 2.00, preco_venda: 3.49, margem_lucro: 74.5, estoque_atual: 90, estoque_minimo: 25, data_validade: '2026-03-05', lote: 'L2026-006', ativo: true, em_promocao: false, icms_aliquota: 0, pis_aliquota: 0, cofins_aliquota: 0, created_at: '2026-01-15', updated_at: '2026-02-17' },
    { id: 'prod-7', nome: 'Mamão Papaya', codigo: 'FRT004', codigo_barras: '7891234560007', categoria_id: 'cat-1', fornecedor_id: 'forn-3', unidade: 'UN', preco_custo: 3.00, preco_venda: 4.99, margem_lucro: 66.3, estoque_atual: 60, estoque_minimo: 15, data_validade: '2026-02-21', lote: 'L2026-007', ativo: true, em_promocao: false, icms_aliquota: 0, pis_aliquota: 0, cofins_aliquota: 0, created_at: '2026-01-15', updated_at: '2026-02-17' },
    { id: 'prod-8', nome: 'Rúcula Orgânica', codigo: 'ORG001', codigo_barras: '7891234560008', categoria_id: 'cat-5', fornecedor_id: 'forn-2', unidade: 'UN', preco_custo: 2.00, preco_venda: 3.99, margem_lucro: 99.5, estoque_atual: 30, estoque_minimo: 10, data_validade: '2026-02-19', lote: 'L2026-008', ativo: true, em_promocao: false, icms_aliquota: 0, pis_aliquota: 0, cofins_aliquota: 0, created_at: '2026-01-15', updated_at: '2026-02-17' },
    { id: 'prod-9', nome: 'Manjericão', codigo: 'TEM001', codigo_barras: '7891234560009', categoria_id: 'cat-4', fornecedor_id: 'forn-2', unidade: 'UN', preco_custo: 1.00, preco_venda: 2.49, margem_lucro: 149.0, estoque_atual: 40, estoque_minimo: 10, data_validade: '2026-02-20', lote: 'L2026-009', ativo: true, em_promocao: false, icms_aliquota: 0, pis_aliquota: 0, cofins_aliquota: 0, created_at: '2026-01-15', updated_at: '2026-02-17' },
    { id: 'prod-10', nome: 'Abacaxi Pérola', codigo: 'FRT005', codigo_barras: '7891234560010', categoria_id: 'cat-1', fornecedor_id: 'forn-3', unidade: 'UN', preco_custo: 3.50, preco_venda: 5.99, margem_lucro: 71.1, estoque_atual: 40, estoque_minimo: 10, data_validade: '2026-02-28', lote: 'L2026-010', ativo: true, em_promocao: false, icms_aliquota: 0, pis_aliquota: 0, cofins_aliquota: 0, created_at: '2026-01-15', updated_at: '2026-02-17' },
    { id: 'prod-11', nome: 'Batata Inglesa', codigo: 'LEG003', codigo_barras: '7891234560011', categoria_id: 'cat-3', fornecedor_id: 'forn-1', unidade: 'KG', preco_custo: 2.80, preco_venda: 4.49, margem_lucro: 60.4, estoque_atual: 120, estoque_minimo: 30, data_validade: '2026-03-15', lote: 'L2026-011', ativo: true, em_promocao: false, icms_aliquota: 0, pis_aliquota: 0, cofins_aliquota: 0, created_at: '2026-01-15', updated_at: '2026-02-17' },
    { id: 'prod-12', nome: 'Morango', codigo: 'FRT006', codigo_barras: '7891234560012', categoria_id: 'cat-1', fornecedor_id: 'forn-2', unidade: 'CX', preco_custo: 5.00, preco_venda: 8.99, margem_lucro: 79.8, estoque_atual: 8, estoque_minimo: 15, data_validade: '2026-02-19', lote: 'L2026-012', ativo: true, em_promocao: false, icms_aliquota: 0, pis_aliquota: 0, cofins_aliquota: 0, created_at: '2026-01-15', updated_at: '2026-02-17' },
    { id: 'prod-13', nome: 'Couve Manteiga', codigo: 'VER002', codigo_barras: '7891234560013', categoria_id: 'cat-2', fornecedor_id: 'forn-2', unidade: 'UN', preco_custo: 1.20, preco_venda: 2.29, margem_lucro: 90.8, estoque_atual: 35, estoque_minimo: 10, data_validade: '2026-02-20', lote: 'L2026-013', ativo: true, em_promocao: false, icms_aliquota: 0, pis_aliquota: 0, cofins_aliquota: 0, created_at: '2026-01-15', updated_at: '2026-02-17' },
    { id: 'prod-14', nome: 'Cebola Roxa', codigo: 'LEG004', codigo_barras: '7891234560014', categoria_id: 'cat-3', fornecedor_id: 'forn-1', unidade: 'KG', preco_custo: 3.50, preco_venda: 5.99, margem_lucro: 71.1, estoque_atual: 70, estoque_minimo: 20, data_validade: '2026-03-10', lote: 'L2026-014', ativo: true, em_promocao: false, icms_aliquota: 0, pis_aliquota: 0, cofins_aliquota: 0, created_at: '2026-01-15', updated_at: '2026-02-17' },
    { id: 'prod-15', nome: 'Uva Itália', codigo: 'FRT007', codigo_barras: '7891234560015', categoria_id: 'cat-1', fornecedor_id: 'forn-3', unidade: 'KG', preco_custo: 8.00, preco_venda: 12.99, margem_lucro: 62.4, estoque_atual: 25, estoque_minimo: 10, data_validade: '2026-02-23', lote: 'L2026-015', ativo: true, em_promocao: false, icms_aliquota: 0, pis_aliquota: 0, cofins_aliquota: 0, created_at: '2026-01-15', updated_at: '2026-02-17' },
    { id: 'prod-16', nome: 'Kiwi Importado', codigo: 'IMP001', codigo_barras: '7891234560016', categoria_id: 'cat-6', fornecedor_id: 'forn-3', unidade: 'UN', preco_custo: 2.50, preco_venda: 4.49, margem_lucro: 79.6, estoque_atual: 50, estoque_minimo: 15, data_validade: '2026-03-01', lote: 'L2026-016', ativo: true, em_promocao: false, icms_aliquota: 0, pis_aliquota: 0, cofins_aliquota: 0, created_at: '2026-01-15', updated_at: '2026-02-17' },
    { id: 'prod-17', nome: 'Salsinha', codigo: 'TEM002', codigo_barras: '7891234560017', categoria_id: 'cat-4', fornecedor_id: 'forn-2', unidade: 'UN', preco_custo: 0.80, preco_venda: 1.99, margem_lucro: 148.8, estoque_atual: 50, estoque_minimo: 15, data_validade: '2026-02-20', lote: 'L2026-017', ativo: true, em_promocao: false, icms_aliquota: 0, pis_aliquota: 0, cofins_aliquota: 0, created_at: '2026-01-15', updated_at: '2026-02-17' },
    { id: 'prod-18', nome: 'Pepino Japonês', codigo: 'LEG005', codigo_barras: '7891234560018', categoria_id: 'cat-3', fornecedor_id: 'forn-1', unidade: 'KG', preco_custo: 3.00, preco_venda: 4.99, margem_lucro: 66.3, estoque_atual: 55, estoque_minimo: 15, data_validade: '2026-02-24', lote: 'L2026-018', ativo: true, em_promocao: false, icms_aliquota: 0, pis_aliquota: 0, cofins_aliquota: 0, created_at: '2026-01-15', updated_at: '2026-02-17' },
    { id: 'prod-19', nome: 'Manga Tommy', codigo: 'FRT008', codigo_barras: '7891234560019', categoria_id: 'cat-1', fornecedor_id: 'forn-3', unidade: 'UN', preco_custo: 2.00, preco_venda: 3.49, margem_lucro: 74.5, estoque_atual: 75, estoque_minimo: 20, data_validade: '2026-02-26', lote: 'L2026-019', ativo: true, em_promocao: false, icms_aliquota: 0, pis_aliquota: 0, cofins_aliquota: 0, created_at: '2026-01-15', updated_at: '2026-02-17' },
    { id: 'prod-20', nome: 'Espinafre Orgânico', codigo: 'ORG002', codigo_barras: '7891234560020', categoria_id: 'cat-5', fornecedor_id: 'forn-2', unidade: 'UN', preco_custo: 2.50, preco_venda: 4.49, margem_lucro: 79.6, estoque_atual: 20, estoque_minimo: 10, data_validade: '2026-02-19', lote: 'L2026-020', ativo: true, em_promocao: false, icms_aliquota: 0, pis_aliquota: 0, cofins_aliquota: 0, created_at: '2026-01-15', updated_at: '2026-02-17' },
];

// ------ Clientes ------
export const clientesMock: Cliente[] = [
    { id: 'cli-1', nome: 'Maria da Silva', cpf_cnpj: '123.456.789-00', telefone: '(11) 98765-4321', email: 'maria@email.com', cidade: 'São Paulo', estado: 'SP', limite_credito: 500, saldo_credito: 500, pontos_fidelidade: 1250, ativo: true, created_at: '2026-01-10', updated_at: '2026-02-17' },
    { id: 'cli-2', nome: 'João Oliveira', cpf_cnpj: '987.654.321-00', telefone: '(11) 91234-5678', email: 'joao@email.com', cidade: 'São Paulo', estado: 'SP', limite_credito: 300, saldo_credito: 150, pontos_fidelidade: 800, ativo: true, created_at: '2026-01-12', updated_at: '2026-02-17' },
    { id: 'cli-3', nome: 'Ana Costa', cpf_cnpj: '456.789.123-00', telefone: '(11) 95555-6666', email: 'ana@email.com', cidade: 'Guarulhos', estado: 'SP', limite_credito: 200, saldo_credito: 200, pontos_fidelidade: 450, ativo: true, created_at: '2026-01-15', updated_at: '2026-02-17' },
    { id: 'cli-4', nome: 'Pedro Santos', cpf_cnpj: '321.654.987-00', telefone: '(11) 94444-3333', email: 'pedro@email.com', cidade: 'São Paulo', estado: 'SP', limite_credito: 1000, saldo_credito: 800, pontos_fidelidade: 3200, ativo: true, created_at: '2026-01-05', updated_at: '2026-02-17' },
    { id: 'cli-5', nome: 'Restaurante Sabor da Terra', cpf_cnpj: '12.345.678/0001-99', telefone: '(11) 3333-2222', email: 'compras@sabordaterra.com', cidade: 'São Paulo', estado: 'SP', limite_credito: 5000, saldo_credito: 3500, pontos_fidelidade: 8900, ativo: true, created_at: '2025-12-01', updated_at: '2026-02-17' },
];

// ------ Métricas do Dashboard ------
export const metricasMock: MetricasDashboard = {
    vendasHoje: 8456.90,
    ticketMedio: 47.50,
    produtosVendidos: 178,
    alertasAtivos: 5,
    vendasSemana: [
        { dia: 'Seg', valor: 6230 },
        { dia: 'Ter', valor: 7150 },
        { dia: 'Qua', valor: 5890 },
        { dia: 'Qui', valor: 8340 },
        { dia: 'Sex', valor: 9120 },
        { dia: 'Sáb', valor: 12580 },
        { dia: 'Dom', valor: 8456 },
    ],
    vendasPorCategoria: [
        { nome: 'Frutas', valor: 35, cor: '#22c55e' },
        { nome: 'Verduras', valor: 20, cor: '#16a34a' },
        { nome: 'Legumes', valor: 25, cor: '#ea580c' },
        { nome: 'Temperos', valor: 8, cor: '#eab308' },
        { nome: 'Orgânicos', valor: 7, cor: '#06b6d4' },
        { nome: 'Importados', valor: 5, cor: '#8b5cf6' },
    ],
    topProdutos: [
        { nome: 'Banana Prata', quantidade: 45, valor: 179.55 },
        { nome: 'Tomate Italiano', quantidade: 32, valor: 175.68 },
        { nome: 'Batata Inglesa', quantidade: 28, valor: 125.72 },
        { nome: 'Laranja Bahia', quantidade: 25, valor: 99.75 },
        { nome: 'Maçã Fuji', quantidade: 22, valor: 26.40 },
        { nome: 'Cenoura', quantidade: 18, valor: 62.82 },
        { nome: 'Mamão Papaya', quantidade: 15, valor: 74.85 },
        { nome: 'Alface Crespa', quantidade: 14, valor: 35.00 },
        { nome: 'Cebola Roxa', quantidade: 12, valor: 71.88 },
        { nome: 'Uva Itália', quantidade: 10, valor: 129.90 },
    ],
    ultimasVendas: [
        { id: 'v-1', numero_venda: 1085, operador_nome: 'Ana', subtotal: 67.50, desconto_valor: 0, desconto_percentual: 0, total: 67.50, forma_pagamento: 'pix', valor_pago: 67.50, troco: 0, status: 'finalizada', created_at: '2026-02-17T14:30:00' },
        { id: 'v-2', numero_venda: 1084, operador_nome: 'Carlos', subtotal: 123.80, desconto_valor: 5, desconto_percentual: 0, total: 118.80, forma_pagamento: 'credito', valor_pago: 118.80, troco: 0, status: 'finalizada', created_at: '2026-02-17T14:15:00' },
        { id: 'v-3', numero_venda: 1083, operador_nome: 'Ana', subtotal: 34.90, desconto_valor: 0, desconto_percentual: 0, total: 34.90, forma_pagamento: 'dinheiro', valor_pago: 50, troco: 15.10, status: 'finalizada', created_at: '2026-02-17T13:50:00' },
        { id: 'v-4', numero_venda: 1082, operador_nome: 'Carlos', subtotal: 89.70, desconto_valor: 0, desconto_percentual: 0, total: 89.70, forma_pagamento: 'debito', valor_pago: 89.70, troco: 0, status: 'finalizada', created_at: '2026-02-17T13:25:00' },
        { id: 'v-5', numero_venda: 1081, operador_nome: 'Ana', subtotal: 256.30, desconto_valor: 10, desconto_percentual: 0, total: 246.30, forma_pagamento: 'multiplo', valor_pago: 246.30, troco: 0, status: 'finalizada', created_at: '2026-02-17T12:55:00' },
    ],
    alertasEstoque: [
        { produto: 'Morango', tipo: 'ruptura', detalhe: 'Estoque: 8 cx (mínimo: 15)' },
        { produto: 'Rúcula Orgânica', tipo: 'vencimento', detalhe: 'Vence em 2 dias' },
        { produto: 'Espinafre Orgânico', tipo: 'vencimento', detalhe: 'Vence em 2 dias' },
        { produto: 'Alface Crespa', tipo: 'vencimento', detalhe: 'Vence em 3 dias' },
        { produto: 'Tomate Italiano', tipo: 'vencimento', detalhe: 'Vence em 5 dias' },
    ],
};
