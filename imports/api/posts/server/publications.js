// imports/api/posts/server/publications.js (assuming this is your file path)

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { PostsCollection } from '/imports/api/posts/PostsCollections.js'; // <--- CHANGE IS HERE

Meteor.publish('posts', function (status = 'unshared') {
  check(status, String);
  if (status === 'all') {
    return PostsCollection.find({}, { sort: { createdAt: -1 } });
  }
  return PostsCollection.find({ status }, { sort: { createdAt: -1 } });
});