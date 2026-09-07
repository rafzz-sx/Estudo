// ============================================================
// BatCaverna — Service Worker
//
// Estratégias:
//   • assets estáticos (/_next/static, imagens, fontes): Cache-First.
//     São imutáveis por nome (o Next põe hash no arquivo).
//   • páginas HTML: NETWORK-FIRST, com cache só como reserva offline.
//   • /api/*: nunca passa por aqui.
//
// Por que mudou (07/09/2026):
//   A versão anterior servia HTML com stale-while-revalidate — devolvia a
//   cópia em cache ANTES de consultar a rede — e o nome do cache era fixo
//   ('batcaverna-v1'), nunca invalidado entre deploys. Dois problemas:
//     1. depois de um deploy, o HTML antigo em cache apontava para chunks
//        /_next/static/... que já não existiam → tela branca até limpar o
//        cache na mão;
//     2. páginas autenticadas (/perfil, /admin, /chat) ficavam em cache e
//        eram servidas do disco para quem abrisse o navegador em seguida,
//        mesmo depois do logout.
//   Também pré-cacheava rotas que exigem login (/dashboard, /questoes...),
//   o que gravava a página de redirecionamento sob a URL da rota.
// ============================================================

// Mude este nome a cada deploy que altere o service worker. O handler de
// `activate` apaga todos os caches com nome diferente — é isso que expurga
// o 'batcaverna-v1' da versão anterior nos navegadores dos alunos.
const CACHE_NAME = 'batcaverna-v2';

// Só o que é PÚBLICO e estável. Rota que exige login não entra aqui.
const STATIC_ASSETS = ['/', '/manifest.json'];

const EXT_ESTATICA = /\.(js|css|png|jpg|jpeg|gif|svg|webp|woff2?|ico)$/;

// ─── Install: pré-cache do mínimo público ───────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Falha ao pré-cachear:', err);
      })
    )
  );
  self.skipWaiting();
});

// ─── Activate: apaga caches de versões anteriores ───────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((nomes) =>
        Promise.all(
          nomes.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
        )
      )
  );
  self.clients.claim();
});

// ─── Mensagens da página ─────────────────────────────────────
// O logout manda 'LIMPAR_CACHE': nada da sessão que acabou pode ficar
// servível para a próxima pessoa que abrir o navegador.
self.addEventListener('message', (event) => {
  if (event.data && event.data.tipo === 'LIMPAR_CACHE') {
    event.waitUntil(
      caches.keys().then((nomes) => Promise.all(nomes.map((n) => caches.delete(n))))
    );
  }
});

// ─── Fetch ───────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;

  // Assets com hash no nome: Cache-First é seguro e rápido.
  if (url.pathname.startsWith('/_next/static/') || EXT_ESTATICA.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((resp) => {
            if (resp.ok) {
              const clone = resp.clone();
              caches.open(CACHE_NAME).then((c) => c.put(request, clone));
            }
            return resp;
          })
      )
    );
    return;
  }

  // HTML: rede primeiro. Só cai no cache quando a rede falha — e só para
  // páginas públicas, que são as únicas gravadas (ver abaixo).
  event.respondWith(
    fetch(request)
      .then((resp) => {
        // Grava só o que é público. Página autenticada não entra no cache:
        // o proxy redireciona para /auth quando não há sessão, e a cópia
        // gravada seria justamente a página de outra pessoa.
        if (resp.ok && ehPublica(url.pathname)) {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then((c) => c.put(request, clone));
        }
        return resp;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        // Reserva offline: a landing pública, nunca uma tela logada.
        if (request.mode === 'navigate') {
          const home = await caches.match('/');
          if (home) return home;
        }
        return new Response('Sem conexão.', {
          status: 503,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      })
  );
});

function ehPublica(pathname) {
  return (
    pathname === '/' ||
    pathname === '/manifest.json' ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/contato') ||
    pathname.startsWith('/privacidade') ||
    pathname.startsWith('/termos')
  );
}
