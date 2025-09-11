import React, { useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Avatar } from '../components/common/Avatar';
import { Input } from '../components/common/Input';
import { EmptyState } from '../components/common/EmptyState';
import { NotificationCard } from '../components/notifications/NotificationCard';
import { NavigationContext } from '../context/NavigationContext';
import { ResponsiveContext } from '../context/ResponsiveContext';
import { InAppNotifications } from '../../api/notifications/InAppNotifications';
import { Icons } from '../components/Icons';

export const NotificationsPage = () => {
  const { id: highlightId } = useParams();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const { markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } = useContext(NavigationContext);
  const { isMobileOrTablet } = useContext(ResponsiveContext);

  // Track notifications with Meteor's reactive data
  const { notifications, unreadCount, loading } = useTracker(() => {
    const handle = Meteor.subscribe('inapp.notifications.user', 100); // Updated subscription name
    const notifications = InAppNotifications.find({}, { 
      sort: { createdAt: -1 } 
    }).fetch();
    const unreadCount = InAppNotifications.find({ read: false }).count();
    
    return {
      notifications,
      unreadCount,
      loading: !handle.ready()
    };
  }, []);

  // If loading, show loading state
  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' || 
      (filter === 'unread' && !notification.read) ||
      (filter === 'read' && notification.read) ||
      notification.type === filter;
    
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read if not already read
      if (!notification.read) {
        await markNotificationAsRead(notification._id);
      }
      
      // Check if notification is task-related and has a taskId
      if (notification.type && notification.type.startsWith('task_') && notification.data?.taskId) {
        // Redirect to task details page
        navigate(`/tasks/${notification.data.taskId}`);
      } else if (notification.actionUrl) {
        // If actionUrl is present, redirect to it
        window.open(notification.actionUrl, '_self');
      } else {
        // Otherwise, highlight/show the notification detail
        setSelectedNotification(notification);
        navigate(`/notifications/${notification._id}`);
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      console.log('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
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
      {!isMobileOrTablet && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Notifications</h1>
          <p className="text-gray-600">Stay updated with your latest activities</p>
        </div>
      )}

      {/* Stats Overview - Desktop Only */}
      {!isMobileOrTablet && (
        <div className="grid gap-4 mb-6 grid-cols-2 md:grid-cols-4">
          <Card className="p-4">
            <div className="text-center">
              <div className="font-bold text-blue-600 text-2xl">{stats.total}</div>
              <div className="text-gray-500 text-sm">Total</div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <div className="font-bold text-red-600 text-2xl">{stats.unread}</div>
              <div className="text-gray-500 text-sm">Unread</div>
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
      )}

      {/* Mobile: Simple header with mark all read */}
      {isMobileOrTablet && stats.unread > 0 && (
        <div className="flex justify-end mb-3">
          <Button 
            onClick={handleMarkAllAsRead}
            variant="primary"
            size="sm"
            className="text-sm"
          >
            Mark all as read
          </Button>
        </div>
      )}

      {/* Search and Filters - Desktop Only */}
      {!isMobileOrTablet && (
        <div className="mb-6 flex flex-col gap-4 justify-between sm:flex-row items-start sm:items-center">
          <div className="flex flex-col gap-4 flex-1 sm:flex-row">
            <div className="relative flex-1 max-w-sm">
              <Input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {filterOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={filter === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(option.value)}
                  className="flex items-center gap-2"
                >
                  {option.label}
                  <Badge variant="secondary" size="sm">
                    {option.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
          
          <Button 
            onClick={handleMarkAllAsRead}
            variant="outline"
            size="sm"
            disabled={stats.unread === 0}
            className="flex items-center gap-2"
          >
            <Icons.check className="h-4 w-4" />
            Mark All Read
          </Button>
        </div>
      )}

      {/* Notifications List */}
      {filteredNotifications.length > 0 ? (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <NotificationCard
              key={notification._id}
              notification={notification}
              onClick={() => handleNotificationClick(notification)}
              onMarkAsRead={(notif) => markNotificationAsRead(notif._id)}
              onDelete={(notif) => deleteNotification(notif._id)}
              highlight={highlightId === notification._id}
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
      {/* Optional: Render detail view if selectedNotification and no actionUrl */}
      {selectedNotification && !selectedNotification.actionUrl && (
        <div className="mt-8 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-xl font-bold mb-2">{selectedNotification.title}</h2>
          <p className="mb-2 text-gray-700">{selectedNotification.message}</p>
          <div className="text-sm text-gray-500">{new Date(selectedNotification.createdAt).toLocaleString()}</div>
        </div>
      )}
    </div>
  );
};