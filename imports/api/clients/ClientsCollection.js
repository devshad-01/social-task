// imports/api/clients/ClientsCollection.js
import { Mongo } from 'meteor/mongo';


export const ClientsCollection = new Mongo.Collection('clients');
