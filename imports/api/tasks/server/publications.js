import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Roles } from 'meteor/alanning:roles';
import { Tasks } from '../TasksCollection';

// Helper function to check user roles (async version for publications)
async function isUserInRole(userId, roles) {
  if (!userId) return false;
  
  // Check Meteor.users collection for profile.role using async method
  const user = await Meteor.users.findOneAsync(userId);
  if (user?.profile?.role && roles.includes(user.profile.role)) {
    return true;
  }
  
  // Fallback to Meteor Roles package if available
  if (typeof Roles !== 'undefined' && Roles.userIsInRole) {
    return Roles.userIsInRole(userId, roles);
  }
  
  return false;
}

// Publication for all tasks (admin/supervisor only)
Meteor.publish('tasks.all', async function() {
  // Check if user is logged in
  if (!this.userId) {
    return this.ready();
  }

  // Only admins and supervisors can see all tasks
  if (!(await isUserInRole(this.userId, ['admin', 'supervisor']))) {
    console.log(`[tasks.all] User ${this.userId} is not admin/supervisor, denying access`);
    return this.ready();
  }

  console.log(`[tasks.all] Publishing all tasks for admin user ${this.userId}`);
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
Meteor.publish('tasks.byClient', async function(clientId) {
  check(clientId, String);

  // Check if user is logged in
  if (!this.userId) {
    return this.ready();
  }

  // Build query based on user role
  let query = { clientId: clientId };
  
  // If not admin/supervisor, only show tasks assigned to them
  if (!(await isUserInRole(this.userId, ['admin', 'supervisor']))) {
    query.assigneeIds = this.userId;
  }

  return Tasks.find(query, {
    sort: { createdAt: -1 }
  });
});

// Publication for tasks by status
Meteor.publish('tasks.byStatus', async function(status) {
  check(status, String);

  // Check if user is logged in
  if (!this.userId) {
    return this.ready();
  }

  // Build query based on user role
  let query = { status: status };
  
  // If not admin/supervisor, only show tasks assigned to them
  if (!(await isUserInRole(this.userId, ['admin', 'supervisor']))) {
    query.assigneeIds = this.userId;
  }

  return Tasks.find(query, {
    sort: { dueDate: 1, priority: -1 }
  });
});

// Publication for overdue tasks
Meteor.publish('tasks.overdue', async function() {
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
  if (!(await isUserInRole(this.userId, ['admin', 'supervisor']))) {
    query.assigneeIds = this.userId;
  }

  return Tasks.find(query, {
    sort: { dueDate: 1, priority: -1 }
  });
});

// Publication for today's tasks
Meteor.publish('tasks.today', async function() {
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
  if (!(await isUserInRole(this.userId, ['admin', 'supervisor']))) {
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
  const canView = (await isUserInRole(this.userId, ['admin', 'supervisor', 'team-member'])) || 
                 (task.assigneeIds && task.assigneeIds.includes(this.userId));

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
  const canView = (await isUserInRole(this.userId, ['admin', 'supervisor', 'team-member'])) || 
                 (task.assigneeIds && task.assigneeIds.includes(this.userId));

  if (!canView) {
    return this.ready();
  }

  return Tasks.find(taskId);
});
