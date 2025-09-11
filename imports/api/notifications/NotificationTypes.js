import { check } from 'meteor/check';

/**
 * Notification Classification System
 * Differentiates between ephemeral (TTL-only) and persistent (DB + TTL) notifications
 */

export const NOTIFICATION_DELIVERY_TYPES = {
  EPHEMERAL: 'ephemeral',     // TTL-only, no DB storage
  PERSISTENT: 'persistent'    // Store in DB + TTL delivery
};

export const NOTIFICATION_CATEGORIES = {
  // Ephemeral notifications (TTL-only)
  REMINDER: {
    type: NOTIFICATION_DELIVERY_TYPES.EPHEMERAL,
    ttl: 5, // 5 minutes relevance
    examples: ['Task due in 5 min', 'Meeting starting soon']
  },
  
  ALERT: {
    type: NOTIFICATION_DELIVERY_TYPES.EPHEMERAL,
    ttl: 10, // 10 minutes relevance
    examples: ['System maintenance in 10 min', 'Server restart']
  },

  // Persistent notifications (DB + TTL)
  TASK_ASSIGNMENT: {
    type: NOTIFICATION_DELIVERY_TYPES.PERSISTENT,
    ttl: 60, // 1 hour delivery window
    examples: ['You were assigned a new task', 'Task deadline changed']
  },

  TASK_UPDATE: {
    type: NOTIFICATION_DELIVERY_TYPES.PERSISTENT,
    ttl: 30, // 30 minutes delivery window
    examples: ['Task status changed', 'Task completed']
  },

  COMMENT: {
    type: NOTIFICATION_DELIVERY_TYPES.PERSISTENT,
    ttl: 60, // 1 hour delivery window
    examples: ['New comment on your task', '3 comments added']
  },

  SYSTEM: {
    type: NOTIFICATION_DELIVERY_TYPES.PERSISTENT,
    ttl: 120, // 2 hours delivery window
    examples: ['Account updated', 'Settings changed']
  }
};

/**
 * Determine notification delivery strategy
 */
export const getNotificationStrategy = (category) => {
  check(category, String);
  
  const config = NOTIFICATION_CATEGORIES[category];
  if (!config) {
    // Default to persistent for safety
    return {
      type: NOTIFICATION_DELIVERY_TYPES.PERSISTENT,
      ttl: 15,
      shouldStore: true
    };
  }

  return {
    type: config.type,
    ttl: config.ttl,
    shouldStore: config.type === NOTIFICATION_DELIVERY_TYPES.PERSISTENT
  };
};

/**
 * Notification payload builder for different strategies
 */
export const buildNotificationPayload = ({
  category,
  userId,
  title,
  message,
  actionUrl = '/dashboard',
  data = {},
  priority = 2
}) => {
  check(category, String);
  check(userId, String);
  check(title, String);
  check(message, String);

  const strategy = getNotificationStrategy(category);

  const basePayload = {
    userId,
    title,
    message,
    actionUrl,
    data: {
      ...data,
      category,
      deliveryType: strategy.type
    },
    priority,
    ttlMinutes: strategy.ttl
  };

  if (strategy.shouldStore) {
    // Persistent notification - store in DB + push delivery
    return {
      ...basePayload,
      persistent: true,
      metadata: {
        ...basePayload.metadata,
        category,
        deliveryType: strategy.type,
        storedForOfflineAccess: true
      }
    };
  } else {
    // Ephemeral notification - push only with TTL
    return {
      ...basePayload,
      persistent: false,
      ephemeral: true,
      metadata: {
        ...basePayload.metadata,
        category,
        deliveryType: strategy.type,
        ephemeralOnly: true
      }
    };
  }
};

/**
 * Common notification builders for different use cases
 */
export const NotificationBuilders = {
  // Ephemeral reminders
  taskDueReminder: ({ userId, taskTitle, minutesLeft }) => buildNotificationPayload({
    category: 'REMINDER',
    userId,
    title: '⏰ Task Due Soon',
    message: `"${taskTitle}" is due in ${minutesLeft} minutes`,
    actionUrl: '/tasks',
    data: { type: 'task_due_reminder', minutesLeft }
  }),

  meetingAlert: ({ userId, meetingTitle, minutesUntil }) => buildNotificationPayload({
    category: 'ALERT',
    userId,
    title: '📅 Meeting Starting Soon',
    message: `"${meetingTitle}" starts in ${minutesUntil} minutes`,
    actionUrl: '/calendar',
    data: { type: 'meeting_alert', minutesUntil }
  }),

  // Persistent notifications
  taskAssignment: ({ userId, taskTitle, assignerName, taskId }) => buildNotificationPayload({
    category: 'TASK_ASSIGNMENT',
    userId,
    title: '📋 New Task Assigned',
    message: `${assignerName} assigned you "${taskTitle}"`,
    actionUrl: `/tasks/${taskId}`,
    data: { type: 'task_assigned', taskId, assignerName },
    priority: 3
  }),

  taskComment: ({ userId, taskTitle, commenterName, taskId, commentCount = 1 }) => buildNotificationPayload({
    category: 'COMMENT',
    userId,
    title: '💬 New Comment',
    message: commentCount > 1 
      ? `${commenterName} and others commented on "${taskTitle}"`
      : `${commenterName} commented on "${taskTitle}"`,
    actionUrl: `/tasks/${taskId}`,
    data: { type: 'task_comment', taskId, commenterName, commentCount }
  }),

  taskStatusChange: ({ userId, taskTitle, newStatus, taskId }) => buildNotificationPayload({
    category: 'TASK_UPDATE',
    userId,
    title: '📊 Task Status Updated',
    message: `"${taskTitle}" is now ${newStatus}`,
    actionUrl: `/tasks/${taskId}`,
    data: { type: 'task_status_change', taskId, newStatus }
  })
};
