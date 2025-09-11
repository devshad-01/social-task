/**
 * Client-side Notification Relevance Validator
 * Best Practice: Validate if received notifications are still relevant before showing
 */

export const NotificationValidator = {

  /**
   * Check if a notification is still relevant when received
   * @param {Object} notification - The notification object
   * @param {Object} context - Current app context (route, user state, etc.)
   * @returns {Boolean} - Whether the notification should be shown
   */
  isRelevant(notification, context = {}) {
    try {
      // Check TTL first
      if (!this.isWithinTTL(notification)) {
        console.log(`[NotificationValidator] Notification expired (TTL exceeded): ${notification.title}`);
        return false;
      }

      // Check notification type specific relevance
      switch (notification.data?.type) {
        case 'task-assignment':
          return this.isTaskAssignmentRelevant(notification, context);
        
        case 'task-due':
          return this.isTaskDueRelevant(notification, context);
        
        case 'task-reminder':
          return this.isTaskReminderRelevant(notification, context);
        
        default:
          // For generic notifications, just check TTL
          return true;
      }
    } catch (error) {
      console.error('[NotificationValidator] Error validating notification:', error);
      // If validation fails, show the notification to be safe
      return true;
    }
  },

  /**
   * Check if notification is within its TTL window
   */
  isWithinTTL(notification) {
    const now = new Date();
    const ttlMinutes = notification.ttlMinutes || 15;
    const createdAt = new Date(notification.createdAt || notification.timestamp);
    const expiresAt = new Date(createdAt.getTime() + (ttlMinutes * 60 * 1000));
    
    return now <= expiresAt;
  },

  /**
   * Check if task assignment notification is still relevant
   */
  isTaskAssignmentRelevant(notification, context) {
    const taskId = notification.data?.taskId;
    if (!taskId) return true;

    // If user is already viewing this task, don't show notification
    if (context.currentRoute?.includes(`/tasks/${taskId}`)) {
      console.log(`[NotificationValidator] User already viewing task ${taskId}, skipping notification`);
      return false;
    }

    // If task was recently updated by this user, don't show notification
    const lastTaskUpdate = context.lastTaskUpdates?.[taskId];
    if (lastTaskUpdate && (Date.now() - lastTaskUpdate) < 30000) { // 30 seconds
      console.log(`[NotificationValidator] Task ${taskId} recently updated by user, skipping notification`);
      return false;
    }

    return true;
  },

  /**
   * Check if task due notification is still relevant
   */
  isTaskDueRelevant(notification, context) {
    const taskId = notification.data?.taskId;
    const dueDate = notification.data?.dueDate;
    
    if (!dueDate) return true;

    // If task is more than 1 hour overdue and notification just arrived, might not be relevant
    const due = new Date(dueDate);
    const now = new Date();
    const hoursOverdue = (now - due) / (1000 * 60 * 60);
    
    if (hoursOverdue > 1) {
      console.log(`[NotificationValidator] Task due notification for ${taskId} arrived ${hoursOverdue.toFixed(1)}h late, might be stale`);
      // Still show it but with lower priority
      return true;
    }

    return true;
  },

  /**
   * Check if task reminder notification is still relevant
   */
  isTaskReminderRelevant(notification, context) {
    // Reminders are generally always relevant
    return true;
  },

  /**
   * Get notification display priority based on relevance and age
   */
  getDisplayPriority(notification) {
    const age = Date.now() - new Date(notification.createdAt || notification.timestamp);
    const ageMinutes = age / (1000 * 60);
    
    let priority = notification.priority || 2;
    
    // Reduce priority for older notifications
    if (ageMinutes > 10) {
      priority = Math.max(1, priority - 1);
    }
    
    // Increase priority for urgent/critical notifications regardless of age
    if (notification.priority >= 4) {
      priority = notification.priority;
    }
    
    return priority;
  },

  /**
   * Process notification for display (validation + enhancement)
   */
  processForDisplay(notification, context = {}) {
    if (!this.isRelevant(notification, context)) {
      return null; // Don't display
    }

    // Enhance notification with display metadata
    return {
      ...notification,
      displayPriority: this.getDisplayPriority(notification),
      isTimeSensitive: this.isTimeSensitive(notification),
      displayAge: this.getDisplayAge(notification)
    };
  },

  /**
   * Check if notification is time-sensitive (should be shown immediately)
   */
  isTimeSensitive(notification) {
    return notification.priority >= 4 || // Urgent/Critical
           notification.data?.type === 'task-due' ||
           notification.data?.urgent === true;
  },

  /**
   * Get human-readable age for display
   */
  getDisplayAge(notification) {
    const age = Date.now() - new Date(notification.createdAt || notification.timestamp);
    const minutes = Math.floor(age / (1000 * 60));
    
    if (minutes < 1) return 'now';
    if (minutes === 1) return '1 min ago';
    if (minutes < 60) return `${minutes} mins ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return '1 hour ago';
    if (hours < 24) return `${hours} hours ago`;
    
    return 'earlier';
  }
};
