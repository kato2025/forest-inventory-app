const CACHE_NAME = 'forest-inventory-v1.0.0';
const urlsToCache = [
'./',
'./index.html',
'./js/app.js',
'./js/ui.js',
'./js/calculations.js',
'./js/utils.js',
'./styles/main.css',
'./styles/components.css',
'./styles/responsive.css',
'./styles/print.css',
'./manifest.json',
'./drnamuene.jpg',
'./icons/icon-72x72.png',
'./icons/icon-96x96.png',
'./icons/icon-128x128.png',
'./icons/icon-144x144.png',
'./icons/icon-152x152.png',
'./icons/icon-192x192.png',
'./icons/icon-384x384.png',
'./icons/icon-512x512.png'
];
// Install Service Worker
self.addEventListener('install', event => {
event.waitUntil(
caches.open(CACHE_NAME)
      .then(cache => {
console.log('Opened cache');
return cache.addAll(urlsToCache);
      })
      .catch(err => {
console.log('Cache failed:', err);
      })
  );
self.skipWaiting();
});
// Fetch from cache
self.addEventListener('fetch', event => {
event.respondWith(
caches.match(event.request)
      .then(response => {
// Cache hit - return response
if (response) {
return response;
        }
// Clone the request
const fetchRequest = event.request.clone();
return fetch(fetchRequest).then(response => {
// Check if valid response
if (!response || response.status !== 200 || response.type !== 'basic') {
return response;
          }
// Clone the response
const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
return response;
        });
      })
      .catch(() => {
// Return offline page if available
return caches.match('./index.html');
      })
  );
});
// Activate Service Worker
self.addEventListener('activate', event => {
const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
return Promise.all(
        cacheNames.map(cacheName => {
if (cacheWhitelist.indexOf(cacheName) === -1) {
return caches.delete(cacheName);
          }
        })
      );
    })
  );
return self.clients.claim();
});