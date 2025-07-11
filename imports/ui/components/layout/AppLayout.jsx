import React from 'react';
import { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { ResponsiveContext } from '../../context/ResponsiveContext';
import { NavigationContext } from '../../context/NavigationContext';
import { MobileLayout } from './MobileLayout';
import { DesktopLayout } from './DesktopLayout';

export const AppLayout = () => {
  const { isMobileOrTablet } = useContext(ResponsiveContext);
  const navigationProps = useContext(NavigationContext);

  console.log('[AppLayout] Rendering layout, isMobileOrTablet:', isMobileOrTablet);

  return (
    <div className="app-container bg-gradient-app">
      {isMobileOrTablet ? (
        <MobileLayout>
          <Outlet context={navigationProps} />
        </MobileLayout>
      ) : (
        <DesktopLayout>
          <Outlet context={navigationProps} />
        </DesktopLayout>
      )}
    </div>
  );
};
