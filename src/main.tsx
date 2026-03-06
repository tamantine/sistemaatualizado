// =============================================
// Ponto de entrada da aplicação
//
// Fluxo de inicialização:
//  1. Verifica conexão com Firebase (sem seed/mock)
//  2. Renderiza o App independentemente do resultado
//  3. Cada store carrega seus dados do Firebase ao montar
// =============================================

import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { inicializarBancoDeDados } from './lib/initDatabase.ts';

// ─────────────────────────────────────────────
// Tratamento global de erros (mantido original)
// ─────────────────────────────────────────────

window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.message?.includes('payload')) {
    event.preventDefault();
    console.warn('[Global] Promise ignorada:', event.reason.message);
  }
});

window.addEventListener('error', (event) => {
  if (event.filename?.includes('giveFreely')) {
    event.preventDefault();
    console.warn('[Global] Script externo ignorado:', event.message);
  }
});

// ─────────────────────────────────────────────
// Renderização
// ─────────────────────────────────────────────

function renderApp() {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    document.body.innerHTML = '<h1>ERRO: elemento #root não encontrado</h1>';
    return;
  }
  createRoot(rootElement).render(<App />);
}

// Verifica conexão com Firebase, depois renderiza o app.
// O app inicia SEMPRE — mesmo que o Firebase esteja offline.
inicializarBancoDeDados()
  .catch((error) => {
    // Loga mas não bloqueia a renderização
    console.error('[Main] Erro na inicialização (não crítico):', error);
  })
  .finally(() => {
    renderApp();
  });
