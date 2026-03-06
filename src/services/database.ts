// =============================================
// Serviço de Banco de Dados Unificado
// =============================================
// Nota: ACTIVE_DATABASE está configurado em src/lib/database.ts
// O sistema está usando Firebase como banco de dados

// Importar serviços do Firebase
import {
    categoriasService,
    fornecedoresService,
    produtosService,
    clientesService,
    caixasService,
    vendasService,
    contasPagarService,
    contasReceberService,
    pedidosCompraService,
    cotacoesService,
    promocoesService,
    tabelasPrecoService,
    qualidadeService,
    perdasService,
    rastreiosService,
    sazonalidadeService,
    dashboardService,
    movimentacoesCaixaService,
} from './firebaseService';

// Re-exportar serviços do Firebase como padrão
// O sistema está configurado para usar Firebase (ACTIVE_DATABASE = 'firebase')
export {
    categoriasService,
    fornecedoresService,
    produtosService,
    clientesService,
    caixasService,
    vendasService,
    contasPagarService,
    contasReceberService,
    pedidosCompraService,
    cotacoesService,
    promocoesService,
    tabelasPrecoService,
    qualidadeService,
    perdasService,
    rastreiosService,
    sazonalidadeService,
    dashboardService,
    movimentacoesCaixaService,
};

// Exportar como default para compatibilidade
export default {
    categoriasService,
    fornecedoresService,
    produtosService,
    clientesService,
    caixasService,
    vendasService,
    contasPagarService,
    contasReceberService,
    pedidosCompraService,
    cotacoesService,
    promocoesService,
    tabelasPrecoService,
    qualidadeService,
    perdasService,
    rastreiosService,
    sazonalidadeService,
    dashboardService,
    movimentacoesCaixaService,
};
