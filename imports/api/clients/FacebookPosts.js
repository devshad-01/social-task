// server/methods/facebookPosts.js

import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { Posts } from '/imports/api/posts/PostsCollections.js'; // Adjust path if necessary

Meteor.methods({
  'postToFacebook': async function({ postId, pageId, pageAccessToken, message, imageUrl }) {
    this.unblock();

    // Get pageId and pageAccessToken from settings
    const configFromSettings = Meteor.settings?.facebookPagePosting;
    const finalPageId = configFromSettings?.pageId;
    const finalPageAccessToken = configFromSettings?.pageAccessToken;

    let postContent = {};
    if (postId) {
      const dbPost = await Posts.findOneAsync(postId);
      if (!dbPost) {
        throw new Meteor.Error('post-not-found', 'Post not found in database.');
      }
      postContent.message = dbPost.message;
      postContent.imageUrl = dbPost.imageUrl;
      // *** DEBUGGING LOG ***
      console.log("Fetched post from DB (dbPost):", dbPost);
      // *** DEBUGGING LOG ***
    } else {
      // This block runs if postId is NOT provided.
      // Your client is currently sending postId, so this block is likely not used for the button click.
      postContent.message = message;
      postContent.imageUrl = imageUrl;
    }

    // *** DEBUGGING LOG ***
    console.log("Final postContent to use:", postContent);
    // *** DEBUGGING LOG ***


    // *** CRITICAL CHECK: Why are these values missing? ***
    if (!finalPageId || !finalPageAccessToken || (!postContent.message && !postContent.imageUrl)) {
      console.error("Missing parameters detected:");
      console.error("  - finalPageId present:", !!finalPageId);
      console.error("  - finalPageAccessToken present:", !!finalPageAccessToken);
      console.error("  - postContent.message present:", !!postContent.message);
      console.error("  - postContent.imageUrl present:", !!postContent.imageUrl);
      throw new Meteor.Error('missing-parameters', 'Page ID, Access Token, and either a Message or Image URL are required.');
    }

    const API_VERSION = 'v19.0';
    const graphApiBase = `https://graph.facebook.com/${API_VERSION}/`;

    let url;
    const params = {
      access_token: finalPageAccessToken,
    };

    if (postContent.imageUrl) {
      url = `${graphApiBase}${finalPageId}/photos`;
      params.url = postContent.imageUrl;
      params.caption = postContent.message || "Shared from My Meteor App!";
      console.log('Preparing to post an image to Facebook.');
    } else {
      url = `${graphApiBase}${finalPageId}/feed`;
      params.message = postContent.message;
      console.log('Preparing to post a text message to Facebook.');
    }

    try {
      console.log(`Attempting to post to Facebook Page ID: ${finalPageId}`);
      console.log(`API URL: ${url}`);
      console.log(`Payload (excluding token):`, { ...params, access_token: '***hidden***' });

      const result = await HTTP.post(url, { params: params });

      console.log('Facebook Post successful. Result:', result.data);
      return result.data;
    } catch (e) {
      console.error('Error posting to Facebook:', e);
      let errorMessage = 'An unknown error occurred while posting to Facebook.';
      if (e.response && e.response.data && e.response.data.error) {
        errorMessage = `Facebook API Error: ${e.response.data.error.message} (Code: ${e.response.data.error.code})`;
      } else if (e.message) {
        errorMessage = `Network or unexpected error: ${e.message}`;
      }
      throw new Meteor.Error(
        'facebook-api-error',
        errorMessage
      );
    }
  }
});