const CACHE = 'neocity-v3';
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

// Los reportes offline NO se manejan aquí: la cola vive en el cliente
// (services/colaOffline.js, basada en localStorage). Solo reenvía mientras
// la app esté abierta o al reabrirla; este SW ya no simula respuestas.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;   // deja pasar POST/PUT y que falle de verdad

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
