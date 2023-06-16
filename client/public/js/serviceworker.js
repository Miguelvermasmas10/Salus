// Define a cache name for the static assets
const cacheName = 'static-cache-v1';

// Define an array of files to cache
const filesToCache = [
  "jquery.min.js",
  "bootstrap.min.js"
];

// Listen for the install event and cache the files
self.addEventListener('install', event => {
  console.log('Service worker installing...');
  event.waitUntil(
    caches.open(cacheName)
      .then(cache => {
        console.log('Service worker caching files...');
        return cache.addAll(filesToCache);
      })
  );
});

// Listen for the activate event and delete any old caches
self.addEventListener('activate', event => {
  console.log('Service worker activating...');
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.filter(cache => cache !== cacheName)
            .map(cache => {
              console.log('Service worker deleting old cache...');
              return caches.delete(cache);
            })
        );
      })
  );
});

// Listen for the fetch event and serve the cached files or fetch from the network
self.addEventListener('fetch', event => {
  console.log('Service worker fetching...');
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          console.log('Service worker serving from cache...');
          return response;
        }
        console.log('Service worker serving from network...');
        return fetch(event.request);
      })
  );
});