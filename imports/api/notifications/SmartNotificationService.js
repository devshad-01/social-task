import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { NotificationQueue, NOTIFICATION_STATUS, NOTIFICATION_PRIORITY } from './notificationQueue';
import { InAppNotifications } from './InAppNotifications';
import { NotificationBuilders, getNotificationStrategy } from './NotificationTypes';

/**
 * Smart Notification Service
 * Handles both ephemeral (TTL-only) and persistent (DB + TTL) notifications
 */
export const SmartNotificationService = {
  
  /**
   * Send notification using smart delivery strategy
   */
  async send({
    category,
    userId,
    title,
    message,
    actionUrl = '/dashboard',
    data = {},
    priority = NOTIFICATION_PRIORITY.NORMAL,
    scheduleAt = new Date(),
    customTtlMinutes = null // Allow custom TTL for testing
  }) {
    check(category, String);
    check(userId, String);
    check(title, String);
    check(message, String);

    const strategy = getNotificationStrategy(category);
    
    // Use custom TTL if provided (for testing), otherwise use strategy TTL
    const ttlMinutes = customTtlMinutes !== null ? customTtlMinutes : strategy.ttl;
    
    if (strategy.shouldStore && customTtlMinutes === null) {
      // Persistent notification: Store in DB + send push with TTL
      return await this.sendPersistent({
        userId,
        title,
        message,
        actionUrl,
        data: {
          ...data,
          category,
          deliveryType: 'persistent'
        },
        priority,
        scheduleAt,
        ttlMinutes
      });
    } else {
      // Ephemeral notification: Direct push with TTL only (use custom TTL if provided)
      return await this.sendEphemeral({
        userId,
        title,
        message,
        actionUrl,
        data: {
          ...data,
          category,
          deliveryType: 'ephemeral'
        },
        priority,
        ttlMinutes
      });
    }
  },

  /**
   * Send persistent notification (stored in DB + TTL delivery)
   */
  async sendPersistent({
    userId,
    title,
    message,
    actionUrl = '/dashboard',
    data = {},
    priority = NOTIFICATION_PRIORITY.NORMAL,
    scheduleAt = new Date(),
    ttlMinutes = 15,
    groupKey = null,
    replace = false
  }) {
    if (Meteor.isServer) {
      try {
        // Store in in-app notifications for offline access
        const inAppNotificationId = await InAppNotifications.insertAsync({
          userId,
          title,
          message,
          actionUrl,
          data,
          type: data.type || 'general',
          priority,
          read: false,
          createdAt: new Date(),
          expiresAt: null // Persistent notifications don't expire from in-app store
        });

        // Also queue for push delivery with TTL
        const queueId = await NotificationQueue.insertAsync({
          userId,
          title,
          message,
          actionUrl,
          data: {
            ...data,
            inAppNotificationId // Link to in-app notification
          },
          priority,
          status: NOTIFICATION_STATUS.QUEUED,
          scheduleAt,
          expiresAt: new Date(Date.now() + (ttlMinutes * 60 * 1000)),
          ttlMinutes,
          groupKey,
          persistent: true,
          retryCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: {
            deliveryType: 'persistent',
            inAppNotificationId
          }
        });

        console.log(`✅ Persistent notification created: in-app=${inAppNotificationId}, queue=${queueId}`);
        return { inAppNotificationId, queueId, deliveryType: 'persistent' };

      } catch (error) {
        console.error('[SmartNotificationService] Error sending persistent notification:', error);
        throw error;
      }
    }
  },

  /**
   * Send ephemeral notification (TTL push only, no DB storage)
   */
  async sendEphemeral({
    userId,
    title,
    message,
    actionUrl = '/dashboard',
    data = {},
    priority = NOTIFICATION_PRIORITY.NORMAL,
    ttlMinutes = 5
  }) {
    if (Meteor.isServer) {
      try {
        // Import WebPush service dynamically to avoid circular dependency
        const { sendPushNotificationToUser } = await import('./webPushServer.js');
        
        // Send directly via push with TTL - no DB storage
        const result = await sendPushNotificationToUser({
          userId,
          title,
          message,
          actionUrl,
          data: {
            ...data,
            ephemeral: true,
            ttlMinutes,
            expiresAt: new Date(Date.now() + (ttlMinutes * 60 * 1000)).toISOString()
          }
        });

        if (result.success) {
          console.log(`✅ Ephemeral notification sent directly to user ${userId} (TTL: ${ttlMinutes}min)`);
          return { 
            success: true, 
            deliveryType: 'ephemeral',
            ttlMinutes,
            sentAt: new Date()
          };
        } else {
          console.log(`⚠️ Ephemeral notification failed - user likely offline (TTL: ${ttlMinutes}min)`);
          return { 
            success: false, 
            deliveryType: 'ephemeral', 
            reason: 'user_offline_or_no_subscription',
            ttlMinutes
          };
        }

      } catch (error) {
        console.error('[SmartNotificationService] Error sending ephemeral notification:', error);
        throw error;
      }
    }
  },

  /**
   * Quick helpers for common notification types
   */
  async sendTaskDueReminder(userId, taskTitle, minutesLeft) {
    const payload = NotificationBuilders.taskDueReminder({ userId, taskTitle, minutesLeft });
    return await this.sendEphemeral(payload);
  },

  async sendTaskAssignment(userId, taskTitle, assignerName, taskId) {
    const payload = NotificationBuilders.taskAssignment({ userId, taskTitle, assignerName, taskId });
    return await this.sendPersistent(payload);
  },

  async sendTaskComment(userId, taskTitle, commenterName, taskId, commentCount = 1) {
    const payload = NotificationBuilders.taskComment({ userId, taskTitle, commenterName, taskId, commentCount });
    return await this.sendPersistent(payload);
  },

  async sendMeetingAlert(userId, meetingTitle, minutesUntil) {
    const payload = NotificationBuilders.meetingAlert({ userId, meetingTitle, minutesUntil });
    return await this.sendEphemeral(payload);
  },

  async sendTaskOverdue(userId, task) {
    check(userId, String);
    check(task, Object);

    const now = new Date();
    const dueDate = new Date(task.dueDate);
    const daysOverdue = Math.floor((now - dueDate) / (24 * 60 * 60 * 1000));
    
    const payload = {
      category: 'REMINDER',
      userId,
      title: '🚨 Overdue Task Alert',
      message: `Task "${task.title}" is ${daysOverdue} day(s) overdue`,
      actionUrl: `/tasks/${task._id}`,
      data: {
        type: 'task_overdue',
        taskId: task._id,
        taskTitle: task.title,
        daysOverdue,
        priority: task.priority || 'medium'
      }
    };

    // Overdue notifications are ephemeral (urgent reminders)
    return await this.sendEphemeral(payload);
  },

  /**
   * Get notification statistics
   */
  async getStats() {
    if (Meteor.isServer) {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      const [queuedCount, persistentCount, ephemeralCount] = await Promise.all([
        NotificationQueue.find({ 
          status: NOTIFICATION_STATUS.QUEUED,
          expiresAt: { $gte: now }
        }).countAsync(),
        
        NotificationQueue.find({
          persistent: true,
          createdAt: { $gte: oneHourAgo }
        }).countAsync(),
        
        NotificationQueue.find({
          'metadata.deliveryType': 'ephemeral',
          createdAt: { $gte: oneHourAgo }
        }).countAsync()
      ]);

      return {
        queued: queuedCount,
        persistentLastHour: persistentCount,
        ephemeralLastHour: ephemeralCount,
        timestamp: now
      };
    }
  }
};
