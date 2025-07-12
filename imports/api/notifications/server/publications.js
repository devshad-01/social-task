import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Notifications } from '../NotificationsCollection';

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
