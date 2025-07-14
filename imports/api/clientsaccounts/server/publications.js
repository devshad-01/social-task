import { Meteor } from 'meteor/meteor';
import { ClientAccountsCollection } from '../AccountsClients.js';

Meteor.publish('clientAccounts', function () {
  return ClientAccountsCollection.find();
});
