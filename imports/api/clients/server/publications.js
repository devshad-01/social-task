// imports/api/clients/server/publications.js
import { Meteor } from 'meteor/meteor';
import { ClientsCollection } from '../ClientsCollection';

Meteor.publish('clients', function () {
  return ClientsCollection.find();
});
