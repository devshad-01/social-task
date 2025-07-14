import { fetchAndStoreMetaAccounts } from '/imports/api/meta/FetchAccounts';

Meteor.startup(() => {
  fetchAndStoreMetaAccounts(); // or trigger manually if you prefer
});