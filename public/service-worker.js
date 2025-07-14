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
  
  // Handle different message types
  if (!event.data || !event.data.type) {
    return;
  }
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }
  
  if (event.data.type === 'GET_VERSION') {
    try {
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({ version: CACHE_VERSION });
      }
    } catch (error) {
      console.error('[ServiceWorker] Error sending version:', error);
    }
    return;
  }
  
  if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }).then(() => {
        try {
          if (event.ports && event.ports[0]) {
            event.ports[0].postMessage({ cleared: true });
          }
        } catch (error) {
          console.error('[ServiceWorker] Error sending clear cache response:', error);
        }
      }).catch(error => {
        console.error('[ServiceWorker] Error clearing cache:', error);
        try {
          if (event.ports && event.ports[0]) {
            event.ports[0].postMessage({ error: error.message });
          }
        } catch (postError) {
          console.error('[ServiceWorker] Error sending error response:', postError);
        }
      })
    );
    return;
  }
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('[ServiceWorker] Push received', event);
  
  let data = {};
  let notificationTitle = 'Posty';
  
  try {
    if (event.data) {
      // Try to parse as JSON first
      try {
        data = event.data.json();
      } catch (jsonError) {
        // If JSON parsing fails, try as text
        const textData = event.data.text();
        data = { body: textData };
      }
    }
  } catch (error) {
    console.error('[ServiceWorker] Error parsing push data:', error);
    data = { body: 'You have a new notification!' };
  }
  
  // Extract title if present
  if (data.title) {
    notificationTitle = data.title;
  }
  
  // Set up notification options
  const options = {
    body: data.body || data.message || 'You have a new notification!',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    vibrate: [100, 50, 100],
    tag: data.tag || 'default',
    renotify: false,
    requireInteraction: false,
    data: {
      url: data.url || '/',
      timestamp: Date.now(),
      ...data
    },
    actions: [
      {
        action: 'open',
        title: 'Open',
        icon: '/icons/icon-96.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/icon-72.png'
      }
    ]
  };
  
  // Show the notification
  const showNotification = async () => {
    try {
      await self.registration.showNotification(notificationTitle, options);
      console.log('[ServiceWorker] Notification shown successfully');
    } catch (error) {
      console.error('[ServiceWorker] Error showing notification:', error);
    }
  };
  
  event.waitUntil(showNotification());
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[ServiceWorker] Notification click received', event);
  
  // Close the notification
  event.notification.close();
  
  // Get notification data
  const data = event.notification.data || {};
  let url = '/';
  
  // Determine the URL to open based on notification data
  if (data.type && data.type.startsWith('task_') && data.taskId) {
    url = `/tasks/${data.taskId}`;
    console.log('[ServiceWorker] Opening task URL:', url);
  } else if (data.actionUrl) {
    url = data.actionUrl;
    console.log('[ServiceWorker] Opening action URL:', url);
  } else if (data._id) {
    // Fallback: open notifications page and highlight the notification
    url = `/notifications/${data._id}`;
    console.log('[ServiceWorker] Opening notification URL:', url);
  } else if (data.url) {
    url = data.url;
    console.log('[ServiceWorker] Opening data URL:', url);
  }
  
  // Handle the click action
  const handleClick = async () => {
    try {
      // Try to focus an existing window first
      const windowClients = await clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      });
      
      // If we have an existing window, focus it and navigate
      if (windowClients.length > 0) {
        const client = windowClients[0];
        await client.focus();
        if (client.navigate) {
          await client.navigate(url);
        } else {
          // Fallback: send message to client to navigate
          client.postMessage({
            type: 'NAVIGATE',
            url: url
          });
        }
        return;
      }
      
      // No existing window, open a new one
      await clients.openWindow(url);
    } catch (error) {
      console.error('[ServiceWorker] Error handling notification click:', error);
      // Fallback: just try to open the window
      try {
        await clients.openWindow(url);
      } catch (fallbackError) {
        console.error('[ServiceWorker] Fallback failed:', fallbackError);
      }
    }
  };
  
  // Use waitUntil to ensure the event doesn't finish before our async work
  event.waitUntil(handleClick());
});

// Notification action handler (for notification action buttons)
self.addEventListener('notificationactionclick', (event) => {
  console.log('[ServiceWorker] Notification action clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'open') {
    // Same logic as regular notification click
    const data = event.notification.data || {};
    let url = '/';
    
    if (data.type && data.type.startsWith('task_') && data.taskId) {
      url = `/tasks/${data.taskId}`;
    } else if (data.actionUrl) {
      url = data.actionUrl;
    } else if (data._id) {
      url = `/notifications/${data._id}`;
    } else if (data.url) {
      url = data.url;
    }
    
    event.waitUntil(
      clients.openWindow(url)
    );
  } else if (event.action === 'close') {
    // Just close the notification (already done above)
    console.log('[ServiceWorker] Notification dismissed');
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

// Add error handling and debugging
self.addEventListener('error', (event) => {
  console.error('[ServiceWorker] Error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('[ServiceWorker] Unhandled promise rejection:', event.reason);
  event.preventDefault();
});
