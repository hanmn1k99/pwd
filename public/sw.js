const CACHE_NAME = 'passmgn-cache-v1';
const urlsToCache = [
  '/',
  '/css/style.css?v=2.0.1',
  '/js/main.js',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Trả về cache nếu có, hoặc fetch network
        return response || fetch(event.request);
      })
  );
});
