// =============================================
// mockData.ts — Dados de demonstração
//
// ⚠️  ATENÇÃO: Este arquivo NÃO é usado automaticamente pelo sistema.
//
// Uso permitido:
//  • Scripts manuais de seed (src/scripts/seedAll.ts etc.)
//  • Testes unitários / E2E
//  • Demonstrações isoladas em ambiente de desenvolvimento
//
// O sistema de produção NUNCA importa este arquivo
// nas stores ou na inicialização do app.
// =============================================

import type {
  Categoria,
  Produto,
  Fornecedor,
  Cliente,
  Venda,
  Promocao,
} from '../types';

// ─────────────────────────────────────────────
// Categorias
// ─────────────────────────────────────────────

export const categoriasMock: Categoria[] = [
  {
    id: 'mock-cat-1',
    nome: 'Frutas',
    descricao: 'Frutas frescas',
    cor: '#ff6b6b',
    icone: '🍎',
    ativo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mock-cat-2',
    nome: 'Verduras',
    descricao: 'Folhagens e legumes',
    cor: '#51cf66',
    icone: '🥬',
    ativo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mock-cat-3',
    nome: 'Tubérculos',
    descricao: 'Batata, cenoura, beterraba',
    cor: '#ffa94d',
    icone: '🥕',
    ativo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// ─────────────────────────────────────────────
// Fornecedores
// ─────────────────────────────────────────────

export const fornecedoresMock: Fornecedor[] = [
  {
    id: 'mock-forn-1',
    razao_social: 'Produtor Rural Silva',
    nome_fantasia: 'Silva Frutas',
    telefone: '(11) 99999-0001',
    email: 'silva@email.com',
    tipo: 'produtor_rural',
    ativo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mock-forn-2',
    razao_social: 'Distribuidor Hortifruti LTDA',
    nome_fantasia: 'Distribuidor Hortifruti',
    cnpj_cpf: '12.345.678/0001-90',
    telefone: '(11) 3333-4444',
    email: 'contato@distribuidor.com.br',
    tipo: 'juridica',
    ativo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// ─────────────────────────────────────────────
// Produtos
// ─────────────────────────────────────────────

export const produtosMock: Produto[] = [
  {
    id: 'mock-prod-1',
    nome: 'Maçã Fuji',
    codigo: 'MACA001',
    codigo_barras: '7894567890123',
    categoria_id: 'mock-cat-1',
    fornecedor_id: 'mock-forn-1',
    unidade: 'KG',
    preco_custo: 2.50,
    preco_venda: 5.99,
    margem_lucro: 139.6,
    estoque_atual: 45,
    estoque_minimo: 10,
    data_validade: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    lote: 'L2026001',
    localizacao: 'A1',
    icms_aliquota: 7,
    pis_aliquota: 1.65,
    cofins_aliquota: 7.6,
    em_promocao: false,
    ativo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categoria: categoriasMock[0],
    fornecedor: fornecedoresMock[0],
  },
  {
    id: 'mock-prod-2',
    nome: 'Alface Crespa',
    codigo: 'ALFA001',
    codigo_barras: '7894567890124',
    categoria_id: 'mock-cat-2',
    fornecedor_id: 'mock-forn-2',
    unidade: 'UN',
    preco_custo: 1.00,
    preco_venda: 2.99,
    margem_lucro: 199,
    estoque_atual: 120,
    estoque_minimo: 20,
    data_validade: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    lote: 'L2026002',
    localizacao: 'B2',
    icms_aliquota: 0,
    pis_aliquota: 0,
    cofins_aliquota: 0,
    em_promocao: true,
    preco_promocional: 2.49,
    promocao_inicio: new Date().toISOString().split('T')[0],
    promocao_fim: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    ativo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categoria: categoriasMock[1],
    fornecedor: fornecedoresMock[1],
  },
  {
    id: 'mock-prod-3',
    nome: 'Cenoura',
    codigo: 'CENO001',
    codigo_barras: '7894567890125',
    categoria_id: 'mock-cat-3',
    fornecedor_id: 'mock-forn-1',
    unidade: 'KG',
    preco_custo: 1.50,
    preco_venda: 3.99,
    margem_lucro: 166,
    estoque_atual: 80,
    estoque_minimo: 15,
    data_validade: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    lote: 'L2026003',
    localizacao: 'C1',
    icms_aliquota: 7,
    pis_aliquota: 1.65,
    cofins_aliquota: 7.6,
    em_promocao: false,
    ativo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categoria: categoriasMock[2],
    fornecedor: fornecedoresMock[0],
  },
];

// ─────────────────────────────────────────────
// Clientes
// ─────────────────────────────────────────────

export const clientesMock: Cliente[] = [
  {
    id: 'mock-cli-1',
    nome: 'João da Silva',
    cpf_cnpj: '123.456.789-00',
    telefone: '(11) 99999-1111',
    email: 'joao@email.com',
    cidade: 'São Paulo',
    estado: 'SP',
    limite_credito: 500,
    saldo_credito: 0,
    pontos_fidelidade: 150,
    ativo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mock-cli-2',
    nome: 'Maria Oliveira',
    cpf_cnpj: '987.654.321-00',
    telefone: '(11) 88888-2222',
    email: 'maria@email.com',
    cidade: 'São Paulo',
    estado: 'SP',
    limite_credito: 1000,
    saldo_credito: 0,
    pontos_fidelidade: 780,
    ativo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// ─────────────────────────────────────────────
// Promoções
// ─────────────────────────────────────────────

export const promocoesMock: Promocao[] = [
  {
    id: 'mock-promo-1',
    nome: 'Promoção de Verão',
    descricao: '20% off em todas as frutas',
    tipo: 'percentual',
    valor_desconto: 20,
    quantidade_minima: 1,
    data_inicio: new Date().toISOString().split('T')[0],
    data_fim: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    ativo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// ─────────────────────────────────────────────
// Vendas
// ─────────────────────────────────────────────

export const vendasMock: Venda[] = [];
