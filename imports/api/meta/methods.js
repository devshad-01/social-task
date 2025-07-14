import { Meteor } from 'meteor/meteor';

Meteor.methods({
  async 'facebook.postToPageFeed'({ pageId, accessToken, message, mediaUrl }) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'Login required to post.');
    }

    if (!pageId || !accessToken || !mediaUrl) {
      throw new Meteor.Error('missing-params', 'Page ID, access token, and media URL are required.');
    }

    try {
      const url = `https://graph.facebook.com/v19.0/${pageId}/photos`;

      const body = new URLSearchParams();
      body.append('url', mediaUrl);
      if (message) body.append('caption', message);
      body.append('access_token', accessToken);

      const response = await fetch(url, {
        method: 'POST',
        body
      });

      const json = await response.json();

      if (!response.ok || json.error) {
        throw new Meteor.Error('facebook-post-failed', json.error?.message || 'Unknown Facebook error');
      }

      return json; // ✅ Successful post response
    } catch (error) {
      throw new Meteor.Error('facebook-exception', error.message);
    }
  }
});
