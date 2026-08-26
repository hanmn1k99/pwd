const CACHE_NAME = 'passmgn-cache-v4';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => caches.delete(cache))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Chỉ can thiệp các request GET (để lách luật PWA)
  if (event.request.method !== 'GET') {
    return; // Các request POST (Login, Add, Edit, Delete) sẽ bị bỏ qua và do trình duyệt tự xử lý an toàn
  }

  // Gọi trực tiếp lên Server (Network Only)
  event.respondWith(
    fetch(event.request).catch(() => {
      return new Response('Mất kết nối mạng (Offline mode)', {
        status: 503,
        statusText: 'Service Unavailable'
      });
    })
  );
});
