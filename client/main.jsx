import React from 'react';
import { createRoot } from 'react-dom/client';
import { Meteor } from 'meteor/meteor';
import { BrowserRouter as Router } from 'react-router-dom';
import { App } from '/imports/ui/App';
import { NavigationProvider } from '/imports/ui/context/NavigationContext';
import { ResponsiveProvider } from '/imports/ui/context/ResponsiveContext';
import { AuthProvider } from '/imports/ui/context/AuthContext';
import './main.css';

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
          });
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
});
