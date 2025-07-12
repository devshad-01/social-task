import React from 'react';
import { MobileTopHeader } from '../navigation/MobileTopHeader';
import { BottomTabBar } from '../navigation/BottomTabBar';
import { MobileSidebar } from '../navigation/MobileSidebar';

export const MobileLayout = ({ children }) => {
  return (
    <div className="layout-mobile">
      {/* Mobile Top Header */}
      <MobileTopHeader />

      {/* Mobile Sidebar */}
      <MobileSidebar />

      {/* Main Content */}
      <main className="content-container mobile-content mobile-content-enhanced">
        {children}
      </main>

      {/* Bottom Tab Navigation */}
      <BottomTabBar />
    </div>
  );
};
