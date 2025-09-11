import { fetchAndStoreMetaAccounts } from '/imports/api/meta/FetchAccounts';
import '/imports/api/notifications/webPushServer';
import '/imports/api/notifications/server/publications';
import '/imports/api/cron/methodsSimple'; // Auto-start scheduled task monitoring
import '/imports/api/reminders/methods';

Meteor.startup(async () => {
  try {
    await fetchAndStoreMetaAccounts();
  } catch (error) {
    console.error('❌ Error during Meta accounts fetch:', error.message);
  }
});