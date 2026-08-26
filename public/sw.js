const CACHE_NAME = 'passmgn-cache-v3';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => caches.delete(cache)) // Xóa SẠCH toàn bộ mọi cache cũ
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // BỎ QUA HOÀN TOÀN TẤT CẢ CÁC REQUEST
  // Trình duyệt sẽ tự động gọi trực tiếp lên Server như bình thường.
  // Tuyệt đối không can thiệp, không gây lỗi F5.
});
