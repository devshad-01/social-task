import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../common/Badge';
import { Icons } from '../Icons';

export const NotificationBell = ({ notifications = [], className = '' }) => {
  const navigate = useNavigate();
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleBellClick = () => {
    navigate('/notifications');
  };

  return (
    <button
      onClick={handleBellClick}
      className={`notification-bell-btn notification-bell-desktop ${className}`}
      aria-label="Notifications"
      tabIndex={0}
      type="button"
    >
      {/* Use bell icon from Icons */}
      <Icons.bell className="notification-bell-icon" aria-hidden="true" />
      {/* Fallback placeholder icon (if SVG fails to load, will show as emoji) */}
      <span style={{ display: 'none' }} role="img" aria-label="bell">🔔</span>
      {/* Visually hidden label for screen readers */}
      <span style={{ position: 'absolute', left: '-9999px' }}>Notifications</span>
      {unreadCount > 0 && (
        <span className="notification-badge">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
};
