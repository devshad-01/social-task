import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';

// Web Push Service for sending browser notifications that work even when app is closed
export const WebPushService = {
  // VAPID keys for web push (you'll need to generate these)
  publicVapidKey: Meteor.settings.public?.vapid?.publicKey || 'YOUR_PUBLIC_VAPID_KEY',
  
  /**
   * Request notification permission and subscribe to push notifications
   */
  async requestPermissionAndSubscribe() {
    if (!('Notification' in window)) {
      console.warn('This browser does not support desktop notification');
      return null;
    }

    if (!('serviceWorker' in navigator)) {
      console.warn('This browser does not support service workers');
      return null;
    }

    // Request notification permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission denied');
      return null;
    }

    try {
      // Wait for service worker to be ready
      const registration = await navigator.serviceWorker.ready;
      
      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.publicVapidKey)
      });

      console.log('[WebPushService] Push subscription successful:', subscription);
      
      // Save subscription to server
      await this.saveSubscription(subscription);
      
      return subscription;
    } catch (error) {
      console.error('[WebPushService] Failed to subscribe to push notifications:', error);
      return null;
    }
  },

  /**
   * Save push subscription to server
   */
  async saveSubscription(subscription) {
    try {
      // Extract keys from the subscription object
      const p256dhKey = subscription.getKey('p256dh');
      const authKey = subscription.getKey('auth');
      
      await Meteor.callAsync('webPush.saveSubscription', {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: p256dhKey ? btoa(String.fromCharCode.apply(null, new Uint8Array(p256dhKey))) : null,
          auth: authKey ? btoa(String.fromCharCode.apply(null, new Uint8Array(authKey))) : null
        },
        userId: Meteor.userId()
      });
      console.log('[WebPushService] Subscription saved to server');
    } catch (error) {
      console.error('[WebPushService] Failed to save subscription:', error);
    }
  },

  /**
   * Convert VAPID key from base64 to Uint8Array
   */
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  },

  /**
   * Send immediate notification (for when app is open)
   */
  async sendImmediateNotification({ title, message, actionUrl, icon = '/icons/icon-192.png', data = {} }) {
    console.log('[WebPushService] Sending immediate notification:', { title, message, actionUrl, data });
    
    if (!('Notification' in window)) {
      console.warn('Browser does not support notifications');
      return false;
    }

    if (Notification.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return false;
    }

    try {
      // Check if we have a service worker registration
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        
        // Use service worker to show notification
        const uniqueTag = data.taskId ? `posty-task-${data.taskId}` : `posty-notification-${Date.now()}`;
        await registration.showNotification(title, {
          body: message,
          icon: icon,
          badge: icon,
          tag: uniqueTag,
          requireInteraction: false,
          data: { actionUrl, ...data },
          actions: actionUrl ? [
            {
              action: 'view',
              title: 'View',
              icon: icon
            }
          ] : [],
          vibrate: [100, 50, 100]
        });
        
        console.log('[WebPushService] Notification shown via service worker');
        return true;
      } else {
        // Fallback for browsers without service worker support
        const notification = new Notification(title, {
          body: message,
          icon: icon,
          badge: icon,
          tag: 'posty-notification',
          requireInteraction: false,
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
   * Send push notification via server (works even when app is closed)
   */
  async sendPushNotification({ title, message, actionUrl, data = {}, userIds = [] }) {
    try {
      await Meteor.callAsync('webPush.sendNotification', {
        title,
        message,
        actionUrl,
        data,
        userIds
      });
      console.log('[WebPushService] Push notification sent via server');
      return true;
    } catch (error) {
      console.error('[WebPushService] Failed to send push notification:', error);
      return false;
    }
  },

  /**
   * Send notification for task assignment (only push notifications)
   */
  async notifyTaskAssignment(taskTitle, assignedBy, taskId, assigneeIds) {
    const title = 'New Task Assigned';
    const message = `${assignedBy} assigned you a task: ${taskTitle}`;
    const actionUrl = `/tasks/${taskId}`;
    const data = { 
      type: 'task_assigned',
      taskId: taskId 
    };

    // Only send push notification via server (works when app is closed)
    await this.sendPushNotification({ title, message, actionUrl, data, userIds: assigneeIds });
    
    return true;
  },

  /**
   * Send notification when task is completed (only push notifications)
   */
  async notifyTaskCompleted(taskTitle, completedBy, taskId, adminIds) {
    const title = 'Task Completed';
    const message = `${completedBy} completed: ${taskTitle}`;
    const actionUrl = `/tasks/${taskId}`;
    const data = { 
      type: 'task_completed',
      taskId: taskId 
    };

    // Only send push notification via server
    await this.sendPushNotification({ title, message, actionUrl, data, userIds: adminIds });
    
    return true;
  },

  /**
   * Send notification when task is due soon
   */
  async notifyTaskDueSoon(taskTitle, dueTime, taskId, assigneeIds) {
    const title = 'Task Due Soon';
    const message = `Task "${taskTitle}" is due at ${dueTime}`;
    const actionUrl = `/tasks/${taskId}`;
    const data = { 
      type: 'task_due_soon',
      taskId: taskId 
    };

    await this.sendImmediateNotification({ title, message, actionUrl, data });
    await this.sendPushNotification({ title, message, actionUrl, data, userIds: assigneeIds });
    
    return true;
  },

  /**
   * Initialize push notifications when user logs in
   */
  async initialize() {
    if (Meteor.isClient && Meteor.userId()) {
      // Auto-subscribe to push notifications on login
      setTimeout(() => {
        this.requestPermissionAndSubscribe();
      }, 2000); // Wait 2 seconds after login
    }
  }
};

// Auto-initialize when the service is loaded
if (Meteor.isClient) {
  Meteor.startup(() => {
    console.log('[WebPushService] Service loaded. Will initialize on user login.');
    
    // Listen for login to initialize push notifications
    Tracker.autorun(() => {
      if (Meteor.userId()) {
        WebPushService.initialize();
      }
    });
  });
}
