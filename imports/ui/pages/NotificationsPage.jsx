import React from 'react';
import { Icons } from '../components/Icons';

export const NotificationsPage = () => {
  const mockNotifications = [
    {
      id: '1',
      title: 'New task assigned',
      message: 'You have been assigned a new social media task',
      type: 'task',
      read: false,
      timestamp: new Date(),
    },
    {
      id: '2',
      title: 'Comment added',
      message: 'Sarah commented on your task',
      type: 'comment',
      read: false,
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
    },
    {
      id: '3',
      title: 'Task completed',
      message: 'Facebook ad campaign task has been marked as complete',
      type: 'completion',
      read: true,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    }
  ];

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">Stay updated with your latest activities</p>
        </div>
        <button className="button-secondary">
          <Icons.check className="button-icon" />
          Mark all as read
        </button>
      </header>

      <div className="notification-list">
        {mockNotifications.length > 0 ? (
          mockNotifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`notification-card ${!notification.read ? 'notification-unread' : ''}`}
            >
              <div className={`notification-icon notification-${notification.type}`}>
                {notification.type === 'task' && <Icons.tasks />}
                {notification.type === 'comment' && <Icons.user />}
                {notification.type === 'completion' && <Icons.check />}
              </div>
              <div className="notification-content">
                <h3 className="notification-title">{notification.title}</h3>
                <p className="notification-message">{notification.message}</p>
                <p className="notification-time">
                  {new Date(notification.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
              </div>
              {!notification.read && (
                <div className="notification-badge"></div>
              )}
            </div>
          ))
        ) : (
          <div className="empty-state">
            <Icons.bell className="empty-icon" />
            <p className="empty-text">No notifications yet</p>
          </div>
        )}
      </div>
    </div>
  );
};
