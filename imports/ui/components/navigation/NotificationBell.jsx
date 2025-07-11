import React, { useContext } from 'react';
import { NavigationContext } from '../../context/NavigationContext';
import { NotificationBell as NotificationBellComponent } from '../notifications/NotificationBell';

export const NotificationBell = () => {
  const { notifications = [] } = useContext(NavigationContext);

  const handleMarkAllAsRead = () => {
    // This will be connected to the API later
    console.log('Mark all notifications as read');
  };

  const handleNotificationClick = (notification) => {
    // This will be connected to the navigation later
    console.log('Notification clicked:', notification);
  };

  return (
    <NotificationBellComponent
      notifications={notifications}
      onMarkAllAsRead={handleMarkAllAsRead}
      onNotificationClick={handleNotificationClick}
    />
  );
};
