const CACHE_NAME = 'elite-house-hub-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico'
  // Removido '/assets/*' pois pode causar erros ao tentar fazer cache de um padrão
];

// Adiciona logs para depuração
console.log('[Service Worker] Iniciando Service Worker');

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando Service Worker');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Adicionando recursos ao cache');
        // Usamos Promise.all para tratar cada adição ao cache individualmente
        return Promise.all(
          ASSETS_TO_CACHE.map(url => {
            return cache.add(url).catch(error => {
              console.warn(`[Service Worker] Falha ao adicionar ${url} ao cache:`, error);
              // Continua mesmo se um recurso falhar
              return Promise.resolve();
            });
          })
        );
      })
      .catch(error => {
        console.error('[Service Worker] Erro durante a instalação:', error);
      })
  );
  
  self.skipWaiting();
  console.log('[Service Worker] Instalação concluída');
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Ativando Service Worker');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      console.log('[Service Worker] Caches encontrados:', cacheNames);
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log(`[Service Worker] Removendo cache antigo: ${cache}`);
            return caches.delete(cache);
          }
          return Promise.resolve();
        })
      );
    })
    .then(() => {
      console.log('[Service Worker] Ativação concluída');
      // Força a ativação imediata
      return self.clients.claim();
    })
    .catch(error => {
      console.error('[Service Worker] Erro durante a ativação:', error);
    })
  );
});

// Estratégia de cache: Network First, fallback para cache
self.addEventListener('fetch', (event) => {
  // Ignora requisições que não são GET
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Ignora requisições de extensões do navegador
  if (event.request.url.includes('browser-sync') || 
      event.request.url.includes('chrome-extension')) {
    return;
  }
  
  console.log(`[Service Worker] Buscando recurso: ${event.request.url}`);
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Se a requisição for bem-sucedida, atualiza o cache
        if (response && (response.status === 200 || response.status === 0)) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            console.log(`[Service Worker] Atualizando cache para: ${event.request.url}`);
            cache.put(event.request, responseClone).catch(error => {
              console.warn(`[Service Worker] Falha ao atualizar cache para ${event.request.url}:`, error);
            });
          });
        }
        return response;
      })
      .catch((error) => {
        console.warn(`[Service Worker] Falha na requisição para ${event.request.url}, tentando cache...`, error);
        // Se a rede falhar, tenta buscar do cache
        return caches.match(event.request).then((response) => {
          return response || new Response('Offline - Não foi possível carregar o recurso');
        });
      })
  );
});

// Ouvinte para mensagens da aplicação
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
