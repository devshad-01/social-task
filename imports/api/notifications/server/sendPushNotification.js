import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { PushSubscriptions } from '../PushSubscriptionsCollection';
import webpush from 'web-push';

// Get VAPID keys from Meteor settings
const VAPID_PUBLIC_KEY = Meteor.settings.vapid && Meteor.settings.vapid.publicKey;
const VAPID_PRIVATE_KEY = Meteor.settings.vapid && Meteor.settings.vapid.privateKey;
const VAPID_SUBJECT = (Meteor.settings.vapid && Meteor.settings.vapid.email) || 'mailto:admin@example.com';

if (Meteor.isServer) {
  webpush.setVapidDetails(
    VAPID_SUBJECT,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );

  Meteor.methods({
    /**
     * Send a push notification to a user's devices
     * @param {String} userId - The user to notify
     * @param {Object} payload - The notification payload (object will be stringified)
     */
    async 'pushNotifications.send'(userId, payload) {
      check(userId, String);
      check(payload, Object);
      if (!this.userId) throw new Meteor.Error('not-authorized');
      // Allow sending to any user as long as the sender is logged in
      console.log('[PUSH] pushNotifications.send called for user:', userId, 'by:', this.userId);
      // FIX: Await the fetch() call to get the array, not a Promise
      const subscriptions = await PushSubscriptions.find({ userId }).fetch();
      let endpoints = [];
      if (Array.isArray(subscriptions)) {
        endpoints = subscriptions.map(s => s.subscription?.endpoint);
      } else if (subscriptions && typeof subscriptions.forEach === 'function') {
        endpoints = Array.from(subscriptions).map(s => s.subscription?.endpoint);
      } else {
        console.error('[PUSH] Subscriptions is not an array or iterable:', subscriptions);
      }
      console.log('[PUSH] Subscriptions found:', Array.isArray(subscriptions) ? subscriptions.length : 'not array', endpoints);
      if (!Array.isArray(subscriptions) || !subscriptions.length) {
        console.error('[PUSH] No subscriptions found for user:', userId);
        throw new Meteor.Error('no-subscriptions');
      }
      const results = [];
      for (const sub of subscriptions) {
        try {
          console.log('[PUSH] Sending push to endpoint:', sub.subscription.endpoint, 'with payload:', payload);
          await webpush.sendNotification(sub.subscription, JSON.stringify(payload));
          results.push({ endpoint: sub.subscription.endpoint, success: true });
          console.log('[PUSH] Push sent successfully to:', sub.subscription.endpoint);
        } catch (err) {
          // Remove invalid subscriptions
          if (err.statusCode === 410 || err.statusCode === 404) {
            console.warn('[PUSH] Removing invalid subscription:', sub.subscription.endpoint, 'Error:', err.message);
            await PushSubscriptions.removeAsync({ _id: sub._id });
          }
          results.push({ endpoint: sub.subscription.endpoint, success: false, error: err.message });
          console.error('[PUSH] Failed to send push to:', sub.subscription.endpoint, err);
        }
      }
      return results;
    },
  });
}
