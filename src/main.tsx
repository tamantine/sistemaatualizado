import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
} else {
  document.body.innerHTML = '<h1>ERRO: Root element não encontrado</h1>';
}
