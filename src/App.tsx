// =============================================
// App Principal — Rotas e Autenticação
// =============================================
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Estoque from './pages/Estoque';
import PDV from './pages/PDV';
import Financeiro from './pages/Financeiro';
import CRM from './pages/CRM';
import Compras from './pages/Compras';
import HortifrutiPage from './pages/Hortifruti';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useAuthStore } from './store/useAuthStore';

function EmBreve({ titulo }: { titulo: string }) {
  return (
    <div style={{ padding: '2rem', textAlign: 'center', color: 'white' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>🚧 {titulo}</h2>
      <p style={{ color: '#999' }}>Este módulo está sendo desenvolvido.</p>
    </div>
  );
}

function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    console.log('[App] Inicializando autenticação...');
    initialize().catch(err => {
      console.error('[App] Erro ao inicializar:', err);
    });
  }, [initialize]);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/estoque" element={<Estoque />} />
            <Route path="/pdv" element={<PDV />} />
            <Route path="/clientes" element={<CRM />} />
            <Route path="/financeiro" element={<Financeiro />} />
            <Route path="/compras" element={<Compras />} />
            <Route path="/promocoes" element={<CRM />} />
            <Route path="/fornecedores" element={<Compras />} />
            <Route path="/relatorios" element={<EmBreve titulo="Relatórios" />} />
            <Route path="/fiscal" element={<EmBreve titulo="Fiscal & Tributário" />} />
            <Route path="/hortifruti" element={<HortifrutiPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
