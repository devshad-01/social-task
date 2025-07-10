import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '/imports/ui/App';
import ThemePalettePage from '/imports/ui/ThemePalettePage';
import './main.css';

// Simple dev/test route: render ThemePalettePage at /test, otherwise render App
const path = window.location.pathname;

Meteor.startup(() => {
  const container = document.getElementById('react-target');
  const root = createRoot(container);
  if (path === '/test') {
    root.render(<ThemePalettePage />);
  } else {
    root.render(<App />);
  }
});
