import React from 'react';
import { createRoot } from 'react-dom/client';
import { Meteor } from 'meteor/meteor';
import { BrowserRouter as Router } from 'react-router-dom';
import { App } from '/imports/ui/App';
import { NavigationProvider } from '/imports/ui/context/NavigationContext';
import { ResponsiveProvider } from '/imports/ui/context/ResponsiveContext';
import './main.css';

Meteor.startup(() => {
  const container = document.getElementById('react-target');
  const root = createRoot(container);
  root.render(
    <Router>
      <ResponsiveProvider>
        <NavigationProvider>
          <App />
        </NavigationProvider>
      </ResponsiveProvider>
    </Router>
  );
});
