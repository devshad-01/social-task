import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Roles } from 'meteor/alanning:roles';
import { NotificationQueueService, NOTIFICATION_PRIORITY } from './notificationQueue.js';

/**
 * Enhanced Notification Methods with Professional Queuing
 */

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
      priority = NOTIFICATION_PRIORITY.HIGH
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
      priority = NOTIFICATION_PRIORITY.NORMAL
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
      reminderTime = 24 * 60 * 60 * 1000 // 24 hours before due
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
      actionUrl = '/dashboard'
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
        metadata: {
          sentBy: this.userId,
          method: 'notifications.sendTest',
          isTest: true
        }
      });
    }
  });
}
