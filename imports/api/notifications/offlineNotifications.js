import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

/**
 * Offline Notification Storage System
 * 
 * This handles notifications for users who are offline and delivers them
 * when they come back online and subscribe to push notifications.
 */

// Collection to store notifications for offline users
export const OfflineNotifications = new Mongo.Collection('offlineNotifications');

// User online status tracking
export const UserPresence = new Mongo.Collection('userPresence');

// Create indexes for better performance
if (Meteor.isServer) {
  Meteor.startup(() => {
    try {
      // Index for offline notifications
      OfflineNotifications.createIndexAsync({ userId: 1, createdAt: -1 });
      OfflineNotifications.createIndexAsync({ userId: 1, isDelivered: 1 });
      OfflineNotifications.createIndexAsync({ expiresAt: 1 }, { expireAfterSeconds: 0 });
      
      // Index for user presence
      UserPresence.createIndexAsync({ userId: 1 });
      UserPresence.createIndexAsync({ lastSeen: 1 });
      UserPresence.createIndexAsync({ isOnline: 1 });
      
      console.log('[OfflineNotifications] Database indexes created successfully');
    } catch (error) {
      console.error('[OfflineNotifications] Error creating indexes:', error);
    }
  });
}

/**
 * Offline Notification Service
 */
export const OfflineNotificationService = {

  /**
   * Store notification for offline user
   */
  async storeOfflineNotification({
    userId,
    title,
    message,
    actionUrl = '/dashboard',
    data = {},
    priority = 2,
    expiresInHours = 72 // 3 days default
  }) {
    try {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + (expiresInHours * 60 * 60 * 1000));

      const notificationId = await OfflineNotifications.insertAsync({
        userId,
        title,
        message,
        actionUrl,
        data,
        priority,
        isDelivered: false,
        createdAt: now,
        expiresAt,
        retryCount: 0,
        lastRetryAt: null
      });

      console.log(`[OfflineNotifications] Stored offline notification for user ${userId}: ${title}`);
      return notificationId;
    } catch (error) {
      console.error('[OfflineNotifications] Failed to store offline notification:', error);
      throw error;
    }
  },

  /**
   * Check if user is online
   */
  async isUserOnline(userId) {
    try {
      const presence = await UserPresence.findOneAsync({ userId });
      if (!presence) return false;

      // Consider user online if they were active in the last 5 minutes
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      return presence.isOnline && presence.lastSeen > fiveMinutesAgo;
    } catch (error) {
      console.error('[OfflineNotifications] Error checking user online status:', error);
      return false;
    }
  },

  /**
   * Update user online status
   */
  async updateUserPresence(userId, isOnline = true) {
    try {
      await UserPresence.upsertAsync(
        { userId },
        {
          $set: {
            userId,
            isOnline,
            lastSeen: new Date(),
            updatedAt: new Date()
          },
          $setOnInsert: {
            createdAt: new Date()
          }
        }
      );

      // If user just came online, deliver pending notifications
      if (isOnline) {
        this.deliverPendingNotifications(userId);
      }
    } catch (error) {
      console.error('[OfflineNotifications] Error updating user presence:', error);
    }
  },

  /**
   * Deliver all pending notifications for a user
   */
  async deliverPendingNotifications(userId) {
    try {
      const pendingNotifications = await OfflineNotifications.find({
        userId,
        isDelivered: false,
        expiresAt: { $gt: new Date() }
      }).fetchAsync();

      if (pendingNotifications.length === 0) {
        console.log(`[OfflineNotifications] No pending notifications for user ${userId}`);
        return { delivered: 0, failed: 0 };
      }

      console.log(`[OfflineNotifications] Delivering ${pendingNotifications.length} pending notifications to user ${userId}`);

      let delivered = 0;
      let failed = 0;

      for (const notification of pendingNotifications) {
        try {
          // Try to send the notification
          await this.deliverNotification(notification);
          
          // Mark as delivered
          await OfflineNotifications.updateAsync(notification._id, {
            $set: {
              isDelivered: true,
              deliveredAt: new Date(),
              updatedAt: new Date()
            }
          });

          delivered++;
        } catch (error) {
          console.error(`[OfflineNotifications] Failed to deliver notification ${notification._id}:`, error);
          
          // Increment retry count
          await OfflineNotifications.updateAsync(notification._id, {
            $inc: { retryCount: 1 },
            $set: {
              lastRetryAt: new Date(),
              lastError: error.message
            }
          });

          failed++;
        }
      }

      console.log(`[OfflineNotifications] Delivery summary for user ${userId}: ${delivered} delivered, ${failed} failed`);
      return { delivered, failed };
    } catch (error) {
      console.error('[OfflineNotifications] Error delivering pending notifications:', error);
      return { delivered: 0, failed: 0 };
    }
  },

  /**
   * Actually deliver a single notification
   */
  async deliverNotification(notification) {
    try {
      // Import notification queue service
      const { NotificationQueueService } = await import('./notificationQueue.js');
      
      // Send via the regular notification system
      await NotificationQueueService.addToQueue({
        userId: notification.userId,
        title: notification.title,
        message: notification.message,
        actionUrl: notification.actionUrl,
        data: {
          ...notification.data,
          fromOfflineStorage: true,
          originalCreatedAt: notification.createdAt
        },
        priority: notification.priority,
        scheduleAt: new Date() // Send immediately
      });

      console.log(`[OfflineNotifications] ✅ Delivered offline notification: ${notification.title}`);
    } catch (error) {
      console.error(`[OfflineNotifications] ❌ Failed to deliver notification: ${error.message}`);
      throw error;
    }
  },

  /**
   * Clean up old delivered or expired notifications
   */
  async cleanupOldNotifications() {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      // Remove delivered notifications older than 7 days
      const deliveredDeleted = await OfflineNotifications.removeAsync({
        isDelivered: true,
        deliveredAt: { $lt: sevenDaysAgo }
      });

      // Remove expired notifications
      const expiredDeleted = await OfflineNotifications.removeAsync({
        expiresAt: { $lt: new Date() }
      });

      console.log(`[OfflineNotifications] Cleanup completed: ${deliveredDeleted} delivered, ${expiredDeleted} expired notifications removed`);
      return { deliveredDeleted, expiredDeleted };
    } catch (error) {
      console.error('[OfflineNotifications] Error during cleanup:', error);
      return { deliveredDeleted: 0, expiredDeleted: 0 };
    }
  },

  /**
   * Get statistics for admin dashboard
   */
  async getStatistics() {
    try {
      const totalPending = await OfflineNotifications.find({ isDelivered: false }).countAsync();
      const totalDelivered = await OfflineNotifications.find({ isDelivered: true }).countAsync();
      const onlineUsers = await UserPresence.find({ 
        isOnline: true, 
        lastSeen: { $gt: new Date(Date.now() - 5 * 60 * 1000) }
      }).countAsync();
      
      const topPendingUsers = await OfflineNotifications.aggregate([
        { $match: { isDelivered: false } },
        { $group: { _id: '$userId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]).toArray();

      return {
        totalPending,
        totalDelivered,
        onlineUsers,
        topPendingUsers
      };
    } catch (error) {
      console.error('[OfflineNotifications] Error getting statistics:', error);
      return {
        totalPending: 0,
        totalDelivered: 0,
        onlineUsers: 0,
        topPendingUsers: []
      };
    }
  }
};

// Auto-cleanup job (runs every hour)
if (Meteor.isServer) {
  Meteor.setInterval(() => {
    OfflineNotificationService.cleanupOldNotifications();
  }, 60 * 60 * 1000); // 1 hour
}
