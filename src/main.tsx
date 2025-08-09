import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './styles/testimonial-slider.css';
import './lib/setupStorage';

// Verifica se há uma nova versão do service worker
const checkForUpdates = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.update().catch(error => {
        console.error('Erro ao verificar atualizações:', error);
      });
    });
  }
};

// Verifica por atualizações quando a página carrega
window.addEventListener('load', () => {
  checkForUpdates();
  
  // Verifica por atualizações a cada 5 minutos
  setInterval(checkForUpdates, 5 * 60 * 1000);
  
  // Verifica por atualizações quando a janela recebe foco
  window.addEventListener('focus', checkForUpdates);
});

// Força a limpeza do cache ao carregar a página
if ('caches' in window) {
  caches.keys().then(cacheNames => {
    cacheNames.forEach(cacheName => {
      if (cacheName !== 'elite-house-hub-v1') {
        caches.delete(cacheName);
      }
    });
  });
}

createRoot(document.getElementById("root")!).render(
  <App />
);
