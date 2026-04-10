const CACHE = 'neocity-v1';
const OFFLINE_URLS = ['/', '/reportar', '/login'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(OFFLINE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Guardar reportes offline
const PENDING_KEY = 'pending-reports';

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Si es POST a /api/incidentes y no hay internet → guardar en IndexedDB
  if (e.request.method === 'POST' && url.pathname === '/api/incidentes') {
    e.respondWith(
      fetch(e.request.clone()).catch(async () => {
        const body = await e.request.json();
        // Guardar en localStorage via postMessage
        self.clients.matchAll().then(clients => {
          clients.forEach(c => c.postMessage({
            type: 'SAVE_OFFLINE',
            payload: body
          }));
        });
        return new Response(JSON.stringify({
          ok: false,
          offline: true,
          mensaje: 'Reporte guardado offline. Se enviará cuando tengas conexión.'
        }), { headers: { 'Content-Type': 'application/json' } });
      })
    );
    return;
  }

  // Para el resto: network first, cache fallback
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
