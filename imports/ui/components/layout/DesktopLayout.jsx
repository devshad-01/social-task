import React from 'react';
import { DesktopNavbar } from '../navigation/DesktopNavbar';

export const DesktopLayout = ({ children }) => {
  return (
    <div className="layout-desktop">
      {/* Desktop Navigation */}
      <DesktopNavbar />

      {/* Main Content */}
      <main className="content-container desktop-content">
        {children}
      </main>
    </div>
  );
};
