import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { Roles } from 'meteor/alanning:roles';

// Create the Tasks collection
export const Tasks = new Mongo.Collection('tasks');

// Define the schema for Tasks
const TaskSchema = new SimpleSchema({
  title: {
    type: String,
    max: 200,
    min: 1
  },
  description: {
    type: String,
    max: 2000,
    optional: true
  },
  priority: {
    type: String,
    allowedValues: ['low', 'medium', 'high'],
    defaultValue: 'medium'
  },
  status: {
    type: String,
    allowedValues: ['draft', 'scheduled', 'in_progress', 'completed', 'blocked'],
    defaultValue: 'draft'
  },
  dueDate: {
    type: Date,
    optional: true
  },
  scheduledAt: {
    type: Date,
    optional: true
  },
  clientId: {
    type: String,
    optional: true
  },
  assigneeIds: {
    type: Array,
    defaultValue: []
  },
  'assigneeIds.$': {
    type: String
  },
  socialAccountIds: {
    type: Array,
    defaultValue: []
  },
  'socialAccountIds.$': {
    type: String
  },
  attachments: {
    type: Array,
    defaultValue: []
  },
  'attachments.$': {
    type: Object
  },
  'attachments.$.name': {
    type: String
  },
  'attachments.$.url': {
    type: String
  },
  'attachments.$.type': {
    type: String
  },
  'attachments.$.size': {
    type: Number,
    optional: true
  },
  comments: {
    type: Array,
    defaultValue: []
  },
  'comments.$': {
    type: Object
  },
  'comments.$.userId': {
    type: String
  },
  'comments.$.text': {
    type: String
  },
  'comments.$.createdAt': {
    type: Date
  },
  tags: {
    type: Array,
    defaultValue: []
  },
  'tags.$': {
    type: String
  },
  createdBy: {
    type: String
  },
  createdAt: {
    type: Date,
    autoValue: function() {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return {$setOnInsert: new Date()};
      } else {
        this.unset();
      }
    }
  },
  updatedAt: {
    type: Date,
    autoValue: function() {
      return new Date();
    }
  }
});

// Export the schema for use in methods
export { TaskSchema };

// Helper functions for tasks (not collection helpers)
export const TaskHelpers = {
  isOverdue(task) {
    return task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
  },
  
  canBeEditedBy(task, userId) {
    // Check if user is admin/supervisor or assigned to task
    return Roles.userIsInRole(userId, ['admin', 'supervisor']) || 
           task.assigneeIds.includes(userId);
  },
  
  canBeViewedBy(task, userId) {
    // All users can view tasks assigned to them or if they're admin/supervisor
    return Roles.userIsInRole(userId, ['admin', 'supervisor']) || 
           task.assigneeIds.includes(userId);
  },
  
  canBeDeletedBy(task, userId) {
    // Only admins and supervisors can delete tasks
    return Roles.userIsInRole(userId, ['admin', 'supervisor']);
  }
};