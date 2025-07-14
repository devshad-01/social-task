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
  async sendNotification({ title, message, actionUrl, icon = '/icons/icon-192.png', data = {} }) {
    console.log('[WebPushService] Sending notification:', { title, message, actionUrl, data });
    
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
      // Check if we have a service worker registration (required for mobile)
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        
        // Use service worker registration for mobile compatibility
        await registration.showNotification(title, {
          body: message,
          icon: icon,
          badge: icon,
          tag: 'posty-notification',
          requireInteraction: false, // Changed to false for better mobile UX
          data: { actionUrl, ...data },
          actions: actionUrl ? [
            {
              action: 'view',
              title: 'View',
              icon: icon
            }
          ] : [],
          vibrate: [100, 50, 100] // Add vibration for mobile
        });
        
        console.log('[WebPushService] Notification sent via service worker');
        return true;
      } else {
        // Fallback for browsers without service worker support
        const notification = new Notification(title, {
          body: message,
          icon: icon,
          badge: icon,
          tag: 'posty-notification',
          requireInteraction: true,
          data: { actionUrl, ...data }
        });

        // Handle notification click
        notification.onclick = () => {
          window.focus();
          if (actionUrl) {
            // Use router to navigate
            const event = new CustomEvent('notification-click', {
              detail: { actionUrl, data }
            });
            window.dispatchEvent(event);
          }
          notification.close();
        };

        // Auto-close after 5 seconds
        setTimeout(() => {
          notification.close();
        }, 5000);

        console.log('[WebPushService] Notification sent via Notification API');
        return true;
      }
    } catch (error) {
      console.error('[WebPushService] Failed to send notification:', error);
      return false;
    }
  },

  /**
   * Send notification to user when they're mentioned in a task
   */
  async notifyTaskAssignment(taskTitle, assignedBy, taskId) {
    return this.sendNotification({
      title: 'New Task Assigned',
      message: `${assignedBy} assigned you a task: ${taskTitle}`,
      actionUrl: `/tasks/${taskId}`,
      data: { 
        type: 'task_assigned',
        taskId: taskId 
      }
    });
  },

  /**
   * Send notification when task is completed
   */
  async notifyTaskCompleted(taskTitle, completedBy, taskId) {
    return this.sendNotification({
      title: 'Task Completed',
      message: `${completedBy} completed: ${taskTitle}`,
      actionUrl: `/tasks/${taskId}`,
      data: { 
        type: 'task_completed',
        taskId: taskId 
      }
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
