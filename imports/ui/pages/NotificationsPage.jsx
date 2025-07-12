import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Avatar } from '../components/common/Avatar';
import { Input } from '../components/common/Input';
import { EmptyState } from '../components/common/EmptyState';
import { NotificationCard } from '../components/notifications/NotificationCard';
import { Icons } from '../components/Icons';

export const NotificationsPage = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data
  const notifications = [
    {
      id: 1,
      type: 'task_assigned',
      title: 'New task assigned',
      message: 'You have been assigned to "Create Instagram post for summer sale"',
      timestamp: '2024-01-12T14:30:00Z',
      read: false,
      priority: 'high',
      relatedUser: {
        name: 'Sarah Johnson',
        avatar: '/images/avatar1.jpg'
      },
      actionUrl: '/tasks/1'
    },
    {
      id: 2,
      type: 'comment',
      title: 'New comment on task',
      message: 'Mike Chen commented on "Facebook ad campaign setup"',
      timestamp: '2024-01-12T13:15:00Z',
      read: false,
      priority: 'medium',
      relatedUser: {
        name: 'Mike Chen',
        avatar: '/images/avatar2.jpg'
      },
      actionUrl: '/tasks/2'
    },
    {
      id: 3,
      type: 'task_completed',
      title: 'Task completed',
      message: 'Emily Davis completed "Weekly analytics report"',
      timestamp: '2024-01-12T12:00:00Z',
      read: true,
      priority: 'low',
      relatedUser: {
        name: 'Emily Davis',
        avatar: '/images/avatar3.jpg'
      },
      actionUrl: '/tasks/3'
    },
    {
      id: 4,
      type: 'deadline_approaching',
      title: 'Deadline approaching',
      message: 'Task "LinkedIn content calendar" is due tomorrow',
      timestamp: '2024-01-12T11:45:00Z',
      read: false,
      priority: 'high',
      actionUrl: '/tasks/4'
    },
    {
      id: 5,
      type: 'client_message',
      title: 'Client message',
      message: 'New message from Fashion Brand Co. regarding upcoming campaign',
      timestamp: '2024-01-12T10:30:00Z',
      read: true,
      priority: 'medium',
      relatedUser: {
        name: 'Fashion Brand Co.',
        avatar: '/images/client1.jpg'
      },
      actionUrl: '/clients/1'
    },
    {
      id: 6,
      type: 'system',
      title: 'System update',
      message: 'New features have been added to the platform',
      timestamp: '2024-01-12T09:00:00Z',
      read: true,
      priority: 'low',
      actionUrl: '/updates'
    },
    {
      id: 7,
      type: 'mention',
      title: 'You were mentioned',
      message: 'David Wilson mentioned you in a comment',
      timestamp: '2024-01-12T08:15:00Z',
      read: false,
      priority: 'medium',
      relatedUser: {
        name: 'David Wilson',
        avatar: '/images/avatar4.jpg'
      },
      actionUrl: '/tasks/4'
    },
    {
      id: 8,
      type: 'approval_required',
      title: 'Approval required',
      message: 'TikTok viral challenge content needs your approval',
      timestamp: '2024-01-12T07:30:00Z',
      read: false,
      priority: 'high',
      actionUrl: '/tasks/5'
    }
  ];

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' || 
      (filter === 'unread' && !notification.read) ||
      (filter === 'read' && notification.read) ||
      notification.type === filter;
    
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const handleNotificationClick = (notification) => {
    // Mark as read and navigate
    console.log('Navigating to:', notification.actionUrl);
    // In a real app, this would make an API call to mark as read
  };

  const handleMarkAllAsRead = () => {
    console.log('Marking all notifications as read');
    // In a real app, this would make an API call
  };

  const getNotificationStats = () => {
    const stats = {
      total: notifications.length,
      unread: notifications.filter(n => !n.read).length,
      high: notifications.filter(n => n.priority === 'high').length,
      medium: notifications.filter(n => n.priority === 'medium').length,
      low: notifications.filter(n => n.priority === 'low').length
    };
    return stats;
  };

  const stats = getNotificationStats();

  const filterOptions = [
    { value: 'all', label: 'All', count: stats.total },
    { value: 'unread', label: 'Unread', count: stats.unread },
    { value: 'read', label: 'Read', count: stats.total - stats.unread },
    { value: 'task_assigned', label: 'Tasks', count: notifications.filter(n => n.type === 'task_assigned').length },
    { value: 'comment', label: 'Comments', count: notifications.filter(n => n.type === 'comment').length },
    { value: 'deadline_approaching', label: 'Deadlines', count: notifications.filter(n => n.type === 'deadline_approaching').length }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Notifications</h1>
        <p className="text-gray-600">Stay updated with your latest activities</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-500">Total</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.unread}</div>
            <div className="text-sm text-gray-500">Unread</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.high}</div>
            <div className="text-sm text-gray-500">High Priority</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.total - stats.unread}</div>
            <div className="text-sm text-gray-500">Read</div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Icons.search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <Button
                key={option.value}
                variant={filter === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(option.value)}
                className="flex items-center gap-2"
              >
                {option.label}
                {option.count > 0 && (
                  <Badge variant="secondary" size="sm">
                    {option.count}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>
        
        {stats.unread > 0 && (
          <Button onClick={handleMarkAllAsRead} variant="outline" size="sm">
            Mark All Read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      {filteredNotifications.length > 0 ? (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onClick={() => handleNotificationClick(notification)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          illustration={React.createElement(Icons.bell, { className: "mx-auto h-12 w-12 text-gray-400" })}
          title="No notifications found"
          description={searchTerm ? 'Try adjusting your search terms' : 'You\'re all caught up!'}
          action={
            searchTerm ? (
              <Button onClick={() => setSearchTerm('')} variant="outline">
                Clear Search
              </Button>
            ) : null
          }
        />
      )}
    </div>
  );
};

