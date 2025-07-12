// imports/api/PostsCollection.js
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import 'meteor/aldeed:collection2/dynamic'; // Required for Collection2

export const PostsCollection = new Mongo.Collection('posts');

PostsCollection.schema = new SimpleSchema({
  caption: {
    type: String,
    max: 500,
    optional: true
  },
  tags: {
    type: String,
    optional: true,
  },
  mediaUrl: {
    type: String,
    optional: true,
  },
  type: {
    type: String,
    allowedValues: ['text', 'image', 'video'],
    defaultValue: 'text'
  },
  createdAt: {
    type: Date,
    autoValue: function () {
      if (this.isInsert) return new Date();
      if (this.isUpsert) return { $setOnInsert: new Date() };
      this.unset();
    }
  },
  userId: {
    type: String,
  },
  status: {
    type: String,
    allowedValues: ['unshared', 'shared'],
    defaultValue: 'unshared',
  },

  // ✅ Added client name field for filtering
  client: {
    type: String,
    optional: true, // or false if required
  },
  clientId: {
  type: String,
  optional: true, // If not every post must have a client
},
});

// Attach schema
Collection2.load(PostsCollection, PostsCollection.schema);
