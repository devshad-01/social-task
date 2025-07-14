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
        
        // Use a unique tag for each notification (e.g., taskId or timestamp)
        const uniqueTag = data.taskId ? `posty-task-${data.taskId}` : `posty-notification-${Date.now()}`;
        await registration.showNotification(title, {
          body: message,
          icon: icon,
          badge: icon,
          tag: uniqueTag,
          requireInteraction: false, // Better mobile UX
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
  },

  /**
   * Subscribe the user to push notifications and send subscription to server
   */
  async subscribeUserToPush(publicVapidKey) {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service workers are not supported in this browser.');
      return null;
    }
    if (!('PushManager' in window)) {
      console.warn('Push messaging is not supported.');
      return null;
    }
    try {
      const registration = await navigator.serviceWorker.ready;
      // Subscribe the user
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(publicVapidKey)
      });
      // Send subscription to server
      Meteor.call('pushSubscriptions.add', subscription, (err) => {
        if (err) {
          console.error('Failed to save push subscription:', err);
        } else {
          console.log('Push subscription saved to server.');
        }
      });
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe user to push:', error);
      return null;
    }
  },

  /**
   * Subscribe the user to push notifications and send subscription to server
   * If already subscribed, will not duplicate. Returns the subscription or null on failure.
   */
  async ensurePushSubscription(publicVapidKey) {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push messaging is not supported.');
      return null;
    }
    try {
      const registration = await navigator.serviceWorker.ready;
      // Check if already subscribed
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(publicVapidKey)
        });
        console.log('[CLIENT] New push subscription created:', subscription);
      } else {
        console.log('[CLIENT] Existing push subscription found:', subscription);
      }
      // Send subscription to server (always as plain object)
      const plainSub = subscription && subscription.toJSON ? subscription.toJSON() : subscription;
      console.log('[CLIENT] Sending push subscription to server:', plainSub);
      Meteor.call('pushSubscriptions.add', plainSub, (err, res) => {
        if (err) {
          console.error('[CLIENT] Failed to save push subscription:', err);
        } else {
          console.log('%c[CLIENT] Push subscription saved to server successfully!','color:green;font-weight:bold');
        }
      });
      return subscription;
    } catch (error) {
      console.error('[CLIENT] Failed to ensure push subscription:', error);
      return null;
    }
  },

  /**
   * Unsubscribe the user from push notifications and remove subscription from server
   */
  async unsubscribeUserFromPush() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push messaging is not supported.');
      return false;
    }
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();
        Meteor.call('pushSubscriptions.remove', endpoint, (err) => {
          if (err) {
            console.error('[CLIENT] Failed to remove push subscription:', err);
          } else {
            console.log('%c[CLIENT] Push subscription removed from server successfully!','color:orange;font-weight:bold');
          }
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('[CLIENT] Failed to unsubscribe from push:', error);
      return false;
    }
  },

  /**
   * Utility to convert VAPID key
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
};

// Auto-request permission when the service is loaded
if (Meteor.isClient) {
  Meteor.startup(() => {
    // Don't auto-request permission on startup - wait for user interaction
    console.log('[WebPushService] Service loaded. Permission will be requested on first notification.');
  });
}
