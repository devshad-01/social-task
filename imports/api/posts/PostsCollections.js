// imports/api/PostsCollection.js
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import 'meteor/aldeed:collection2/dynamic'; // Required for Collection2

export const PostsCollection = new Mongo.Collection('posts');

// Define the schema for the Posts collection
PostsCollection.schema = new SimpleSchema({
  // Changed from 'message' to 'caption' to match method
  caption: {
    type: String,
    max: 500,
    optional: true // Caption is optional if image is present
  },
  // Added 'tags' field
  tags: {
    type: String, // Assuming tags are a single string for now (e.g., "tag1, tag2")
    optional: true,
  },
  // Changed from 'imageUrl' to 'mediaUrl' to match method
  mediaUrl: {
    type: String,
    optional: true,
  },
  type: { // Added type to schema based on client-side usage ('text', 'image', 'video')
    type: String,
    allowedValues: ['text', 'image', 'video'],
    defaultValue: 'text'
  },
  createdAt: {
    type: Date,
    autoValue: function() {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return { $setOnInsert: new Date() };
      } else {
        this.unset();
      }
    }
  },
  // Uncommented and made required, as your method is inserting it
  userId: {
    type: String,
   // regEx: SimpleSchema.RegEx.Id,
  
  },
  // Added 'status' field
  status: {
    type: String,
    allowedValues: ['unshared', 'shared'], // Example values
    defaultValue: 'unshared',
  },
  // You might still want username or other social media IDs if needed later
  // username: {
  //   type: String,
  //   optional: true
  // },
  // facebookPostId: { type: String, optional: true },
  // instagramPostId: { type: String, optional: true },
});

// Attach the schema to the collection
// Note: Collection2.load is deprecated. Use PostsCollection.attachSchema(PostsCollection.schema);
// However, since you're using 'aldeed:collection2/dynamic', your current line might still work.
// For modern Meteor, the recommended way is:
Collection2.load(PostsCollection, PostsCollection.schema);