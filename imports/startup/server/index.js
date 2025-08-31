import { fetchAndStoreMetaAccounts } from '/imports/api/meta/FetchAccounts';

Meteor.startup(async () => {
  try {
    await fetchAndStoreMetaAccounts();
  } catch (error) {
    console.error('❌ Error during Meta accounts fetch:', error.message);
  }
});