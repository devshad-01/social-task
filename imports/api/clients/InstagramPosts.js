// server/methods/instagramPosts.js
import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { Posts } from '/imports/api/posts/PostsCollections.js';

Meteor.methods({
  'postToInstagram': async function({ postId }) {
    this.unblock(); // Allows other methods to run concurrently

    console.log("--- Method 'postToInstagram' called ---");
    console.log("Received postId from client:", postId);

    // 1. Get Instagram config from Meteor.settings.private
    const instagramConfig = Meteor.settings?.instagramPosting;
    const instagramBusinessAccountId = instagramConfig?.instagramBusinessAccountId;
    const longLivedUserAccessToken = instagramConfig?.longLivedUserAccessToken;
    const API_VERSION = 'v19.0'; // Ensure this matches the Facebook Graph API version

    console.log("Instagram Business Account ID from settings:", instagramBusinessAccountId);
    console.log("Long-Lived User Access Token (first 10 chars):", longLivedUserAccessToken?.substring(0, 10) + '...');

    // 2. Validate configuration and postId
    if (!instagramBusinessAccountId || !longLivedUserAccessToken) {
      console.error("Missing Instagram API configuration in Meteor.settings.private.instagramPosting");
      throw new Meteor.Error('missing-instagram-config', 'Instagram API configuration is missing.');
    }
    if (!postId) {
      throw new Meteor.Error('missing-postId', 'A postId is required to post to Instagram.');
    }

    // 3. Fetch post content from your Posts collection
    const dbPost = await Posts.findOneAsync(postId);
    if (!dbPost) {
      throw new Meteor.Error('post-not-found', 'Post not found in database.');
    }

    const { message: caption, imageUrl } = dbPost; // Destructure and rename 'message' to 'caption' for Instagram
    console.log("Fetched post from DB (dbPost):", dbPost);
    console.log("Instagram caption:", caption);
    console.log("Instagram imageUrl:", imageUrl);

    if (!imageUrl) {
      throw new Meteor.Error('missing-image', 'Instagram posts require an image URL.');
    }

    // --- Instagram API Steps ---

    const graphApiBase = `https://graph.facebook.com/${API_VERSION}/`;

    try {
      // Step A: Create Media Container
      console.log('--- Instagram Step 1: Creating Media Container ---');
      const createMediaUrl = `${graphApiBase}${instagramBusinessAccountId}/media`;
      const createMediaParams = {
        image_url: imageUrl,
        caption: caption || "Shared from My Meteor App!", // Instagram caption
        access_token: longLivedUserAccessToken,
      };

      console.log(`Creating media container at URL: ${createMediaUrl}`);
      console.log(`Payload (excluding token):`, { ...createMediaParams, access_token: '***hidden***' });

      const createMediaResult = await HTTP.post(createMediaUrl, { params: createMediaParams });
      const creationId = createMediaResult.data.id;
      console.log('Media Container created. creation_id:', creationId);

      // Step B: Optional - Poll for Container Status (Good practice for robustness)
      // Instagram takes a moment to process the image/video.
      // For simplicity, we'll wait a short fixed amount here, but polling is more robust.
      console.log('--- Instagram Step 2: Checking Media Container Status (waiting 5 seconds) ---');
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds

      let statusCheckResult;
      try {
        const statusCheckUrl = `${graphApiBase}${creationId}`;
        const statusCheckParams = {
          fields: 'status_code',
          access_token: longLivedUserAccessToken,
        };
        statusCheckResult = await HTTP.get(statusCheckUrl, { params: statusCheckParams });
        console.log('Container status check result:', statusCheckResult.data);

        if (statusCheckResult.data.status_code !== 'FINISHED') {
            console.warn(`Instagram container status is not FINISHED (${statusCheckResult.data.status_code}). Attempting to publish anyway, but this might fail.`);
            // In a production app, you might want a loop to poll or use webhooks.
        }
      } catch (statusError) {
          console.error("Error checking Instagram container status, proceeding anyway:", statusError);
      }


      // Step C: Publish the Media Container
      console.log('--- Instagram Step 3: Publishing Media Container ---');
      const publishMediaUrl = `${graphApiBase}${instagramBusinessAccountId}/media_publish`;
      const publishMediaParams = {
        creation_id: creationId,
        access_token: longLivedUserAccessToken,
      };

      console.log(`Publishing media from container at URL: ${publishMediaUrl}`);
      console.log(`Payload (excluding token):`, { ...publishMediaParams, access_token: '***hidden***' });

      const publishMediaResult = await HTTP.post(publishMediaUrl, { params: publishMediaParams });

      console.log('Instagram Post successful. Result:', publishMediaResult.data);
      return publishMediaResult.data;

    } catch (e) {
      console.error('Error posting to Instagram:', e);
      let errorMessage = 'An unknown error occurred while posting to Instagram.';
      if (e.response && e.response.data && e.response.data.error) {
        errorMessage = `Instagram API Error: ${e.response.data.error.message} (Code: ${e.response.data.error.code})`;
      } else if (e.message) {
        errorMessage = `Network or unexpected error: ${e.message}`;
      }
      throw new Meteor.Error(
        'instagram-api-error',
        errorMessage
      );
    }
  }
});