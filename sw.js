const staticCacheName = 'currency-converter';
const allCaches = [
    staticCacheName,
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(staticCacheName).then((cache) => {
            return cache.addAll([
                // '/',
                '/IndexController.js',
                '/index.html',
                '/index.css',
                'https://free.currencyconverterapi.com/api/v5/countries',
                'https://free.currencyconverterapi.com/api/v5/currencies',
            ]);
        })
    );
});

self.addEventListener('activate',(event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.filter((cacheName) => {
                    return cacheName.startsWith('currency-') &&
                        !allCaches.includes(cacheName);
                }).map((cacheName) => {
                    return caches.delete(cacheName);
                })
            );
        })
    );

});

self.addEventListener('fetch', (event) => {
    let requestUrl = new URL(event.request.url);

    if (requestUrl.origin === location.origin) {
        if (requestUrl.pathname === '/') {
            event.respondWith(caches.match('/index.html'));
            return;
        }
    }
    event.respondWith(

        caches.match(event.request).then((response) => {
            if (response) return response;
            return fetch(event.request).then(function(networkResponse) {
                caches.open(staticCacheName).then((cache) => {
                    // cache.put(requestUrl, networkResponse);
                })
                return networkResponse;
            });
        })
    );
});

self.addEventListener('message', (event) => {
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
});