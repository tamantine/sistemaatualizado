// =============================================
// Inicialização do Firebase — Verificação de Conexão
//
// COMPORTAMENTO ESPERADO:
//  • Primeira abertura  → Firebase vazio → arrays [] → cliente cadastra → salva no Firebase
//  • Aberturas seguintes → Firebase com dados → carrega normalmente
//
// O sistema NÃO popula dados automaticamente.
// Dados de exemplo devem ser inseridos manualmente pelo operador.
// =============================================

import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from './firebase';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

export interface StatusConexao {
  conectado: boolean;
  erro?: string;
  timestamp: string;
}

export interface StatusColecoes {
  possuiDados: boolean;
  colecoes: Record<string, number>; // nome → quantidade de documentos
}

// ─────────────────────────────────────────────
// Constantes internas
// ─────────────────────────────────────────────

/** Coleções principais monitoradas pelo sistema */
const COLECOES_MONITORADAS = [
  'produtos',
  'categorias',
  'fornecedores',
  'clientes',
  'vendas',
  'caixas',
  'contas_pagar',
  'contas_receber',
  'pedidos_compra',
  'promocoes',
] as const;

// ─────────────────────────────────────────────
// Utilitários
// ─────────────────────────────────────────────

/** Retorna timestamp ISO atual */
function agora(): string {
  return new Date().toISOString();
}

// ─────────────────────────────────────────────
// Verificações de conexão e estado
// ─────────────────────────────────────────────

/**
 * Verifica se o Firebase está acessível.
 * Realiza uma leitura leve em 'produtos' para confirmar conectividade.
 */
export async function verificarConexaoFirebase(): Promise<StatusConexao> {
  try {
    const q = query(collection(db, 'produtos'), limit(1));
    await getDocs(q);
    return { conectado: true, timestamp: agora() };
  } catch (error) {
    const mensagem = error instanceof Error ? error.message : 'Erro desconhecido';
    console.warn('[Firebase] Falha na verificação de conexão:', mensagem);
    return { conectado: false, erro: mensagem, timestamp: agora() };
  }
}

/**
 * Verifica o estado das coleções no Firebase.
 * Útil para o Dashboard ou página de configurações mostrarem status.
 */
export async function verificarEstadoColecoes(): Promise<StatusColecoes> {
  const resultado: Record<string, number> = {};
  let totalDocumentos = 0;

  await Promise.allSettled(
    COLECOES_MONITORADAS.map(async (nome) => {
      try {
        const snapshot = await getDocs(query(collection(db, nome), limit(50)));
        const qtd = snapshot.size;
        resultado[nome] = qtd;
        totalDocumentos += qtd;
      } catch {
        resultado[nome] = 0;
      }
    })
  );

  return {
    possuiDados: totalDocumentos > 0,
    colecoes: resultado,
  };
}

// ─────────────────────────────────────────────
// Inicialização principal — SEM seed automático
// ─────────────────────────────────────────────

/**
 * Inicializa o sistema verificando a conexão com o Firebase.
 *
 * ✅ NÃO insere dados de exemplo automaticamente.
 * ✅ Conexão OK  → sistema inicia normalmente (carrega dados existentes ou vazio).
 * ✅ Conexão FAIL → sistema inicia com fallback offline (arrays vazios).
 *
 * @returns Promise<void> — resolve sempre, nunca rejeita
 */
export async function inicializarBancoDeDados(): Promise<void> {
  console.log('[InitDB] 🔄 Verificando conexão com Firebase...');

  const status = await verificarConexaoFirebase();

  if (status.conectado) {
    console.log('[InitDB] ✅ Firebase conectado — sistema pronto para uso.');
  } else {
    console.warn(
      '[InitDB] ⚠️ Firebase indisponível — o sistema iniciará sem sincronização.',
      status.erro
    );
  }
}

// ─────────────────────────────────────────────
// Exportações para uso externo (ex: página de Configurações)
// ─────────────────────────────────────────────

export default inicializarBancoDeDados;
