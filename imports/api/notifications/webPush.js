import { Meteor } from 'meteor/meteor';

// Web Push Service for sending browser notifications
export const WebPushService = {
  /**
   * Request notification permission from the user
   */
  async requestPermission() {
    if (!('Notification' in window)) {
      console.warn('This browser does not support desktop notification');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  },

  /**
   * Send a browser notification
   */
  async sendNotification({ title, message, actionUrl, icon = '/icons/icon-192.png' }) {
    console.log('[WebPushService] Sending notification:', { title, message, actionUrl });
    
    if (!('Notification' in window)) {
      console.warn('Browser does not support notifications');
      return false;
    }

    // Auto-request permission if not already granted
    if (Notification.permission === 'default') {
      console.log('[WebPushService] Requesting notification permission...');
      const permission = await this.requestPermission();
      if (!permission) {
        console.warn('Notification permission denied');
        return false;
      }
    }

    if (Notification.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return false;
    }

    try {
      const notification = new Notification(title, {
        body: message,
        icon: icon,
        badge: icon,
        tag: 'posty-notification',
        requireInteraction: true,
        actions: actionUrl ? [
          {
            action: 'view',
            title: 'View',
            icon: icon
          }
        ] : []
      });

      // Handle notification click
      notification.onclick = () => {
        window.focus();
        if (actionUrl) {
          // Use router to navigate
          const event = new CustomEvent('notification-click', {
            detail: { actionUrl }
          });
          window.dispatchEvent(event);
        }
        notification.close();
      };

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      return true;
    } catch (error) {
      console.error('[WebPushService] Failed to send notification:', error);
      return false;
    }
  },

  /**
   * Send notification to user when they're mentioned in a task
   */
  async notifyTaskAssignment(taskTitle, assignedBy) {
    return this.sendNotification({
      title: 'New Task Assigned',
      message: `${assignedBy} assigned you a task: ${taskTitle}`,
      actionUrl: '/tasks'
    });
  },

  /**
   * Send notification when task is completed
   */
  async notifyTaskCompleted(taskTitle, completedBy) {
    return this.sendNotification({
      title: 'Task Completed',
      message: `${completedBy} completed: ${taskTitle}`,
      actionUrl: '/tasks'
    });
  }
};

// Auto-request permission when the service is loaded
if (Meteor.isClient) {
  Meteor.startup(() => {
    // Don't auto-request permission on startup - wait for user interaction
    console.log('[WebPushService] Service loaded. Permission will be requested on first notification.');
  });
}
