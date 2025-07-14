import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Roles } from 'meteor/alanning:roles';
import { Tasks } from '../TasksCollection';

// Helper function to safely check user roles
const isUserInRole = (userId, roles) => {
  return Roles && typeof Roles.userIsInRole === 'function' && 
         Roles.userIsInRole(userId, roles);
};

// Publication for all tasks (admin/supervisor only)
Meteor.publish('tasks.all', function() {
  // Check if user is logged in
  if (!this.userId) {
    return this.ready();
  }

  // Only admins and supervisors can see all tasks
  if (!isUserInRole(this.userId, ['admin', 'supervisor'])) {
    return this.ready();
  }

  return Tasks.find({}, {
    sort: { createdAt: -1 }
  });
});

// Publication for user's assigned tasks
Meteor.publish('tasks.assigned', function() {
  // Check if user is logged in
  if (!this.userId) {
    return this.ready();
  }

  // Return tasks assigned to the current user
  return Tasks.find({
    assigneeIds: this.userId
  }, {
    sort: { dueDate: 1, priority: -1 }
  });
});

// Publication for tasks by client
Meteor.publish('tasks.byClient', function(clientId) {
  check(clientId, String);

  // Check if user is logged in
  if (!this.userId) {
    return this.ready();
  }

  // Build query based on user role
  let query = { clientId: clientId };
  
  // If not admin/supervisor, only show tasks assigned to them
  if (!isUserInRole(this.userId, ['admin', 'supervisor'])) {
    query.assigneeIds = this.userId;
  }

  return Tasks.find(query, {
    sort: { createdAt: -1 }
  });
});

// Publication for tasks by status
Meteor.publish('tasks.byStatus', function(status) {
  check(status, String);

  // Check if user is logged in
  if (!this.userId) {
    return this.ready();
  }

  // Build query based on user role
  let query = { status: status };
  
  // If not admin/supervisor, only show tasks assigned to them
  if (!isUserInRole(this.userId, ['admin', 'supervisor'])) {
    query.assigneeIds = this.userId;
  }

  return Tasks.find(query, {
    sort: { dueDate: 1, priority: -1 }
  });
});

// Publication for overdue tasks
Meteor.publish('tasks.overdue', function() {
  // Check if user is logged in
  if (!this.userId) {
    return this.ready();
  }

  // Build query based on user role
  let query = {
    dueDate: { $lt: new Date() },
    status: { $ne: 'completed' }
  };
  
  // If not admin/supervisor, only show tasks assigned to them
  if (!isUserInRole(this.userId, ['admin', 'supervisor'])) {
    query.assigneeIds = this.userId;
  }

  return Tasks.find(query, {
    sort: { dueDate: 1, priority: -1 }
  });
});

// Publication for today's tasks
Meteor.publish('tasks.today', function() {
  // Check if user is logged in
  if (!this.userId) {
    return this.ready();
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // Build query based on user role
  let query = {
    dueDate: {
      $gte: startOfDay,
      $lte: endOfDay
    }
  };
  
  // If not admin/supervisor, only show tasks assigned to them
  if (!isUserInRole(this.userId, ['admin', 'supervisor'])) {
    query.assigneeIds = this.userId;
  }

  return Tasks.find(query, {
    sort: { dueDate: 1, priority: -1 }
  });
});

// Publication for task statistics
Meteor.publish('tasks.stats', function() {
  // Check if user is logged in
  if (!this.userId) {
    return this.ready();
  }

  // This will be handled by a reactive method instead
  return this.ready();
});

// Publication for single task
Meteor.publish('tasks.single', async function(taskId) {
  check(taskId, String);

  // Check if user is logged in
  if (!this.userId) {
    return this.ready();
  }

  // Get the task using async method
  const task = await Tasks.findOneAsync(taskId);
  if (!task) {
    return this.ready();
  }

  // Check if user can view the task (with defensive check for Roles)
  const canView = isUserInRole(this.userId, ['admin', 'supervisor']) || 
                 task.assigneeIds.includes(this.userId);

  if (!canView) {
    return this.ready();
  }

  return Tasks.find(taskId);
});

// Alias for tasks.single for consistency
Meteor.publish('tasks.byId', async function(taskId) {
  check(taskId, String);

  // Check if user is logged in
  if (!this.userId) {
    return this.ready();
  }

  // Get the task using async method
  const task = await Tasks.findOneAsync(taskId);
  if (!task) {
    return this.ready();
  }

  // Check if user can view the task (with defensive check for Roles)
  const canView = isUserInRole(this.userId, ['admin', 'supervisor']) || 
                 task.assigneeIds.includes(this.userId);

  if (!canView) {
    return this.ready();
  }

  return Tasks.find(taskId);
});
