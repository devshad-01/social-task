const CACHE_VERSION = 'v6';
const STATIC_CACHE = `posty-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `posty-dynamic-${CACHE_VERSION}`;

const STATIC_FILES = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  self.skipWaiting(); // Force activation of new service worker
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache files', error);
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (![STATIC_CACHE, DYNAMIC_CACHE].includes(cacheName)) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests over HTTP/HTTPS
  if (request.method !== 'GET' || !(request.url.startsWith('http://') || request.url.startsWith('https://'))) {
    return;
  }

  // Always fetch latest index.html for navigation (SPA fix)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            return caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, response.clone());
              return response;
            });
          }
          return response;
        })
        .catch(() => caches.match('/'))
    );
    return;
  }

  // Otherwise, cache-first for static assets
  event.respondWith(
    caches.match(request).then((response) => {
      return response || fetch(request).then((fetchRes) => {
        if (fetchRes.ok) {
          return caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, fetchRes.clone());
            return fetchRes;
          });
        }
        return fetchRes;
      });
    })
  );
});

// Message handler for communication with main app
self.addEventListener('message', (event) => {
  console.log('[ServiceWorker] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_VERSION });
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }).then(() => {
      event.ports[0].postMessage({ cleared: true });
    });
  }
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('[ServiceWorker] Push received');
  
  const options = {
    body: event.data ? event.data.text() : 'You have a new notification!',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'explore',
        title: 'Open',
        icon: '/icons/icon-192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/icon-192.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Posty', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[ServiceWorker] Notification click received');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // Just close
    return;
  } else {
    // Default action
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background sync event
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Background sync', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle background sync
      console.log('[ServiceWorker] Background sync completed')
    );
  }
});
