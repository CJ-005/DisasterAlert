const CACHE_NAME = 'disaster-alert-v1';
const OFFLINE_URL = '/offline';

const API_CACHE_PATTERNS = [
  '/api/trainings',
  '/api/risk-layers',
  '/api/announcements',
  '/lessons',
];

function shouldCacheApi(pathname) {
  return API_CACHE_PATTERNS.some((p) => pathname.startsWith(p) || pathname.includes(p));
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => caches.match(request))
        .then((response) => response || caches.match(OFFLINE_URL) || fetch(OFFLINE_URL))
    );
    return;
  }

  if (shouldCacheApi(url.pathname)) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        fetch(request)
          .then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          })
          .catch(() => cache.match(request))
      )
    );
    return;
  }

  event.respondWith(fetch(request));
});
