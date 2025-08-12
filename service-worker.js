const CACHE_NAME = 'fabify-cache';


const FILES_TO_CACHE = [
    '/',

    // html files
    '/index.html',
    '/build.html',
    '/search.html',
    '/form.html',
    '/library_search.html',

    //menifest file
    '/manifest.json',


    //images
    '/images/icons/icon-72x72.png',
    '/images/icons/icon-96x96.png',
    '/images/icons/icon-128x128.png',
    '/images/icons/icon-144x144.png',
    '/images/icons/icon-152x152.png',
    '/images/icons/icon-192x192.png',
    '/images/icons/icon-384x384.png',
    '/images/icons/icon-512x512.png',

    //favicon
    '/imgs/faviconP3.ico',

    // Javascript files
    '/scripts/changingthemes.js',
    '/scripts/P3-build.js',
    '/scripts/P3-print.js',
    '/scripts/P3-v-0-0-1.js',
    '/scripts/P3-v-0-0-2.js',
    '/scripts/search.js',
    '/scripts/form.js',
    'scripts/view-3d.js',

    '/src/scripts/P3-v-0-0-1.js',
    

    // CSS
    '/styles/dropdown-p3-wa-0-0-1.css',
    '/styles/P3-build.css',
    '/styles/P3-main.css',
    '/styles/P3-print.css',
    '/styles/P3-v0-0-1.css',
    '/styles/P3-v0-0-2.css',
    '/styles/search.css',
    '/styles/form.css',
    '/styles/library_search.css'
];



self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});



self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});


self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});
