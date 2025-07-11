// imports/api/posts/server/publications.js (assuming this is your file path)

import { Meteor } from 'meteor/meteor';
import { PostsCollection } from '/imports/api/posts/PostsCollections.js'; // <--- CHANGE IS HERE

Meteor.publish('posts', function() {
  // IMPORTANT: Consider your security requirements!
  // If you want users to ONLY see their own posts, use:
  // if (!this.userId) {
  //   return this.ready();
  // }
  // return PostsCollection.find({ userId: this.userId }, { sort: { createdAt: -1 } });

  // If you intend to publish ALL posts to ALL users (e.g., a public feed),
  // then the current find() is fine, but be aware of the implications.
  return PostsCollection.find({}, { sort: { createdAt: -1 } }); // Publish all posts, newest first
});