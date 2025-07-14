import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { ClientAccountsCollection } from './AccountsClients.js';

const SYSTEM_USER_TOKEN = Meteor.settings.private.meta.systemUserToken;

Meteor.methods({
  async 'clientAccounts.fetchAndStore'() {
    this.unblock();

    const baseUrl = 'https://graph.facebook.com/v19.0';

    try {
      const pagesRes = HTTP.get(`${baseUrl}/me/accounts`, {
        params: {
          access_token: SYSTEM_USER_TOKEN,
        },
      });

      const pages = pagesRes.data.data;

      for (const page of pages) {
        const pageId = page.id;
        const pageName = page.name;
        const pageToken = page.access_token;

        // Get profile picture
        const pictureRes = HTTP.get(`${baseUrl}/${pageId}/picture`, {
          params: {
            access_token: SYSTEM_USER_TOKEN,
            redirect: false,
            type: 'normal',
          },
        });

        const profilePic = pictureRes.data?.data?.url || null;

        // Get connected Instagram Account
        let instagramAccount = null;
        try {
          const igRes = HTTP.get(`${baseUrl}/${pageId}`, {
            params: {
              access_token: SYSTEM_USER_TOKEN,
              fields: 'connected_instagram_account',
            },
          });

          const igId = igRes.data?.connected_instagram_account?.id;
          if (igId) {
            const igInfo = HTTP.get(`${baseUrl}/${igId}`, {
              params: {
                access_token: SYSTEM_USER_TOKEN,
                fields: 'username,profile_picture_url',
              },
            });

            instagramAccount = {
              id: igId,
              username: igInfo.data.username,
              profile_picture_url: igInfo.data.profile_picture_url,
            };
          }
        } catch (e) {
          console.warn(`No IG account linked to page ${pageName}`);
        }

        // Upsert into DB
        ClientAccountsCollection.upsert(
          { 'facebookPage.id': pageId },
          {
            $set: {
              facebookPage: {
                id: pageId,
                name: pageName,
                access_token: pageToken,
                profile_picture_url: profilePic,
              },
              instagramAccount: instagramAccount,
              updatedAt: new Date(),
            },
          }
        );
      }

      return { status: 'done', pages: pages.length };
    } catch (error) {
      console.error(error);
      throw new Meteor.Error('fetch-failed', 'Failed to fetch pages');
    }
  },
});
