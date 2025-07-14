import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

// Create the Notifications collection
export const Notifications = new Mongo.Collection('notifications');

// Define the schema for Notifications
const NotificationSchema = new SimpleSchema({
  userId: {
    type: String,
    // User who will receive the notification
  },
  type: {
    type: String,
    allowedValues: [
      'task_assigned',
      'task_completed', 
      'task_overdue',
      'task_due_soon',
      'task_status_changed',
      'comment_added',
      'client_added',
      'team_member_added',
      'mention',
      'system'
    ]
  },
  title: {
    type: String,
    max: 200
  },
  message: {
    type: String,
    max: 500
  },
  priority: {
    type: String,
    allowedValues: ['low', 'medium', 'high'],
    defaultValue: 'medium'
  },
  read: {
    type: Boolean,
    defaultValue: false
  },
  actionUrl: {
    type: String,
    optional: true
  },
  relatedId: {
    type: String,
    optional: true
    // ID of related object (task ID, user ID, etc.)
  },
  relatedType: {
    type: String,
    optional: true,
    allowedValues: ['task', 'user', 'client', 'comment']
  },
  createdBy: {
    type: String,
    optional: true
    // User who triggered the notification
  },
  metadata: {
    type: Object,
    optional: true,
    blackbox: true
  },
  data: {
    type: Object,
    optional: true,
    blackbox: true
    // Additional data for client-side handling (e.g., taskId, clientId, etc.)
  },
  createdAt: {
    type: Date,
    autoValue: function() {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return { $setOnInsert: new Date() };
      } else {
        this.unset();
      }
    }
  },
  updatedAt: {
    type: Date,
    autoValue: function() {
      return new Date();
    }
  }
});

// Export the schema for use in methods
export { NotificationSchema };

// Helper functions for notifications
export const NotificationHelpers = {
  formatMessage(type, metadata = {}) {
    const { userName, taskTitle, clientName } = metadata;
    
    switch (type) {
      case 'task_assigned':
        return `You have been assigned to "${taskTitle}"`;
      case 'task_completed':
        return `${userName} completed "${taskTitle}"`;
      case 'task_overdue':
        return `Task "${taskTitle}" is overdue`;
      case 'task_due_soon':
        return `Task "${taskTitle}" is due soon`;
      case 'task_status_changed':
        return `Status changed for "${taskTitle}"`;
      case 'comment_added':
        return `${userName} commented on "${taskTitle}"`;
      case 'client_added':
        return `New client "${clientName}" has been added`;
      case 'team_member_added':
        return `${userName} joined the team`;
      case 'mention':
        return `${userName} mentioned you in a comment`;
      default:
        return 'You have a new notification';
    }
  },

  generateTitle(type, metadata = {}) {
    const { userName, taskTitle } = metadata;
    
    switch (type) {
      case 'task_assigned':
        return 'New task assigned';
      case 'task_completed':
        return 'Task completed';
      case 'task_overdue':
        return 'Task overdue';
      case 'task_due_soon':
        return 'Task due soon';
      case 'task_status_changed':
        return 'Task status updated';
      case 'comment_added':
        return 'New comment';
      case 'client_added':
        return 'New client added';
      case 'team_member_added':
        return 'New team member';
      case 'mention':
        return 'You were mentioned';
      default:
        return 'Notification';
    }
  },

  generateActionUrl(type, relatedId, relatedType) {
    switch (relatedType) {
      case 'task':
        return `/tasks/${relatedId}`;
      case 'user':
        return `/team/${relatedId}`;
      case 'client':
        return `/clients/${relatedId}`;
      default:
        return '/notifications';
    }
  }
};
