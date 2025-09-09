import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icons } from '../Icons';
import { NavigationContext } from '../../context/NavigationContext';

export const MobileTopHeader = () => {
  const { toggleMenu, unreadCount } = useContext(NavigationContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNotificationClick = () => {
    navigate('/notifications');
  };

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path === '/tasks') return 'Tasks';
    if (path === '/clients') return 'Clients';
    if (path === '/profile') return 'Profile';
    if (path === '/notifications') return 'Notifications';
    if (path === '/analytics') return 'Analytics';
    if (path === '/team') return 'Team';
    if (path === '/posts') return 'Posts';
    if (path === '/add-task') return 'Add Task';
    if (path === '/add-post') return 'Add Post';
    return 'TaskFlow Pro';
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
        <h1 className="mobile-header-title">{getPageTitle()}</h1>
      </div>

      <div className="mobile-header-actions">
        <button 
          className="header-icon-button-clean notification-button-clean"
          aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
          onClick={handleNotificationClick}
          style={{ position: 'relative' }}
        >
          <Icons.bell className="notification-bell-icon" />
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
