import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

console.log('main.tsx iniciando...');

const rootElement = document.getElementById('root');
console.log('Root element encontrado?', !!rootElement);

if (rootElement) {
  console.log('Criando React root...');
  const root = createRoot(rootElement);
  console.log('Renderizando App...');
  root.render(<App />);
  console.log('App renderizado com sucesso!');
} else {
  console.error('Root element não encontrado!');
  document.body.innerHTML = '<h1>ERRO: Root element não encontrado</h1>';
}
