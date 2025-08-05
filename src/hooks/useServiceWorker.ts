import { useState, useEffect } from 'react';

export const useServiceWorker = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  // Quando o componente é montado, configura os listeners do service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Função para lidar com a atualização do service worker
      const handleControllerChange = () => {
        window.location.reload();
      };

      // Configura o listener para atualizações
      const handleUpdate = (event: ServiceWorkerRegistration) => {
        const registration = event;
        
        // Se houver um service worker esperando, mostra o botão de atualização
        if (registration.waiting) {
          setUpdateAvailable(true);
          setWaitingWorker(registration.waiting);
          return;
        }

        // Se o service worker estiver instalado, verifica se há uma nova versão
        if (registration.installing) {
          registration.installing.addEventListener('statechange', () => {
            if (registration.waiting) {
              setUpdateAvailable(true);
              setWaitingWorker(registration.waiting);
            }
          });
        }
      };

      // Registra o service worker
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          // Verifica se há uma atualização disponível
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                // Quando o novo service worker estiver instalado
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setUpdateAvailable(true);
                  setWaitingWorker(newWorker);
                }
              });
            }
          });

          // Verifica se há uma atualização a cada 5 minutos
          const interval = setInterval(() => {
            registration.update().catch(console.error);
          }, 5 * 60 * 1000);

          return () => clearInterval(interval);
        })
        .catch((error) => {
          console.error('Erro ao registrar service worker:', error);
        });

      // Adiciona um listener para quando um novo service worker assumir o controle
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

      // Limpa os listeners quando o componente é desmontado
      return () => {
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      };
    }
  }, []);

  // Função para atualizar para a nova versão
  const updateServiceWorker = () => {
    if (waitingWorker) {
      // Envia uma mensagem para o service worker para pular a espera
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  return { updateAvailable, updateServiceWorker };
};
