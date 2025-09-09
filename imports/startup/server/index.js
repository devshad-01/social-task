import { fetchAndStoreMetaAccounts } from '/imports/api/meta/FetchAccounts';
import '/imports/api/notifications/webPushServer';

Meteor.startup(async () => {
  try {
    await fetchAndStoreMetaAccounts();
  } catch (error) {
    console.error('❌ Error during Meta accounts fetch:', error.message);
  }
});