import { Mongo } from 'meteor/mongo';

// In-app notifications collection (database fallback)
export const InAppNotifications = new Mongo.Collection('inAppNotifications');

// Define schema for in-app notifications
const InAppNotificationSchema = {
  userId: String,
  title: String,
  message: String,
  actionUrl: String,
  data: Object,
  type: String, // 'system', 'task', 'reminder', 'alert'
  priority: Number,
  read: Boolean,
  createdAt: Date,
  readAt: Date,
  expiresAt: Date,
  source: String // 'push_fallback', 'direct', etc.
};

// Create indexes for performance
if (Meteor.isServer) {
  InAppNotifications.createIndexAsync({ userId: 1, read: 1 });
  InAppNotifications.createIndexAsync({ createdAt: -1 });
  InAppNotifications.createIndexAsync({ expiresAt: 1 });
}

// Simple notification methods for admin dashboard
export const InAppNotificationMethods = {
  /**
   * Mark notification as read
   */
  'inAppNotifications.markAsRead': async function(notificationId) {
    check(notificationId, String);
    
    if (!this.userId) {
      throw new Meteor.Error('unauthorized', 'Must be logged in');
    }

    const notification = await InAppNotifications.findOneAsync({
      _id: notificationId,
      userId: this.userId
    });

    if (!notification) {
      throw new Meteor.Error('not-found', 'Notification not found');
    }

    await InAppNotifications.updateAsync(notificationId, {
      $set: {
        read: true,
        readAt: new Date()
      }
    });

    return true;
  },

  /**
   * Mark all notifications as read for user
   */
  'inAppNotifications.markAllAsRead': async function() {
    if (!this.userId) {
      throw new Meteor.Error('unauthorized', 'Must be logged in');
    }

    const result = await InAppNotifications.updateAsync(
      { userId: this.userId, read: false },
      {
        $set: {
          read: true,
          readAt: new Date()
        }
      },
      { multi: true }
    );

    return result;
  },

  /**
   * Delete a specific notification
   */
  'inAppNotifications.delete': async function(notificationId) {
    check(notificationId, String);
    
    if (!this.userId) {
      throw new Meteor.Error('unauthorized', 'Must be logged in');
    }

    const notification = await InAppNotifications.findOneAsync({
      _id: notificationId,
      userId: this.userId
    });

    if (!notification) {
      throw new Meteor.Error('not-found', 'Notification not found');
    }

    const result = await InAppNotifications.removeAsync(notificationId);
    return result;
  },

  /**
   * Delete old read notifications
   */
  'inAppNotifications.cleanup': async function(daysOld = 30) {
    const cutoffDate = new Date(Date.now() - (daysOld * 24 * 60 * 60 * 1000));
    
    const result = await InAppNotifications.removeAsync({
      $or: [
        { read: true, readAt: { $lt: cutoffDate } },
        { expiresAt: { $lt: new Date() } }
      ]
    });

    console.log(`[InAppNotifications] Cleaned up ${result} old notifications`);
    return result;
  },

  /**
   * Get notification count for user
   */
  'inAppNotifications.getUnreadCount': async function() {
    if (!this.userId) {
      return 0;
    }

    return await InAppNotifications.find({
      userId: this.userId,
      read: false,
      expiresAt: { $gte: new Date() }
    }).countAsync();
  }
};

// Register methods
Object.keys(InAppNotificationMethods).forEach(key => {
  Meteor.methods({
    [key]: InAppNotificationMethods[key]
  });
});

// Export for external use
export { InAppNotifications as default };
