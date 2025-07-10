import React, { useState, useRef, useEffect, useContext } from 'react';
import { Icons } from '../Icons';
import { NavigationContext } from '../../context/NavigationContext';

// Extract icon components
const { bell: BellIcon, tasks: TasksIcon, user: UserIcon } = Icons;

export const NotificationBell = () => {
  const { notifications = [], unreadCount = 0 } = useContext(NavigationContext);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen]);

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task':
        return TasksIcon;
      case 'comment':
        return UserIcon;
      default:
        return BellIcon;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-icon relative"
        aria-label="Notifications"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-controls="notifications-dropdown"
      >
        <BellIcon className="icon icon-md" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div 
          id="notifications-dropdown" 
          className="dropdown-panel"
          role="menu"
          aria-labelledby="notifications-button"
        >
          <div className="dropdown-header">
            <div className="dropdown-header-content">
              <h3 className="dropdown-title" id="notifications-title">Notifications</h3>
              {unreadCount > 0 && (
                <button className="btn-text" aria-label="Mark all notifications as read">
                  Mark all read
                </button>
              )}
            </div>
          </div>

          <div 
            className="dropdown-body notification-list custom-scrollbar"
            aria-labelledby="notifications-title"
          >
            {notifications.length === 0 ? (
              <div className="notification-empty" aria-live="polite">
                <BellIcon className="icon icon-xl empty-icon" aria-hidden="true" />
                <p className="empty-text">No notifications yet</p>
              </div>
            ) : (
              <ul className="notification-items">
                {notifications.map((notification) => {
                  const IconComponent = getNotificationIcon(notification.type);
                  
                  return (
                    <li
                      key={notification.id}
                      className={`notification-item ${
                        !notification.read ? 'notification-unread' : ''
                      }`}
                    >
                      <button 
                        className="notification-button"
                        aria-labelledby={`notification-title-${notification.id}`}
                        aria-describedby={`notification-message-${notification.id}`}
                      >
                        <div className="notification-content">
                          <div className="notification-icon">
                            <div className={`icon-circle notification-${notification.type || 'task'}`}>
                              <IconComponent className="icon icon-sm" />
                            </div>
                          </div>
                          <div className="notification-content">
                            <p className="notification-title" id={`notification-title-${notification.id}`}>
                              {notification.title}
                            </p>
                            <p className="notification-message" id={`notification-message-${notification.id}`}>
                              {notification.message}
                            </p>
                            <p className="notification-time">
                              {formatTimeAgo(notification.timestamp)}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="unread-indicator" />
                          )}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="dropdown-footer">
              <button className="btn-text btn-full">
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
