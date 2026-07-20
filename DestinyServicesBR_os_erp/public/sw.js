/* ============================================================
   Caminho: DestinyServicesBR_os_erp/public/sw.js
   Service Worker (PWA Cache & Offline First)
   ============================================================ */

const CACHE_NAME = 'erp-dsbrti-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/utils.js',
  '/manifest.json',
  '/services/pdf.js',
  '/services/pix.js'
];

// Instalação do SW e Armazenamento do Cache Estático
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pré-carregando assets estáticos');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Ativação e Limpeza de Caches Antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Deletando cache antigo:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interceptação de Requisições
self.addEventListener('fetch', (event) => {
  // Ignora requisições de API (sempre buscar no servidor/rede)
  if (event.request.url.includes('/api/')) {
    return;
  }

  // Estratégia: Tenta o Cache primeiro, se não encontrar, busca na Rede
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).catch((err) => {
        console.error('[Service Worker] Erro de rede e item fora do cache:', err);
      });
    })
  );
});
