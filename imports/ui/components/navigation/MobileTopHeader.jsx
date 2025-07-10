import React, { useContext } from 'react';
import { Icons } from '../Icons';
import { NavigationContext } from '../../context/NavigationContext';

export const MobileTopHeader = () => {
  const { toggleMenu, unreadCount } = useContext(NavigationContext);

  return (
    <header className="mobile-header safe-area-top">
      <div className="mobile-header-title">
        <button
          onClick={toggleMenu}
          className="header-icon-button"
          aria-label="Open menu"
        >
          <Icons.menu />
        </button>
        Posty
      </div>

      <div className="mobile-header-actions">
        <button className="header-icon-button" aria-label="Search">
          <Icons.search />
        </button>
        
        <button className="header-icon-button notification-button" aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}>
          <Icons.bell />
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
          )}
        </button>
      </div>
    </header>
  );
};
