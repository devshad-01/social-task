import React from 'react';
import { createRoot } from 'react-dom/client';
import { Meteor } from 'meteor/meteor';
import { BrowserRouter as Router } from 'react-router-dom';
import { App } from '/imports/ui/App';
import { NavigationProvider } from '/imports/ui/context/NavigationContext';
import { ResponsiveProvider } from '/imports/ui/context/ResponsiveContext';
import { AuthProvider } from '/imports/ui/context/AuthContext';
import { WebPushService } from '/imports/api/notifications/webPush';
import './main.css';
// import './test-notifications.js'; // Removed to fix module not found error

Meteor.startup(() => {
  const container = document.getElementById('react-target');
  const root = createRoot(container);
  root.render(
    <Router>
      <AuthProvider>
        <ResponsiveProvider>
          <NavigationProvider>
            <App />
          </NavigationProvider>
        </ResponsiveProvider>
      </AuthProvider>
    </Router>
  );

  // Register service worker for PWA support
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            console.log('New service worker found');
            
            newWorker.addEventListener('statechange', () => {
              console.log('Service worker state changed:', newWorker.state);
              
              if (newWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  console.log('New content available, please refresh.');
                  // Optionally show update available notification
                  if (confirm('New version available! Refresh to update?')) {
                    window.location.reload();
                  }
                } else {
                  console.log('Content cached for offline use.');
                }
              }
            });
          });
          
          // Listen for service worker messages
          navigator.serviceWorker.addEventListener('message', (event) => {
            console.log('Message from SW:', event.data);
            
            // Handle navigation messages from service worker
            if (event.data && event.data.type === 'NAVIGATE' && event.data.url) {
              console.log('Navigating to:', event.data.url);
              window.location.href = event.data.url;
            }
          });
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }

  // Request notification permission on site visit if not already set
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        // Optionally, register for push here
        if (WebPushService && WebPushService.subscribe) {
          WebPushService.subscribe();
        }
      }
    });
  }

  // Handle notification clicks for web push
  window.addEventListener('notification-click', (event) => {
    const { actionUrl, data } = event.detail;
    if (actionUrl) {
      // Use window.location for navigation since we're outside React Router context
      window.location.href = actionUrl;
    } else if (data && data.taskId) {
      // Fallback for task notifications
      window.location.href = `/tasks/${data.taskId}`;
    }
  });
});
