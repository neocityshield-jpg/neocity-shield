const CACHE = 'neocity-v2';
const OFFLINE_URLS = [
  '/', '/reportar', '/login', '/perfil', '/examenes', '/examenes-sst',
  '/panel-sst', '/dashboard', '/mapa', '/notificaciones'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache =>
      // Si alguna URL falla al precachear, no se cae toda la instalación
      Promise.allSettled(OFFLINE_URLS.map(url => cache.add(url)))
    )
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

  // Para el resto: network first, cache fallback, y si tampoco hay caché
  // para esa ruta exacta, cae al "app shell" (la página raíz) para que
  // React Router pueda tomar el control en vez de dejar la pantalla en blanco.
  e.respondWith(
    fetch(e.request).catch(async () => {
      const cachedResponse = await caches.match(e.request);
      if (cachedResponse) return cachedResponse;

      const shell = await caches.match('/');
      if (shell) return shell;

      return new Response('Sin conexión y sin datos guardados.', {
        status: 503,
        headers: { 'Content-Type': 'text/plain' }
      });
    })
  );
});
