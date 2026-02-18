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
import { useAuthStore } from './store/useAuthStore';

// Página placeholder para módulos futuros
function EmBreve({ titulo }: { titulo: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <div className="w-20 h-20 rounded-2xl bg-surface-800 flex items-center justify-center mb-4">
        <span className="text-3xl">🚧</span>
      </div>
      <h2 className="text-xl font-bold text-surface-200 mb-2">{titulo}</h2>
      <p className="text-surface-500 max-w-md">
        Este módulo está sendo desenvolvido e estará disponível em breve.
      </p>
    </div>
  );
}

function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
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
  );
}

export default App;
