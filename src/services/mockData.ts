import { Categoria, Produto, Fornecedor, Cliente, MetricasDashboard } from '../types';

// ------ Categorias ------
export const categoriasMock: Categoria[] = [];

// ------ Fornecedores ------
export const fornecedoresMock: Fornecedor[] = [];

// ------ Produtos ------
export const produtosMock: Produto[] = [];

// ------ Clientes ------
export const clientesMock: Cliente[] = [];

// ------ Métricas do Dashboard ------
export const metricasMock: MetricasDashboard = {
    vendasHoje: 0,
    ticketMedio: 0,
    produtosVendidos: 0,
    alertasAtivos: 0,
    vendasSemana: [
        { dia: 'Seg', valor: 0 },
        { dia: 'Ter', valor: 0 },
        { dia: 'Qua', valor: 0 },
        { dia: 'Qui', valor: 0 },
        { dia: 'Sex', valor: 0 },
        { dia: 'Sáb', valor: 0 },
        { dia: 'Dom', valor: 0 },
    ],
    vendasPorCategoria: [],
    topProdutos: [],
    ultimasVendas: [],
    alertasEstoque: [],
};
