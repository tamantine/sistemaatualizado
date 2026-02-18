// =============================================
// Hook: Sincronização automática com Supabase
// Carrega dados críticos ao inicializar a app
// =============================================
import { useEffect } from 'react';
import { useEstoqueStore } from '../store/useEstoqueStore';
import { usePDVStore } from '../store/usePDVStore';
import { useCRMStore } from '../store/useCRMStore';
import { useFinanceiroStore } from '../store/useFinanceiroStore';

export function useSyncSupabase() {
    const { carregarDados: carregarEstoque } = useEstoqueStore();
    const { carregarProdutos } = usePDVStore();
    const { carregarDados: carregarCRM } = useCRMStore();
    const { carregarDados: carregarFinanceiro } = useFinanceiroStore();

    useEffect(() => {
        // Carregar dados iniciais de forma paralela
        Promise.all([
            carregarEstoque().catch(err => {
                console.error('[Sync] Erro ao carregar estoque:', err);
                return null;
            }),
            carregarProdutos().catch(err => {
                console.error('[Sync] Erro ao carregar produtos:', err);
                return null;
            }),
            carregarCRM().catch(err => {
                console.error('[Sync] Erro ao carregar CRM:', err);
                return null;
            }),
            carregarFinanceiro().catch(err => {
                console.error('[Sync] Erro ao carregar financeiro:', err);
                return null;
            }),
        ]).catch(err => {
            console.error('[Sync] Erro geral na sincronização:', err);
        });
    }, [carregarEstoque, carregarProdutos, carregarCRM, carregarFinanceiro]);
}
