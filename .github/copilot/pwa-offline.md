# 📱 PWA Configuration & Offline Support

## Progressive Web App Setup

### PWA Manifest Configuration

#### public/manifest.json
```json
{
  "name": "Social Task Manager",
  "short_name": "STasks",
  "description": "Social Media & Task Management PWA for marketing agencies",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "theme_color": "#3b82f6",
  "background_color": "#ffffff",
  "scope": "/",
  "lang": "en-US",
  "categories": ["productivity", "business", "social"],
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ],
  "shortcuts": [
    {
      "name": "Create Task",
      "short_name": "New Task",
      "description": "Create a new social media task",
      "url": "/tasks/create",
      "icons": [
        {
          "src": "/icons/shortcut-create.png",
          "sizes": "96x96"
        }
      ]
    },
    {
      "name": "Dashboard",
      "short_name": "Dashboard",
      "description": "View task dashboard",
      "url": "/dashboard",
      "icons": [
        {
          "src": "/icons/shortcut-dashboard.png",
          "sizes": "96x96"
        }
      ]
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/mobile-dashboard.png",
      "sizes": "375x667",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Mobile Dashboard"
    },
    {
      "src": "/screenshots/desktop-dashboard.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide",
      "label": "Desktop Dashboard"
    }
  ]
}
```

### Service Worker Implementation

#### public/sw.js
```javascript
// Service Worker for Social Task Manager PWA
const CACHE_NAME = 'social-task-manager-v1.0.0';
const STATIC_CACHE = `${CACHE_NAME}-static`;
const DYNAMIC_CACHE = `${CACHE_NAME}-dynamic`;
const API_CACHE = `${CACHE_NAME}-api`;

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/manifest.json',
  '/offline.html',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/tasks',
  '/api/clients',
  '/api/dashboard'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheName.startsWith(CACHE_NAME)) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle navigation requests (app shell)
  if (request.mode === 'navigate') {
    event.respondWith(
      networkFirstThenCache(request)
        .catch(() => caches.match('/offline.html'))
    );
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/sockjs/')) {
    event.respondWith(
      networkFirstThenCache(request, API_CACHE)
    );
    return;
  }

  // Handle static assets
  if (request.destination === 'script' || 
      request.destination === 'style' || 
      request.destination === 'image') {
    event.respondWith(
      cacheFirstThenNetwork(request, STATIC_CACHE)
    );
    return;
  }

  // Default: network first
  event.respondWith(
    networkFirstThenCache(request, DYNAMIC_CACHE)
  );
});

// Background sync for task updates
self.addEventListener('sync', (event) => {
  if (event.tag === 'task-sync') {
    event.waitUntil(syncTaskUpdates());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New task assigned',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    tag: 'task-notification',
    actions: [
      {
        action: 'view',
        title: 'View Task',
        icon: '/icons/action-view.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/action-dismiss.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Social Task Manager', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  }
});

// Caching strategies
async function networkFirstThenCache(request, cacheName = DYNAMIC_CACHE) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

async function cacheFirstThenNetwork(request, cacheName = STATIC_CACHE) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    throw error;
  }
}

// Sync task updates when back online
async function syncTaskUpdates() {
  try {
    const cache = await caches.open(API_CACHE);
    const requests = await cache.keys();
    
    // Find pending task updates
    const taskUpdates = requests.filter(req => 
      req.url.includes('/api/tasks') && req.method === 'POST'
    );
    
    // Retry failed updates
    for (const request of taskUpdates) {
      try {
        await fetch(request);
        await cache.delete(request);
      } catch (error) {
        console.log('Sync failed for:', request.url);
      }
    }
  } catch (error) {
    console.log('Background sync failed:', error);
  }
}
```

### Offline Fallback Page

#### public/offline.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Offline - Social Task Manager</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            text-align: center;
            padding: 20px;
        }
        
        .container {
            max-width: 400px;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px 30px;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .icon {
            width: 80px;
            height: 80px;
            margin: 0 auto 30px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
        }
        
        h1 {
            font-size: 28px;
            margin-bottom: 15px;
            font-weight: 600;
        }
        
        p {
            font-size: 16px;
            line-height: 1.6;
            opacity: 0.9;
            margin-bottom: 30px;
        }
        
        .retry-btn {
            background: white;
            color: #667eea;
            border: none;
            padding: 12px 30px;
            border-radius: 25px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s;
        }
        
        .retry-btn:hover {
            transform: translateY(-2px);
        }
        
        .features {
            margin-top: 30px;
            text-align: left;
        }
        
        .feature {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
            font-size: 14px;
            opacity: 0.8;
        }
        
        .feature::before {
            content: "✓";
            width: 20px;
            height: 20px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">📱</div>
        <h1>You're Offline</h1>
        <p>No internet connection detected. Don't worry - you can still view your cached tasks and create new ones that will sync when you're back online.</p>
        
        <button class="retry-btn" onclick="window.location.reload()">
            Try Again
        </button>
        
        <div class="features">
            <div class="feature">View cached tasks and client data</div>
            <div class="feature">Create tasks in offline mode</div>
            <div class="feature">Auto-sync when connection returns</div>
        </div>
    </div>

    <script>
        // Check for connection periodically
        setInterval(() => {
            if (navigator.onLine) {
                window.location.reload();
            }
        }, 5000);
        
        // Listen for online event
        window.addEventListener('online', () => {
            window.location.reload();
        });
    </script>
</body>
</html>
```

## React PWA Integration

### PWA Detection & Install Prompt

#### PWAInstaller.jsx
```javascript
// imports/ui/components/pwa/PWAInstaller.jsx
import React, { useState, useEffect } from 'react';

export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || 
        window.navigator.standalone) {
      setIsInstalled(true);
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show install prompt after user has used app for a bit
      setTimeout(() => {
        setShowInstallPrompt(true);
      }, 30000); // 30 seconds
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowInstallPrompt(false);
    }
    
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    
    // Don't show again for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if dismissed in this session
  if (sessionStorage.getItem('pwa-install-dismissed') || isInstalled) {
    return null;
  }

  if (!showInstallPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 lg:left-auto lg:right-4 lg:w-80">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900">
              Install Social Task Manager
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Add to your home screen for quick access and offline use
            </p>
            
            <div className="flex space-x-2 mt-3">
              <button
                onClick={handleInstallClick}
                className="btn-primary text-xs px-3 py-1"
              >
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1"
              >
                Not now
              </button>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Connection Status Monitor

#### ConnectionStatus.jsx
```javascript
// imports/ui/components/pwa/ConnectionStatus.jsx
import React, { useState, useEffect } from 'react';

export function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineToast, setShowOfflineToast] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineToast(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineToast(true);
      
      // Hide toast after 5 seconds
      setTimeout(() => {
        setShowOfflineToast(false);
      }, 5000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showOfflineToast && isOnline) {
    return null;
  }

  return (
    <>
      {/* Persistent offline indicator */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-warning-500 text-white text-center py-2 text-sm font-medium z-50">
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span>You're offline - working in cached mode</span>
          </div>
        </div>
      )}

      {/* Offline toast notification */}
      {showOfflineToast && (
        <div className="fixed top-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm z-50">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-warning-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900">
                Connection Lost
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Don't worry! You can still view cached content and create tasks offline.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

### Offline Data Sync

#### OfflineSync.jsx
```javascript
// imports/ui/hooks/useOfflineSync.js
import { useState, useEffect } from 'react';

export function useOfflineSync() {
  const [pendingActions, setPendingActions] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Load pending actions from localStorage
    const stored = localStorage.getItem('pending-actions');
    if (stored) {
      try {
        setPendingActions(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to load pending actions:', error);
      }
    }

    // Listen for online event to trigger sync
    const handleOnline = () => {
      if (pendingActions.length > 0) {
        syncPendingActions();
      }
    };

    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [pendingActions]);

  const addPendingAction = (action) => {
    const newActions = [...pendingActions, {
      ...action,
      id: Date.now(),
      timestamp: new Date().toISOString()
    }];
    
    setPendingActions(newActions);
    localStorage.setItem('pending-actions', JSON.stringify(newActions));
  };

  const syncPendingActions = async () => {
    if (isSyncing || !navigator.onLine) return;
    
    setIsSyncing(true);
    
    const successful = [];
    const failed = [];
    
    for (const action of pendingActions) {
      try {
        await new Promise((resolve, reject) => {
          Meteor.call(action.method, ...action.params, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          });
        });
        
        successful.push(action.id);
      } catch (error) {
        console.error(`Failed to sync action ${action.id}:`, error);
        failed.push(action.id);
      }
    }
    
    // Remove successful actions
    const remainingActions = pendingActions.filter(
      action => !successful.includes(action.id)
    );
    
    setPendingActions(remainingActions);
    localStorage.setItem('pending-actions', JSON.stringify(remainingActions));
    
    setIsSyncing(false);
    
    return {
      synced: successful.length,
      failed: failed.length
    };
  };

  const clearPendingActions = () => {
    setPendingActions([]);
    localStorage.removeItem('pending-actions');
  };

  return {
    pendingActions,
    isSyncing,
    addPendingAction,
    syncPendingActions,
    clearPendingActions,
    hasPendingActions: pendingActions.length > 0
  };
}
```

### Push Notifications Setup

#### server/push-notifications.js
```javascript
// server/push-notifications.js
import webpush from 'web-push';

// Configure VAPID keys (generate with: npx web-push generate-vapid-keys)
webpush.setVapidDetails(
  'mailto:your-email@domain.com',
  Meteor.settings.private.vapid.publicKey,
  Meteor.settings.private.vapid.privateKey
);

Meteor.methods({
  'notifications.subscribe'(subscription) {
    check(subscription, {
      endpoint: String,
      keys: {
        p256dh: String,
        auth: String
      }
    });
    
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    
    // Store subscription in user profile
    Meteor.users.update(this.userId, {
      $set: { 'profile.pushSubscription': subscription }
    });
    
    return true;
  },
  
  'notifications.sendTaskAssignment'(userId, taskData) {
    check(userId, String);
    check(taskData, Object);
    
    const user = Meteor.users.findOne(userId);
    if (!user?.profile?.pushSubscription) {
      return false;
    }
    
    const payload = JSON.stringify({
      title: 'New Task Assigned',
      body: `Task: ${taskData.title}`,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: 'task-assignment',
      data: {
        taskId: taskData._id,
        url: `/tasks/${taskData._id}`
      }
    });
    
    try {
      return webpush.sendNotification(
        user.profile.pushSubscription,
        payload
      );
    } catch (error) {
      console.error('Push notification failed:', error);
      return false;
    }
  }
});
```

This comprehensive PWA setup provides offline functionality, install prompts, connection monitoring, background sync, and push notifications for your Social Media & Task Management app.
