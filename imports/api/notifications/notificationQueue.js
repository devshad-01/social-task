import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check, Match } from 'meteor/check';

/**
 * Professional Notification Queue System
 * 
 * Features:
 * - Offline notification queuing
 * - Retry mechanism with exponential backoff
 * - Priority-based delivery
 * - Batch processing
 * - Failed notification tracking
 * - Performance monitoring
 */

// Collections
export const NotificationQueue = new Mongo.Collection('notificationQueue');
export const NotificationLogs = new Mongo.Collection('notificationLogs');

// Notification priorities
export const NOTIFICATION_PRIORITY = {
  LOW: 1,
  NORMAL: 2,
  HIGH: 3,
  URGENT: 4,
  CRITICAL: 5
};

// Notification status
export const NOTIFICATION_STATUS = {
  QUEUED: 'queued',
  PROCESSING: 'processing',
  SENT: 'sent',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  RETRY: 'retry',
  EXPIRED: 'expired'
};

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 5,
  baseDelay: 1000, // 1 second
  maxDelay: 300000, // 5 minutes
  backoffMultiplier: 2
};

/**
 * Professional Notification Queue Service
 */
export const NotificationQueueService = {
  
  /**
   * Add notification to queue with professional options
   */
  async enqueue({
    userId,
    title,
    message,
    actionUrl,
    data = {},
    priority = NOTIFICATION_PRIORITY.NORMAL,
    scheduleAt = new Date(),
    expiresAt = null,
    ttlMinutes = 15, // Best practice: 15-minute TTL for relevance
    groupKey = null, // For grouping similar notifications
    replace = false, // Replace existing notification with same groupKey
    metadata = {}
  }) {
    check(userId, String);
    check(title, String);
    check(message, String);
    check(priority, Match.Integer);
    
    try {
      // If replace is true and groupKey exists, remove existing notifications
      if (replace && groupKey) {
        await this.removeByGroupKey(userId, groupKey);
      }
      
      // Set TTL-based expiration (best practice: 15 minutes for relevance)
      if (!expiresAt) {
        expiresAt = new Date(Date.now() + (ttlMinutes * 60 * 1000));
      }
      
      const notification = {
        userId,
        title,
        message,
        actionUrl,
        data,
        priority,
        status: NOTIFICATION_STATUS.QUEUED,
        scheduleAt,
        expiresAt,
        ttlMinutes, // Store TTL for processing logic
        groupKey,
        metadata,
        retryCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const notificationId = await NotificationQueue.insertAsync(notification);
      
      // Log the queue operation
      this.logOperation('ENQUEUED', notificationId, { userId, title, priority });
      
      // Trigger immediate processing if scheduled for now
      if (scheduleAt <= new Date()) {
        this.triggerProcessing();
      }
      
      return notificationId;
      
    } catch (error) {
      console.error('[NotificationQueue] Failed to enqueue notification:', error);
      throw error;
    }
  },
  
  /**
   * Process queued notifications
   */
  async processQueue() {
    if (Meteor.isServer) {
      try {
        const now = new Date();
        
        // Get notifications ready for processing
        const notifications = await NotificationQueue.find({
          status: { $in: [NOTIFICATION_STATUS.QUEUED, NOTIFICATION_STATUS.RETRY] },
          scheduleAt: { $lte: now },
          expiresAt: { $gte: now }
        }, {
          sort: { priority: -1, scheduleAt: 1 },
          limit: 50 // Process in batches
        }).fetchAsync();
        
        if (!notifications || !Array.isArray(notifications)) {
          console.log('[NotificationQueue] No notifications found or invalid result');
          return;
        }
        
        console.log(`[NotificationQueue] Processing ${notifications.length} notifications`);
        
        for (const notification of notifications) {
          await this.processNotification(notification);
        }
      } catch (error) {
        console.error('[NotificationQueue] Error in processQueue:', error);
      }
    }
  },
  
  /**
   * Process individual notification
   */
  async processNotification(notification) {
    if (Meteor.isServer) {
      try {
        // Check TTL - notifications expire after 15 minutes by default (best practice)
        const now = new Date();
        const ttlMinutes = notification.ttlMinutes || 15;
        const expiresAt = new Date(notification.createdAt.getTime() + (ttlMinutes * 60 * 1000));
        
        if (now > expiresAt) {
          console.log(`[NotificationQueue] Notification ${notification._id} expired (TTL: ${ttlMinutes}min), marking as expired`);
          await this.markAsExpired(notification._id);
          return;
        }

        console.log(`[NotificationQueue] Processing notification ${notification._id} for user ${notification.userId} (expires in ${Math.round((expiresAt - now) / 60000)}min)`);
        
        // Proceed with notification delivery
        
        // Mark as processing
        await NotificationQueue.updateAsync(notification._id, {
          $set: {
            status: NOTIFICATION_STATUS.PROCESSING,
            updatedAt: new Date()
          }
        });
        
        // Import WebPushServer here to avoid circular dependency
        const { sendPushNotificationToUser } = await import('./webPushServer.js');
        
        // Always create database notification first (for UI display)
        await this.createDatabaseNotification(notification);
        
        // Send the push notification
        const result = await sendPushNotificationToUser({
          userId: notification.userId,
          title: notification.title,
          message: notification.message,
          actionUrl: notification.actionUrl,
          data: notification.data
        });
        
        if (result.success) {
          // Mark as sent (both push and database)
          await NotificationQueue.updateAsync(notification._id, {
            $set: {
              status: NOTIFICATION_STATUS.SENT,
              sentAt: new Date(),
              updatedAt: new Date(),
              deliveryMethod: 'both',
              notes: 'Sent via push notification and stored in database'
            }
          });
          
          this.logOperation('SENT', notification._id, { 
            userId: notification.userId,
            title: notification.title,
            retryCount: notification.retryCount,
            deliveryMethod: 'both'
          });
          
        } else {
          // Push failed but database notification was created
          await NotificationQueue.updateAsync(notification._id, {
            $set: {
              status: NOTIFICATION_STATUS.SENT,
              sentAt: new Date(),
              updatedAt: new Date(),
              deliveryMethod: 'database',
              notes: `Push failed: ${result.error || 'Unknown error'}, but saved to database`
            }
          });
          
          this.logOperation('SENT_VIA_DATABASE', notification._id, { 
            userId: notification.userId,
            title: notification.title,
            pushError: result.error
          });
        }
        
      } catch (error) {
        console.error(`[NotificationQueue] Failed to process notification ${notification._id}:`, error);
        await this.handleFailedNotification(notification, error);
      }
    }
  },

  /**
   * Create database notification as fallback when push fails
   */
  async createDatabaseNotification(notification) {
    try {
      const { InAppNotifications } = await import('./InAppNotifications');
      
      // Extract notification type from data or determine from title/message
      let notificationType = 'system';
      if (notification.data?.type) {
        notificationType = notification.data.type;
      } else if (notification.title?.includes('Task') || notification.message?.includes('task')) {
        if (notification.title?.includes('assigned') || notification.message?.includes('assigned')) {
          notificationType = 'task_assigned';
        } else if (notification.title?.includes('completed') || notification.message?.includes('completed')) {
          notificationType = 'task_completed';
        } else if (notification.title?.includes('due') || notification.message?.includes('due')) {
          notificationType = 'task_due';
        } else {
          notificationType = 'task_update';
        }
      }
      
      await InAppNotifications.insertAsync({
        userId: notification.userId,
        title: notification.title,
        message: notification.message,
        actionUrl: notification.actionUrl,
        data: notification.data,
        type: notificationType,
        priority: notification.priority,
        read: false,
        createdAt: new Date(),
        expiresAt: notification.expiresAt
      });
      
      console.log(`[NotificationQueue] Created database notification for user ${notification.userId} (type: ${notificationType})`);
    } catch (error) {
      console.error('[NotificationQueue] Failed to create database notification:', error);
    }
  },
  
  /**
   * Handle failed notification with retry logic
   */
  async handleFailedNotification(notification, error) {
    const retryCount = notification.retryCount + 1;
    
    if (retryCount <= RETRY_CONFIG.maxRetries) {
      // Calculate retry delay with exponential backoff
      const delay = Math.min(
        RETRY_CONFIG.baseDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, retryCount - 1),
        RETRY_CONFIG.maxDelay
      );
      
      const retryAt = new Date(Date.now() + delay);
      
      // Schedule for retry
      await NotificationQueue.updateAsync(notification._id, {
        $set: {
          status: NOTIFICATION_STATUS.RETRY,
          retryCount,
          scheduleAt: retryAt,
          lastError: error.message,
          updatedAt: new Date()
        }
      });
      
      this.logOperation('RETRY_SCHEDULED', notification._id, {
        retryCount,
        retryAt,
        error: error.message
      });
      
    } else {
      // Mark as permanently failed
      await NotificationQueue.updateAsync(notification._id, {
        $set: {
          status: NOTIFICATION_STATUS.FAILED,
          lastError: error.message,
          failedAt: new Date(),
          updatedAt: new Date()
        }
      });
      
      this.logOperation('FAILED', notification._id, {
        error: error.message,
        retryCount
      });
    }
  },
  
  /**
   * Remove notifications by group key
   */
  async removeByGroupKey(userId, groupKey) {
    check(userId, String);
    check(groupKey, String);
    
    const result = await NotificationQueue.removeAsync({
      userId,
      groupKey,
      status: { $in: [NOTIFICATION_STATUS.QUEUED, NOTIFICATION_STATUS.RETRY] }
    });
    
    if (result > 0) {
      this.logOperation('REMOVED_BY_GROUP', null, { userId, groupKey, count: result });
    }
    
    return result;
  },
  
  /**
   * Cancel notification
   */
  async cancel(notificationId) {
    check(notificationId, String);
    
    const result = await NotificationQueue.updateAsync(notificationId, {
      $set: {
        status: NOTIFICATION_STATUS.CANCELLED,
        cancelledAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    if (result) {
      this.logOperation('CANCELLED', notificationId);
    }
    
    return result;
  },
  
  /**
   * Get queue statistics
   */
  async getStats() {
    if (Meteor.isServer) {
      const stats = {};
      
      // Count by status
      for (const status of Object.values(NOTIFICATION_STATUS)) {
        stats[status] = await NotificationQueue.find({ status }).countAsync();
      }
      
      // Count by priority
      stats.byPriority = {};
      for (const [name, value] of Object.entries(NOTIFICATION_PRIORITY)) {
        stats.byPriority[name] = await NotificationQueue.find({ priority: value }).countAsync();
      }
      
      // Performance metrics
      const totalProcessed = await NotificationLogs.find({ operation: 'SENT' }).countAsync();
      const totalFailed = await NotificationLogs.find({ operation: 'FAILED' }).countAsync();
      const averageRetries = await this.calculateAverageRetries();
      
      stats.performance = {
        totalProcessed,
        totalFailed,
        averageRetries
      };
      
      return stats;
    }
    return {};
  },
  
  /**
   * Calculate average retry count
   */
  calculateAverageRetries() {
    const pipeline = [
      { $match: { status: NOTIFICATION_STATUS.SENT } },
      { $group: { _id: null, avgRetries: { $avg: '$retryCount' } } }
    ];
    
    const result = NotificationQueue.aggregate(pipeline);
    return result.length > 0 ? Math.round(result[0].avgRetries * 100) / 100 : 0;
  },
  
  /**
   * Clean up old notifications
   */
  async cleanup() {
    if (Meteor.isServer) {
      const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days
      
      // Remove expired notifications
      const expiredCount = await NotificationQueue.removeAsync({
        $or: [
          { expiresAt: { $lt: new Date() } },
          { status: NOTIFICATION_STATUS.SENT, sentAt: { $lt: cutoffDate } }
        ]
      });
      
      // Clean old logs
      const logCutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days
      const logCount = await NotificationLogs.removeAsync({ createdAt: { $lt: logCutoff } });
      
      console.log(`[NotificationQueue] Cleanup: Removed ${expiredCount} notifications and ${logCount} logs`);
      
      return { expiredCount, logCount };
    }
  },
  
  /**
   * Log queue operations for monitoring
   */
  logOperation(operation, notificationId = null, data = {}) {
    try {
      NotificationLogs.insertAsync({
        operation,
        notificationId,
        data,
        createdAt: new Date()
      });
    } catch (error) {
      console.error('[NotificationQueue] Failed to log operation:', error);
    }
  },
  
  /**
   * Trigger queue processing (can be called manually)
   */
  triggerProcessing() {
    if (Meteor.isServer) {
      // Use Meteor.defer to avoid blocking
      Meteor.defer(() => {
        this.processQueue().catch(error => {
          console.error('[NotificationQueue] Processing error:', error);
        });
      });
    }
  },

  /**
   * Mark notification as expired (TTL exceeded)
   */
  async markAsExpired(notificationId) {
    try {
      await NotificationQueue.updateAsync(notificationId, {
        $set: {
          status: NOTIFICATION_STATUS.EXPIRED,
          expiredAt: new Date(),
          updatedAt: new Date()
        }
      });
      
      this.logOperation('EXPIRED', notificationId, {
        reason: 'TTL exceeded',
        expiredAt: new Date()
      });
    } catch (error) {
      console.error(`[NotificationQueue] Error marking notification ${notificationId} as expired:`, error);
    }
  }
};

// Server-side initialization
if (Meteor.isServer) {
  // Create indexes for performance
  Meteor.startup(async () => {
    console.log('[NotificationQueue] Setting up database indexes...');
    try {
      NotificationQueue.createIndex({ userId: 1, status: 1 });
      NotificationQueue.createIndex({ status: 1, scheduleAt: 1, priority: -1 });
      NotificationQueue.createIndex({ groupKey: 1 });
      NotificationQueue.createIndex({ expiresAt: 1 });
      
      NotificationLogs.createIndex({ createdAt: 1 });
      NotificationLogs.createIndex({ operation: 1 });
      
      console.log('[NotificationQueue] Database indexes created successfully');
      
      // Test collection access
      const testCount = await NotificationQueue.find({}).countAsync();
      console.log(`[NotificationQueue] Collection accessible, found ${testCount} existing notifications`);
      
    } catch (error) {
      console.error('[NotificationQueue] Error setting up indexes:', error);
    }
  });
  
  // Automatic queue processing every 30 seconds
  Meteor.setInterval(() => {
    try {
      NotificationQueueService.processQueue().catch(error => {
        console.error('[NotificationQueue] Automatic processing error:', error);
      });
    } catch (error) {
      console.error('[NotificationQueue] Error starting automatic processing:', error);
    }
  }, 30000);
  
  // Daily cleanup at 2 AM
  Meteor.setInterval(() => {
    const now = new Date();
    if (now.getHours() === 2 && now.getMinutes() < 30) {
      NotificationQueueService.cleanup().catch(error => {
        console.error('[NotificationQueue] Cleanup error:', error);
      });
    }
  }, 30 * 60 * 1000); // Check every 30 minutes
}
