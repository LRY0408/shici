// 拾词 Service Worker - 离线缓存
const CACHE_NAME = 'shici-v2';
const urlsToCache = [
    './',
    'index.html',
    'mobile.html',
    'app-mobile.js',
    'app.js',
    'vocab_data.js',
    'manifest.json',
    'icon-192.png',
    'icon-512.png',
    'welcome.jpg'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

// 使用 stale-while-revalidate 策略：先返回缓存，同时从网络更新缓存
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.match(event.request).then((cachedResponse) => {
                const fetchPromise = fetch(event.request).then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                }).catch(() => cachedResponse);
                
                return cachedResponse || fetchPromise;
            });
        })
    );
});

// 监听更新消息，收到更新后立即激活新的service worker
self.addEventListener('message', (event) => {
    if (event.data === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
