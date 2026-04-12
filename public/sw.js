const CACHE_NAME = 'finansialku-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/logo.jpeg'
];

// Menyimpan file ke memori HP saat pertama kali dibuka
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Memanggil file dari memori HP saat sedang OFFLINE
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Jika file ada di memori HP, gunakan itu. Jika tidak, ambil dari internet.
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});