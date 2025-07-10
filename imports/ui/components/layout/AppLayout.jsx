import React from 'react';
import { useContext } from 'react';
import { ResponsiveContext } from '../../context/ResponsiveContext';
import { NavigationContext } from '../../context/NavigationContext';
import { MobileLayout } from './MobileLayout';
import { DesktopLayout } from './DesktopLayout';

export const AppLayout = ({ children }) => {
  const { isMobileOrTablet } = useContext(ResponsiveContext);
  const navigationProps = useContext(NavigationContext);

  const renderChildren = () => {
    if (typeof children === 'function') {
      return children(navigationProps);
    }
    return children;
  };

  return (
    <div className="app-container bg-gradient-app">
      {isMobileOrTablet ? (
        <MobileLayout>
          {renderChildren()}
        </MobileLayout>
      ) : (
        <DesktopLayout>
          {renderChildren()}
        </DesktopLayout>
      )}
    </div>
  );
};
