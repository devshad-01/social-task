import { Meteor } from 'meteor/meteor';

Meteor.methods({
  async 'instagram.postToMedia'({ instagramUserId, accessToken, imageUrl, caption }) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to post.');
    }

    if (!instagramUserId || !accessToken || !imageUrl) {
      throw new Meteor.Error('missing-params', 'Instagram user ID, access token, and image URL are required.');
    }

    try {
      const createMediaUrl = `https://graph.facebook.com/v19.0/${instagramUserId}/media`;
      const createMediaBody = new URLSearchParams({
        image_url: imageUrl,
        access_token: accessToken,
      });
      if (caption) createMediaBody.append('caption', caption);

      const createResponse = await fetch(createMediaUrl, {
        method: 'POST',
        body: createMediaBody,
      });

      const createJson = await createResponse.json();

      if (!createResponse.ok || createJson.error) {
        throw new Meteor.Error('instagram-create-media-failed', createJson.error?.message || 'Failed to create Instagram media.');
      }

      const creationId = createJson.id;

      const publishUrl = `https://graph.facebook.com/v19.0/${instagramUserId}/media_publish`;
      const publishBody = new URLSearchParams({
        creation_id: creationId,
        access_token: accessToken,
      });

      const publishResponse = await fetch(publishUrl, {
        method: 'POST',
        body: publishBody,
      });

      const publishJson = await publishResponse.json();

      if (!publishResponse.ok || publishJson.error) {
        throw new Meteor.Error('instagram-publish-failed', publishJson.error?.message || 'Failed to publish Instagram media.');
      }

      return publishJson; // { id: 'instagram-post-id' }
    } catch (error) {
      throw new Meteor.Error('instagram-exception', error.message);
    }
  }
});
