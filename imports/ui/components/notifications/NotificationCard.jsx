import React from 'react';
import { Card, CardContent } from '../common/Card';
import { Badge } from '../common/Badge';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';

export const NotificationCard = ({ 
  notification, 
  onMarkAsRead, 
  onAction,
  onDelete,
  onClick,
  highlight = false
}) => {
  const getTypeIcon = (type) => {
    switch (type) {
      case 'task_assigned':
        return (
          <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
      case 'task_due':
        return (
          <svg className="h-5 w-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'task_overdue':
        return (
          <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'task_completed':
        return (
          <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'client_added':
        return (
          <svg className="h-5 w-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case 'team_member_added':
        return (
          <svg className="h-5 w-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'task_assigned':
        return 'bg-blue-50 border-blue-100';
      case 'task_due':
        return 'bg-yellow-50 border-yellow-100';
      case 'task_overdue':
        return 'bg-red-50 border-red-100';
      case 'task_completed':
        return 'bg-green-50 border-green-100';
      case 'client_added':
        return 'bg-purple-50 border-purple-100';
      case 'team_member_added':
        return 'bg-indigo-50 border-indigo-100';
      default:
        return 'bg-gray-50 border-gray-100';
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  return (
    <Card className={`${highlight ? 'ring-2 ring-primary-500 border-primary-400' : ''} ${!notification.read ? getTypeColor(notification.type) : ''} hover:shadow-md transition-shadow`} onClick={onClick}>
      <CardContent padding="md">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {getTypeIcon(notification.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900">
                {notification.title}
              </p>
              {!notification.read && (
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
            </div>
            
            <p className="text-sm text-gray-600 mt-1">
              {notification.message}
            </p>
            
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-2">
                {notification.actor && (
                  <Avatar 
                    src={notification.actor.avatar}
                    alt={notification.actor.name}
                    size="xs"
                    fallback={notification.actor.name.charAt(0)}
                  />
                )}
                <span className="text-xs text-gray-500">
                  {formatTimeAgo(notification.createdAt)}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                {notification.actionUrl && (
                  <Button 
                    size="sm" 
                    variant="primary"
                    onClick={() => onAction?.(notification)}
                  >
                    View
                  </Button>
                )}
                
                {!notification.read && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onMarkAsRead?.(notification)}
                  >
                    Mark as read
                  </Button>
                )}
                
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => onDelete?.(notification)}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
