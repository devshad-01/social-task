// /api/post/methods.js

import { check } from 'meteor/check';
import { Meteor } from 'meteor/meteor';
import { PostsCollection } from './PostsCollections.js';

Meteor.methods({
'posts.add'(data) { // Changed 'text' to 'data' for clarity, as you pass an object
    // Destructure the data object for easier access
    const { caption, tags, mediaUrl, type } = data;

    // Validate the incoming data
    check(caption, String);
    check(tags, String);
    check(mediaUrl, String);
    check(type, String);

    // Ensure user is logged in
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to add posts.');
    }

    // Use insertAsync() for server-side database insertion
    // Since insertAsync() returns a Promise, we should await it if we want to
    // ensure the insertion completes before the method returns, or handle the Promise.
    // For Meteor methods, returning a Promise is often sufficient, as Meteor handles it.
    return PostsCollection.insertAsync({
      caption,
      tags,
      mediaUrl,
      type,
      createdAt: new Date(),
      userId: this.userId,
      status: 'unshared',
    });
  },
});