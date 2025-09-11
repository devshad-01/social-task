import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Roles } from 'meteor/alanning:roles';
import { NotificationQueueService, NOTIFICATION_PRIORITY } from './notificationQueue.js';
import { SmartNotificationService } from './SmartNotificationService.js';

/**
 * Enhanced Notification Methods with Professional Queuing
 */

// Helper function to safely check user roles (async version for methods)
async function isUserInRole(userId, roles) {
  if (!userId) return false;
  
  try {
    // Check profile.role first for compatibility
    const user = await Meteor.users.findOneAsync(userId);
    if (user?.profile?.role && roles.includes(user.profile.role)) {
      return true;
    }
    
    // Fallback to Meteor Roles package
    if (Roles && typeof Roles.userIsInRole === 'function') {
      return Roles.userIsInRole(userId, roles);
    }
  } catch (error) {
    console.error('[NOTIFICATIONS] Error checking user role:', error);
  }
  
  return false;
}

if (Meteor.isServer) {
  Meteor.methods({
    
    /**
     * Send notification to specific user with professional queuing
     */
    async 'notifications.sendToUser'({
      userId,
      title,
      message,
      actionUrl = '/dashboard',
      data = {},
      priority = NOTIFICATION_PRIORITY.NORMAL,
      scheduleAt = new Date(),
      expiresAt = null,
      ttlMinutes = 15, // Best practice: 15-minute TTL
      groupKey = null,
      replace = false
    }) {
      check(userId, String);
      check(title, String);
      check(message, String);
      check(actionUrl, String);
      check(priority, Match.Integer);
      
      // Ensure user is authorized (can only send to self unless admin)
      if (this.userId !== userId && !Roles.userIsInRole(this.userId, ['admin', 'supervisor'])) {
        throw new Meteor.Error('unauthorized', 'Cannot send notification to other users');
      }
      
      return await NotificationQueueService.enqueue({
        userId,
        title,
        message,
        actionUrl,
        data,
        priority,
        scheduleAt,
        expiresAt,
        ttlMinutes, // Pass TTL parameter for relevance window
        groupKey,
        replace,
        metadata: {
          sentBy: this.userId,
          method: 'notifications.sendToUser'
        }
      });
    },
    
    /**
     * Send notification to multiple users
     */
    async 'notifications.sendToUsers'({
      userIds,
      title,
      message,
      actionUrl = '/dashboard',
      data = {},
      priority = NOTIFICATION_PRIORITY.NORMAL,
      scheduleAt = new Date(),
      expiresAt = null,
      ttlMinutes = 15, // Best practice: 15-minute TTL
      groupKey = null,
      replace = false
    }) {
      check(userIds, [String]);
      check(title, String);
      check(message, String);
      
      // Ensure user is authorized to send bulk notifications
      if (!Roles.userIsInRole(this.userId, ['admin', 'supervisor'])) {
        throw new Meteor.Error('unauthorized', 'Only admins and supervisors can send bulk notifications');
      }
      
      const notificationIds = [];
      
      for (const userId of userIds) {
        try {
          const notificationId = await NotificationQueueService.enqueue({
            userId,
            title,
            message,
            actionUrl,
            data,
            priority,
            scheduleAt,
            expiresAt,
            ttlMinutes, // Pass TTL parameter for relevance window
            groupKey,
            replace,
            metadata: {
              sentBy: this.userId,
              method: 'notifications.sendToUsers',
              bulkSend: true
            }
          });
          notificationIds.push(notificationId);
        } catch (error) {
          console.error(`Failed to queue notification for user ${userId}:`, error);
        }
      }
      
      return notificationIds;
    },
    
    /**
     * Enhanced task assignment notification with queuing
     */
    async 'notifications.taskAssigned'({
      taskId,
      taskTitle,
      assignedBy,
      assigneeIds,
      dueDate = null,
      priority = NOTIFICATION_PRIORITY.HIGH,
      ttlMinutes = 15 // Best practice: 15-minute TTL for task assignments
    }) {
      console.log('[DEBUG] notifications.taskAssigned called with:', {
        taskId,
        taskTitle,
        assignedBy,
        assigneeIds,
        dueDate,
        priority
      });
      
      check(taskId, String);
      check(taskTitle, String);
      check(assignedBy, String);
      check(assigneeIds, [String]);
      
      // Ensure user is authorized (using safe Roles check)
      if (Roles && typeof Roles.userIsInRole === 'function' && this.userId) {
        if (!Roles.userIsInRole(this.userId, ['admin', 'supervisor'])) {
          throw new Meteor.Error('unauthorized', 'Only admins and supervisors can assign tasks');
        }
      }
      
      const assignerUser = await Meteor.users.findOneAsync(assignedBy);
      const assignerName = assignerUser?.profile?.name || 'Someone';
      const dueDateText = dueDate ? ` Due: ${new Date(dueDate).toLocaleDateString()}` : '';
      
      const notificationIds = [];
      
      for (const assigneeId of assigneeIds) {
        try {
          const notificationId = await NotificationQueueService.enqueue({
            userId: assigneeId,
            title: '📋 New Task Assigned',
            message: `${assignerName} assigned you "${taskTitle}".${dueDateText}`,
            actionUrl: `/tasks/${taskId}`,
            data: {
              type: 'task_assigned',
              taskId,
              assignedBy,
              dueDate
            },
            priority,
            ttlMinutes, // TTL for relevance window
            groupKey: `task_assigned_${taskId}`, // Group similar notifications
            replace: true, // Replace any existing assignment notifications for this task
            metadata: {
              sentBy: this.userId,
              method: 'notifications.taskAssigned',
              taskId
            }
          });
          notificationIds.push(notificationId);
        } catch (error) {
          console.error(`Failed to queue task assignment notification for ${assigneeId}:`, error);
        }
      }
      
      return notificationIds;
    },
    
    /**
     * Enhanced task completion notification with queuing
     */
    async 'notifications.taskCompleted'({
      taskId,
      taskTitle,
      completedBy,
      adminIds,
      priority = NOTIFICATION_PRIORITY.NORMAL,
      ttlMinutes = 15 // Best practice: 15-minute TTL for task completion
    }) {
      check(taskId, String);
      check(taskTitle, String);
      check(completedBy, String);
      check(adminIds, [String]);
      
      const completerUser = await Meteor.users.findOneAsync(completedBy);
      const completerName = completerUser?.profile?.name || 'Someone';
      
      const notificationIds = [];
      
      for (const adminId of adminIds) {
        try {
          const notificationId = await NotificationQueueService.enqueue({
            userId: adminId,
            title: '✅ Task Completed',
            message: `${completerName} completed "${taskTitle}".`,
            actionUrl: `/tasks/${taskId}`,
            data: {
              type: 'task_completed',
              taskId,
              completedBy
            },
            priority,
            ttlMinutes, // TTL for relevance window
            groupKey: `task_completed_${taskId}`,
            replace: true,
            metadata: {
              sentBy: this.userId,
              method: 'notifications.taskCompleted',
              taskId
            }
          });
          notificationIds.push(notificationId);
        } catch (error) {
          console.error(`Failed to queue task completion notification for ${adminId}:`, error);
        }
      }
      
      return notificationIds;
    },
    
    /**
     * Schedule task due date reminder
     */
    async 'notifications.scheduleTaskReminder'({
      taskId,
      taskTitle,
      assigneeIds,
      dueDate,
      reminderTime = 24 * 60 * 60 * 1000, // 24 hours before due
      ttlMinutes = 15 // Best practice: 15-minute TTL for task reminders
    }) {
      check(taskId, String);
      check(taskTitle, String);
      check(assigneeIds, [String]);
      check(dueDate, Date);
      
      const scheduleAt = new Date(dueDate.getTime() - reminderTime);
      
      // Don't schedule if due date is in the past
      if (scheduleAt <= new Date()) {
        return [];
      }
      
      const notificationIds = [];
      
      for (const assigneeId of assigneeIds) {
        try {
          const notificationId = await NotificationQueueService.enqueue({
            userId: assigneeId,
            title: '⏰ Task Due Soon',
            message: `"${taskTitle}" is due soon. Due: ${dueDate.toLocaleDateString()}`,
            actionUrl: `/tasks/${taskId}`,
            data: {
              type: 'task_due_reminder',
              taskId,
              dueDate: dueDate.toISOString()
            },
            priority: NOTIFICATION_PRIORITY.HIGH,
            scheduleAt,
            expiresAt: dueDate, // Expire at due date
            ttlMinutes, // TTL for relevance window
            groupKey: `task_reminder_${taskId}`,
            replace: true,
            metadata: {
              sentBy: this.userId,
              method: 'notifications.scheduleTaskReminder',
              taskId
            }
          });
          notificationIds.push(notificationId);
        } catch (error) {
          console.error(`Failed to schedule task reminder for ${assigneeId}:`, error);
        }
      }
      
      return notificationIds;
    },
    
    /**
     * Cancel notifications by group key
     */
    async 'notifications.cancelByGroup'({ userId, groupKey }) {
      check(userId, String);
      check(groupKey, String);
      
      // Users can cancel their own notifications, admins can cancel any
      if (this.userId !== userId && !Roles.userIsInRole(this.userId, ['admin'])) {
        throw new Meteor.Error('unauthorized', 'Cannot cancel other user notifications');
      }
      
      return await NotificationQueueService.removeByGroupKey(userId, groupKey);
    },
    
    /**
     * Get notification queue statistics (admin only)
     */
    async 'notifications.getQueueStats'() {
      if (!Roles.userIsInRole(this.userId, ['admin'])) {
        throw new Meteor.Error('unauthorized', 'Only admins can view queue statistics');
      }
      
      return NotificationQueueService.getStats();
    },
    
    /**
     * Manually trigger queue processing (admin only)
     */
    async 'notifications.processQueue'() {
      if (!Roles.userIsInRole(this.userId, ['admin'])) {
        throw new Meteor.Error('unauthorized', 'Only admins can trigger queue processing');
      }
      
      NotificationQueueService.triggerProcessing();
      return { success: true };
    },
    
    /**
     * Test notification with immediate processing
     */
    async 'notifications.sendTest'({
      title = 'Test Notification',
      message = 'This is a test notification to verify your setup is working correctly!',
      actionUrl = '/dashboard',
      ttlMinutes = 15 // Best practice: 15-minute TTL for test notifications
    }) {
      check(title, String);
      check(message, String);
      check(actionUrl, String);
      
      return await NotificationQueueService.enqueue({
        userId: this.userId,
        title,
        message,
        actionUrl,
        priority: NOTIFICATION_PRIORITY.HIGH,
        scheduleAt: new Date(), // Send immediately
        ttlMinutes, // TTL for relevance window
        metadata: {
          sentBy: this.userId,
          method: 'notifications.sendTest',
          isTest: true
        }
      });
    },

    /**
     * Retry failed notifications (admin only)
     */
    async 'notifications.retryFailed'() {
      if (!Roles.userIsInRole(this.userId, ['admin'])) {
        throw new Meteor.Error('unauthorized', 'Only admins can retry failed notifications');
      }

      return NotificationQueueService.retryFailedNotifications();
    },

    /**
     * Clean up old notifications (admin only)
     */
    async 'notifications.cleanup'() {
      if (!Roles.userIsInRole(this.userId, ['admin'])) {
        throw new Meteor.Error('unauthorized', 'Only admins can cleanup notifications');
      }

      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      // Clean up old completed/failed notifications
      const { NotificationQueue } = await import('./NotificationsCollection.js');
      const { InAppNotifications } = await import('./InAppNotifications.js');
      
      const queueCleaned = NotificationQueue.remove({
        status: { $in: ['completed', 'failed'] },
        updatedAt: { $lt: oneWeekAgo }
      });

      // Clean up old in-app notifications
      const inAppCleaned = InAppNotifications.cleanupOldNotifications();

      return {
        cleaned: queueCleaned + (inAppCleaned || 0),
        queueCleaned,
        inAppCleaned: inAppCleaned || 0
      };
    },

    /**
     * Get total in-app notification count (admin only)
     */
    async 'inAppNotifications.getTotalCount'() {
      if (!Roles.userIsInRole(this.userId, ['admin'])) {
        throw new Meteor.Error('unauthorized', 'Only admins can view notification statistics');
      }

      const { InAppNotifications } = await import('./InAppNotifications.js');
      return InAppNotifications.find().count();
    },

    /**
     * Smart notification methods using best practice delivery strategies
     */
    
    /**
     * Send smart notification (automatically chooses ephemeral vs persistent)
     */
    async 'notifications.sendSmart'({
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
      
      // Ensure user is authorized - use safe role checking
      // Allow system/cron notifications (no userId context) or admin users
      const isSystemCall = !this.userId; // Cron jobs and system calls have no userId
      
      if (!isSystemCall) {
        // For user-initiated calls, check permissions
        const isAdmin = await isUserInRole(this.userId, ['admin', 'supervisor']);
        if (this.userId !== userId && !isAdmin) {
          throw new Meteor.Error('unauthorized', 'Cannot send notification to other users');
        }
      }
      // System calls are automatically authorized
      
      // For testing with 3-second TTL
      if (data.testMode && data.ttlSeconds) {
        customTtlMinutes = data.ttlSeconds / 60; // Convert seconds to minutes
      }
      
      return await SmartNotificationService.send({
        category,
        userId,
        title,
        message,
        actionUrl,
        data,
        priority,
        scheduleAt,
        customTtlMinutes
      });
    },

    /**
     * Send ephemeral task due reminder (TTL-only, no DB storage)
     */
    async 'notifications.taskDueReminder'({ userId, taskTitle, minutesLeft }) {
      check(userId, String);
      check(taskTitle, String);
      check(minutesLeft, Number);
      
      return await SmartNotificationService.sendTaskDueReminder(userId, taskTitle, minutesLeft);
    },

    /**
     * Send persistent task assignment (DB + TTL delivery)
     */
    async 'notifications.smartTaskAssigned'({ userId, taskTitle, assignerName, taskId }) {
      check(userId, String);
      check(taskTitle, String);
      check(assignerName, String);
      check(taskId, String);
      
      return await SmartNotificationService.sendTaskAssignment(userId, taskTitle, assignerName, taskId);
    },

    /**
     * Send meeting alert (ephemeral)
     */
    async 'notifications.meetingAlert'({ userId, meetingTitle, minutesUntil }) {
      check(userId, String);
      check(meetingTitle, String);
      check(minutesUntil, Number);
      
      return await SmartNotificationService.sendMeetingAlert(userId, meetingTitle, minutesUntil);
    },

    /**
     * Get smart notification service statistics (admin only)
     */
    async 'notifications.getSmartStats'() {
      const isAdmin = await isUserInRole(this.userId, ['admin']);
      if (!isAdmin) {
        throw new Meteor.Error('unauthorized', 'Only admins can view notification statistics');
      }
      
      return await SmartNotificationService.getStats();
    }
  });
}
