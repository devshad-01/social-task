import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

// Collection to store push subscriptions
export const PushSubscriptions = new Mongo.Collection('pushSubscriptions');

if (Meteor.isServer) {
  // Publish current user's push subscriptions
  Meteor.publish('pushSubscriptions', function () {
    if (!this.userId) return this.ready();
    return PushSubscriptions.find({ userId: this.userId });
  });

  // Methods to add/remove push subscriptions
  Meteor.methods({
    'pushSubscriptions.add': async function (subscription) {
      console.log('[SERVER] pushSubscriptions.add called by user:', this.userId, 'with subscription:', subscription);
      check(subscription, Object);
      if (!this.userId) throw new Meteor.Error('not-authorized');
      // Upsert by endpoint (unique per device/browser)
      const result = await PushSubscriptions.upsertAsync(
        { 'subscription.endpoint': subscription.endpoint },
        {
          $set: {
            userId: this.userId,
            subscription,
            createdAt: new Date(),
          },
        }
      );
      console.log('[SERVER] pushSubscriptions.add upsertAsync result:', result);
    },
    'pushSubscriptions.remove'(endpoint) {
      check(endpoint, String);
      if (!this.userId) throw new Meteor.Error('not-authorized');
      PushSubscriptions.remove({ userId: this.userId, 'subscription.endpoint': endpoint });
    },
  });
}
