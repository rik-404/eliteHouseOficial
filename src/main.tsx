import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);

// Registra o service worker para gerenciamento de cache
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registrado com sucesso:', registration.scope);
        
        // Verifica por atualizações a cada 60 minutos
        setInterval(() => {
          registration.update();
          console.log('Verificando atualizações do Service Worker...');
        }, 60 * 60 * 1000);
      })
      .catch(error => {
        console.error('Erro ao registrar Service Worker:', error);
      });
  });
}
