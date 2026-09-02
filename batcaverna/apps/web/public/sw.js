// ============================================================
// BatCaverna — Service Worker (PWA Offline Support)
// Estratégias: Cache-First para assets estáticos,
// Stale-While-Revalidate para conteúdo dinâmico
// ============================================================

const CACHE_NAME = 'batcaverna-v1';
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/concursos',
  '/questoes',
  '/bizus',
  '/ranking',
  '/manifest.json',
];

// ─── Install: Pre-cache assets estáticos ─────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Falha ao pré-cachear alguns assets:', err);
      });
    })
  );
  self.skipWaiting();
});

// ─── Activate: Limpar caches antigos ─────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// ─── Fetch: Estratégia inteligente ───────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requisições que não são GET
  if (request.method !== 'GET') return;

  // Ignorar chamadas de API (sempre rede)
  if (url.pathname.startsWith('/api/')) return;

  // Assets estáticos: Cache-First
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|webp|woff2?|ico)$/) ||
    url.pathname.startsWith('/_next/static/')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Páginas HTML: Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          // Fallback offline
          if (request.mode === 'navigate') {
            return caches.match('/dashboard');
          }
          return cached;
        });

      return cached || fetchPromise;
    })
  );
});
