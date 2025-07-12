// /api/post/methods.js

import { check } from 'meteor/check';
import { Meteor } from 'meteor/meteor';
import { PostsCollection } from './PostsCollections.js';

Meteor.methods({
  'posts.add'(data) {
    // ✅ Destructure the incoming data including client info
    const { caption, tags, mediaUrl, type, client, clientId } = data;

    // ✅ Validate types
    check(caption, String);
    check(tags, String);
    check(mediaUrl, String);
    check(type, String);
    if (client) check(client, String); // optional
    if (clientId) check(clientId, String); // optional

    // ✅ Authorization check
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to add posts.');
    }

    // ✅ Use insertAsync for modern Meteor
    return PostsCollection.insertAsync({
      caption,
      tags,
      mediaUrl,
      type,
      client,     // ✅ Attach client name
      clientId,   // ✅ Attach client ID
      status: 'unshared',
      createdAt: new Date(),
      userId: this.userId,
    });
  },
});
