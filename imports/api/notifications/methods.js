import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Roles } from 'meteor/alanning:roles';
import { Notifications, NotificationHelpers } from './NotificationsCollection';

Meteor.methods({
  /**
   * Create a new notification
   */
  async 'notifications.create'(notificationData) {
    check(notificationData, {
      userId: String,
      type: String,
      title: Match.Optional(String),
      message: Match.Optional(String),
      priority: Match.Optional(String),
      actionUrl: Match.Optional(String),
      relatedId: Match.Optional(String),
      relatedType: Match.Optional(String),
      metadata: Match.Optional(Object),
      data: Match.Optional(Object)
    });

    // Generate title and message if not provided
    if (!notificationData.title) {
      notificationData.title = NotificationHelpers.generateTitle(
        notificationData.type, 
        notificationData.metadata
      );
    }

    if (!notificationData.message) {
      notificationData.message = NotificationHelpers.formatMessage(
        notificationData.type, 
        notificationData.metadata
      );
    }

    // Generate action URL if not provided
    if (!notificationData.actionUrl && notificationData.relatedId && notificationData.relatedType) {
      notificationData.actionUrl = NotificationHelpers.generateActionUrl(
        notificationData.type,
        notificationData.relatedId,
        notificationData.relatedType
      );
    }

    // Include taskId in data field for task-related notifications
    if (!notificationData.data && notificationData.relatedType === 'task' && notificationData.relatedId) {
      notificationData.data = {
        taskId: notificationData.relatedId,
        type: notificationData.type
      };
    }

    const notificationId = await Notifications.insertAsync({
      ...notificationData,
      createdBy: this.userId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return notificationId;
  },

  /**
   * Mark notification as read
   */
  async 'notifications.markAsRead'(notificationId) {
    check(notificationId, String);

    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in');
    }

    const notification = await Notifications.findOneAsync(notificationId);
    if (!notification) {
      throw new Meteor.Error('notification-not-found', 'Notification not found');
    }

    // Users can only mark their own notifications as read
    if (notification.userId !== this.userId) {
      throw new Meteor.Error('not-authorized', 'You can only mark your own notifications as read');
    }

    await Notifications.updateAsync(notificationId, {
      $set: {
        read: true,
        updatedAt: new Date()
      }
    });

    return true;
  },

  /**
   * Mark all notifications as read for the current user
   */
  async 'notifications.markAllAsRead'() {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in');
    }

    await Notifications.updateAsync(
      { 
        userId: this.userId,
        read: false
      },
      {
        $set: {
          read: true,
          updatedAt: new Date()
        }
      },
      { multi: true }
    );

    return true;
  },

  /**
   * Delete a notification
   */
  async 'notifications.delete'(notificationId) {
    check(notificationId, String);

    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in');
    }

    const notification = await Notifications.findOneAsync(notificationId);
    if (!notification) {
      throw new Meteor.Error('notification-not-found', 'Notification not found');
    }

    // Users can only delete their own notifications
    if (notification.userId !== this.userId) {
      throw new Meteor.Error('not-authorized', 'You can only delete your own notifications');
    }

    await Notifications.removeAsync(notificationId);
    return true;
  },

  /**
   * Send notification when task is assigned
   */
  async 'notifications.taskAssigned'(taskId, assigneeIds, taskTitle) {
    check(taskId, String);
    check(assigneeIds, [String]);
    check(taskTitle, String);

    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in');
    }

    // Only admins and supervisors can trigger task assignment notifications
    // TODO: Re-enable role checks once Roles package is working
    // if (!Roles.userIsInRole(this.userId, ['admin', 'supervisor'])) {
    //   throw new Meteor.Error('not-authorized', 'Only admins and supervisors can assign tasks');
    // }

    const assignerUser = await Meteor.users.findOneAsync(this.userId);
    const assignerName = assignerUser?.profile?.fullName || 'Someone';

    // Send notification to each assignee
    const notificationPromises = assigneeIds.map(assigneeId => {
      // Don't notify the person who assigned the task
      if (assigneeId === this.userId) return null;

      return Meteor.callAsync('notifications.create', {
        userId: assigneeId,
        type: 'task_assigned',
        priority: 'high',
        relatedId: taskId,
        relatedType: 'task',
        metadata: {
          userName: assignerName,
          taskTitle: taskTitle
        }
      });
    });

    // Wait for all notifications to be created
    await Promise.all(notificationPromises.filter(Boolean));
    return true;
  },

  /**
   * Send notification when task is completed
   */
  async 'notifications.taskCompleted'(taskId, taskTitle, taskCreatedBy, assigneeIds = []) {
    check(taskId, String);
    check(taskTitle, String);
    check(taskCreatedBy, String);
    check(assigneeIds, [String]);

    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in');
    }

    const completedByUser = await Meteor.users.findOneAsync(this.userId);
    const completedByName = completedByUser?.profile?.fullName || 'Someone';

    // Notify task creator if different from completer
    if (taskCreatedBy !== this.userId) {
      await Meteor.callAsync('notifications.create', {
        userId: taskCreatedBy,
        type: 'task_completed',
        priority: 'medium',
        relatedId: taskId,
        relatedType: 'task',
        metadata: {
          userName: completedByName,
          taskTitle: taskTitle
        }
      });
    }

    // Notify other assignees (but not the one who completed it)
    const otherAssignees = assigneeIds.filter(id => id !== this.userId);
    const notificationPromises = otherAssignees.map(assigneeId => {
      return Meteor.callAsync('notifications.create', {
        userId: assigneeId,
        type: 'task_completed',
        priority: 'medium',
        relatedId: taskId,
        relatedType: 'task',
        metadata: {
          userName: completedByName,
          taskTitle: taskTitle
        }
      });
    });

    await Promise.all(notificationPromises);
    return true;
  }
});
