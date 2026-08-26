const CACHE_NAME = 'passmgn-cache-v2';

self.addEventListener('install', event => {
  // Ép SW mới cài đặt đè lên SW cũ ngay lập tức
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          // Xóa toàn bộ cache cũ đi để tránh lỗi kẹt giao diện HTML
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Kho mật khẩu là ứng dụng động & bảo mật, TUYỆT ĐỐI KHÔNG lấy từ Cache.
  // Luôn luôn gọi lên Server.
  event.respondWith(
    fetch(event.request).catch(() => {
      return new Response('Mất kết nối mạng (Offline mode)', {
        status: 503,
        statusText: 'Service Unavailable'
      });
    })
  );
});
