import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../Icons';
import { NavigationContext } from '../../context/NavigationContext';

export const MobileTopHeader = () => {
  const { toggleMenu, unreadCount } = useContext(NavigationContext);
  const navigate = useNavigate();

  const handleNotificationClick = () => {
    navigate('/notifications');
  };

  return (
    <header className="mobile-header mobile-header-enhanced safe-area-top">
      <div className="mobile-header-left">
        <button
          onClick={toggleMenu}
          className="header-icon-button"
          aria-label="Open menu"
        >
          <Icons.menu className="hamburger-icon" />
        </button>
      </div>

      <div className="mobile-header-actions">
        <button 
          className="header-icon-button-clean notification-button-clean" 
          aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
          onClick={handleNotificationClick}
        >
          <Icons.bell />
          {unreadCount > 0 && (
            <span className="notification-badge notification-badge-enhanced">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
