import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Roles } from 'meteor/alanning:roles';
import { Notifications } from '../NotificationsCollection';
import { NotificationQueue } from '../notificationQueue';

// Publication for user's notifications
Meteor.publish('notifications.user', function(limit = 50) {
  check(limit, Number);

  // Check if user is logged in
  if (!this.userId) {
    return this.ready();
  }

  return Notifications.find(
    { userId: this.userId },
    { 
      sort: { createdAt: -1 },
      limit: limit
    }
  );
});

// Publication for unread notifications count
Meteor.publish('notifications.unreadCount', function() {
  // Check if user is logged in
  if (!this.userId) {
    return this.ready();
  }

  // Use reactive aggregate for count
  return Notifications.find(
    { 
      userId: this.userId,
      read: false
    },
    {
      fields: { _id: 1 }
    }
  );
});

// Publication for recent notifications (for notification bell)
Meteor.publish('notifications.recent', function(limit = 10) {
  check(limit, Number);

  // Check if user is logged in
  if (!this.userId) {
    return this.ready();
  }

  return Notifications.find(
    { userId: this.userId },
    { 
      sort: { createdAt: -1 },
      limit: limit
    }
  );
});

// Publication for notification queue (admin only)
Meteor.publish('notifications.queue', function(limit = 100) {
  check(limit, Number);

  // Check if user is logged in
  if (!this.userId) {
    return this.ready();
  }

  // Check admin role using profile or Roles package
  const user = Meteor.users.findOne(this.userId);
  const isAdmin = (user?.profile?.role === 'admin') || 
                  (Roles && typeof Roles.userIsInRole === 'function' && Roles.userIsInRole(this.userId, ['admin']));
  
  if (!isAdmin) {
    return this.ready();
  }

  return NotificationQueue.find(
    {},
    { 
      sort: { createdAt: -1 },
      limit: limit
    }
  );
});
