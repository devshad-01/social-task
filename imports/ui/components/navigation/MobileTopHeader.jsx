import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Icons } from '../Icons';
import { NavigationContext } from '../../context/NavigationContext';

export const MobileTopHeader = () => {
  const { unreadCount } = useContext(NavigationContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Get current user for greeting
  const user = useTracker(() => Meteor.user(), []);

  const handleNotificationClick = () => {
    navigate('/notifications');
  };

  // Get greeting based on current route and time
  const getGreeting = () => {
    const path = location.pathname;
    
    // For dashboard, show personalized greeting
    if (path === '/') {
      const hour = new Date().getHours();
      const userName = user?.profile?.firstName || user?.username || 'there';
      
      if (hour < 12) return `Good morning, ${userName}! ☀️`;
      if (hour < 17) return `Good afternoon, ${userName}! 🌤️`;
      return `Good evening, ${userName}! 🌙`;
    }
    
    // For other pages, show page title
    if (path === '/tasks') return 'Tasks';
    if (path === '/clients') return 'Clients';
    if (path === '/profile') return 'Profile';
    if (path === '/notifications') return 'Notifications';
    if (path === '/analytics') return 'Analytics';
    if (path === '/team') return 'Team';
    if (path === '/posts') return 'Posts';
    if (path === '/add-task') return 'Add Task';
    if (path === '/add-post') return 'Add Post';
    if (path.includes('/tasks/') && path.includes('/edit')) return 'Edit Task';
    if (path.includes('/tasks/')) return 'Task Details';
    return 'Dashboard';
  };

  return (
    <header className="mobile-header mobile-header-enhanced safe-area-top">
      <div className="mobile-header-left">
        <h1 className="mobile-header-title mobile-header-greeting">{getGreeting()}</h1>
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
