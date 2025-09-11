import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import webpush from 'web-push';

// Initialize web-push with VAPID keys
const vapidKeys = Meteor.settings.private?.vapid || {};
if (vapidKeys.publicKey && vapidKeys.privateKey) {
  webpush.setVapidDetails(
    'mailto:' + (Meteor.settings.private?.email?.from || 'admin@posty.com'),
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );
  console.log('✅ Web Push VAPID configured');
} else {
  console.warn('⚠️ Web Push VAPID keys not configured. Push notifications will not work when app is closed.');
}

// Collection to store push subscriptions
import { Mongo } from 'meteor/mongo';
export const PushSubscriptions = new Mongo.Collection('pushSubscriptions');

// Server-side methods for web push notifications
Meteor.methods({
  /**
   * Save a push subscription for a user
   */
  async 'webPush.saveSubscription'(subscriptionData) {
    check(subscriptionData, {
      endpoint: String,
      keys: {
        p256dh: String,
        auth: String
      },
      userId: String
    });

    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'Must be logged in');
    }

    if (this.userId !== subscriptionData.userId) {
      throw new Meteor.Error('not-authorized', 'Can only save subscription for yourself');
    }

    try {
      // Remove any existing subscription for this user
      await PushSubscriptions.removeAsync({ userId: this.userId });

      // Save new subscription
      const subscriptionId = await PushSubscriptions.insertAsync({
        endpoint: subscriptionData.endpoint,
        keys: subscriptionData.keys,
        subscription: subscriptionData,
        userId: this.userId,
        createdAt: new Date(),
        isActive: true
      });

      console.log(`✅ Push subscription saved for user ${this.userId}`);
      return subscriptionId;
    } catch (error) {
      console.error('❌ Error saving push subscription:', error);
      throw new Meteor.Error('subscription-save-failed', 'Failed to save push subscription');
    }
  },

  /**
   * Send a test push notification to the current user
   */
  async 'webPush.sendTestNotification'() {
    this.unblock();
    
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to send test notifications');
    }

    try {
      const user = await Meteor.users.findOneAsync(this.userId);
      const subscription = await PushSubscriptions.findOneAsync({ userId: this.userId });
      
      if (!subscription) {
        throw new Meteor.Error('no-subscription', 'No push subscription found. Please enable notifications first.');
      }

      const notificationPayload = {
        title: 'Test Notification 🚀',
        body: `Hi ${user.profile?.name || user.username || 'there'}! This is a test push notification that should work even when the app is closed.`,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-96.png',
        tag: 'test-notification',
        data: {
          type: 'test',
          userId: this.userId,
          timestamp: new Date().toISOString(),
          actionUrl: '/dashboard'
        }
      };

      await webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: subscription.keys
        },
        JSON.stringify(notificationPayload)
      );

      console.log('✅ Test notification sent successfully to user:', this.userId);
      return { success: true, message: 'Test notification sent successfully!' };

    } catch (error) {
      console.error('❌ Failed to send test notification:', error);
      throw new Meteor.Error('notification-failed', 'Failed to send test notification: ' + error.message);
    }
  },

  /**
   * Remove push subscription for a user (when they go offline/unsubscribe)
   */
  async 'webPush.removeSubscription'() {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'Must be logged in');
    }

    try {
      // Remove the subscription
      const result = await PushSubscriptions.removeAsync({ userId: this.userId });

      console.log(`✅ Push subscription removed for user ${this.userId}`);
      return { success: true, removed: result };
    } catch (error) {
      console.error('❌ Error removing push subscription:', error);
      throw new Meteor.Error('subscription-remove-failed', 'Failed to remove push subscription');
    }
  },

  /**
   * Send push notification to specific users
   */
  async 'webPush.sendNotification'(notificationData) {
    check(notificationData, {
      title: String,
      message: String,
      actionUrl: Match.Optional(String),
      data: Match.Optional(Object),
      userIds: [String]
    });

    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'Must be logged in');
    }

    try {
      const { title, message, actionUrl, data = {}, userIds } = notificationData;

      // Get push subscriptions for target users
      const subscriptions = await PushSubscriptions.find({
        userId: { $in: userIds },
        isActive: true
      }).fetchAsync();

      if (subscriptions.length === 0) {
        console.log('📭 No active push subscriptions found for users:', userIds);
        return { sent: 0, failed: 0 };
      }

      const payload = JSON.stringify({
        title,
        body: message,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        actionUrl,
        data: {
          ...data,
          timestamp: Date.now()
        }
      });

      let sent = 0;
      let failed = 0;

      // Send push notification to each subscription
      const promises = subscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification({
            endpoint: subscription.endpoint,
            keys: subscription.keys
          }, payload);
          
          sent++;
          console.log(`✅ Push notification sent to user ${subscription.userId}`);
        } catch (error) {
          failed++;
          console.error(`❌ Failed to send push notification to user ${subscription.userId}:`, error);
          
          // If subscription is invalid, mark as inactive
          if (error.statusCode === 410 || error.statusCode === 404) {
            await PushSubscriptions.updateAsync(
              { _id: subscription._id },
              { $set: { isActive: false } }
            );
          }
        }
      });

      await Promise.all(promises);

      console.log(`📊 Push notification results: ${sent} sent, ${failed} failed`);
      return { sent, failed };
    } catch (error) {
      console.error('❌ Error sending push notifications:', error);
      throw new Meteor.Error('notification-send-failed', 'Failed to send push notifications');
    }
  }
});

/**
 * Send push notification to a specific user (for queue processing)
 */
export const sendPushNotificationToUser = async ({ userId, title, message, actionUrl, data = {} }) => {
  try {
    // Get user's push subscription
    const subscription = await PushSubscriptions.findOneAsync({ userId, isActive: true });
    
    if (!subscription) {
      return { success: false, error: 'No active push subscription found for user' };
    }

    const payload = JSON.stringify({
      title,
      body: message,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      actionUrl,
      data: {
        ...data,
        timestamp: Date.now(),
        userId
      }
    });

    await webpush.sendNotification({
      endpoint: subscription.endpoint,
      keys: subscription.keys
    }, payload);

    return { success: true };
  } catch (error) {
    console.error(`Failed to send push notification to user ${userId}:`, error);
    
    // If subscription is invalid, mark as inactive
    if (error.statusCode === 410 || error.statusCode === 404) {
      await PushSubscriptions.updateAsync(
        { userId },
        { $set: { isActive: false } }
      );
    }
    
    return { success: false, error: error.message };
  }
};

// Server-side publications
Meteor.publish('pushSubscriptions.own', function() {
  if (!this.userId) {
    return this.ready();
  }
  
  return PushSubscriptions.find({ userId: this.userId });
});
