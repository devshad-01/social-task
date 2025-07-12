import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Roles } from 'meteor/alanning:roles';
import { Tasks } from './TasksCollection';

// Task creation method
Meteor.methods({
  async 'tasks.create'(taskData) {
    check(taskData, {
      title: String,
      description: Match.Optional(String),
      priority: Match.Optional(String),
      status: Match.Optional(String),
      dueDate: Match.Optional(Date),
      clientId: Match.Optional(String),
      assigneeIds: Match.Optional([String]),
      socialAccountIds: Match.Optional([String]),
      attachments: Match.Optional([Object]),
      tags: Match.Optional([String])
    });

    // Check if user is logged in
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to create tasks');
    }

    // Check if user has permission to create tasks (admin/supervisor only)
    if (!Roles.userIsInRole(this.userId, ['admin', 'supervisor'])) {
      throw new Meteor.Error('not-authorized', 'Only admins and supervisors can create tasks');
    }

    // Validate assignee IDs exist
    if (taskData.assigneeIds && taskData.assigneeIds.length > 0) {
      const assigneeCount = await Meteor.users.find({
        _id: { $in: taskData.assigneeIds }
      }).countAsync();
      
      if (assigneeCount !== taskData.assigneeIds.length) {
        throw new Meteor.Error('invalid-assignees', 'One or more assignees do not exist');
      }
    }

    // Insert the task
    const taskId = await Tasks.insertAsync({
      ...taskData,
      createdBy: this.userId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Send notifications to assignees if task is assigned
    if (taskData.assigneeIds && taskData.assigneeIds.length > 0) {
      try {
        await Meteor.callAsync('notifications.taskAssigned', taskId, taskData.assigneeIds, taskData.title);
      } catch (error) {
        console.error('Failed to send task assignment notifications:', error);
        // Don't fail the task creation if notification fails
      }
    }

    return taskId;
  },

  async 'tasks.update'(taskId, updates) {
    check(taskId, String);
    check(updates, {
      title: Match.Optional(String),
      description: Match.Optional(String),
      priority: Match.Optional(String),
      status: Match.Optional(String),
      dueDate: Match.Optional(Date),
      clientId: Match.Optional(String),
      assigneeIds: Match.Optional([String]),
      socialAccountIds: Match.Optional([String]),
      attachments: Match.Optional([Object]),
      tags: Match.Optional([String])
    });

    // Check if user is logged in
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to update tasks');
    }

    // Get the task
    const task = await Tasks.findOneAsync(taskId);
    if (!task) {
      throw new Meteor.Error('task-not-found', 'Task not found');
    }

    // Check permissions
    const isAdmin = Roles.userIsInRole(this.userId, ['admin', 'supervisor']);
    const isAssigned = task.assigneeIds && task.assigneeIds.includes(this.userId);
    
    if (!isAdmin && !isAssigned) {
      throw new Meteor.Error('not-authorized', 'You can only update tasks you are assigned to');
    }

    // Team members can only update status
    if (!isAdmin && Object.keys(updates).some(key => key !== 'status')) {
      throw new Meteor.Error('not-authorized', 'Team members can only update task status');
    }

    // Validate assignee IDs exist (if updating assignees)
    if (updates.assigneeIds && updates.assigneeIds.length > 0) {
      const assigneeCount = await Meteor.users.find({
        _id: { $in: updates.assigneeIds }
      }).countAsync();
      
      if (assigneeCount !== updates.assigneeIds.length) {
        throw new Meteor.Error('invalid-assignees', 'One or more assignees do not exist');
      }
    }

    // Update the task
    await Tasks.updateAsync(taskId, {
      $set: {
        ...updates,
        updatedAt: new Date()
      }
    });

    // Send notifications if assignees were added
    if (updates.assigneeIds && updates.assigneeIds.length > 0) {
      const oldAssignees = task.assigneeIds || [];
      const newAssignees = updates.assigneeIds.filter(id => !oldAssignees.includes(id));
      
      if (newAssignees.length > 0) {
        try {
          await Meteor.callAsync('notifications.taskAssigned', taskId, newAssignees, task.title);
        } catch (error) {
          console.error('Failed to send task assignment notifications:', error);
        }
      }
    }

    return taskId;
  },

  async 'tasks.delete'(taskId) {
    check(taskId, String);

    // Check if user is logged in
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to delete tasks');
    }

    // Only admins and supervisors can delete tasks
    if (!Roles.userIsInRole(this.userId, ['admin', 'supervisor'])) {
      throw new Meteor.Error('not-authorized', 'Only admins and supervisors can delete tasks');
    }

    // Check if task exists
    const task = await Tasks.findOneAsync(taskId);
    if (!task) {
      throw new Meteor.Error('task-not-found', 'Task not found');
    }

    // Delete the task
    await Tasks.removeAsync(taskId);
    return true;
  },

  async 'tasks.addComment'(taskId, commentText) {
    check(taskId, String);
    check(commentText, String);

    // Check if user is logged in
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to add comments');
    }

    // Get the task
    const task = await Tasks.findOneAsync(taskId);
    if (!task) {
      throw new Meteor.Error('task-not-found', 'Task not found');
    }

    // Check if user can view the task
    const canView = Roles.userIsInRole(this.userId, ['admin', 'supervisor']) || 
                   (task.assigneeIds && task.assigneeIds.includes(this.userId));
    
    if (!canView) {
      throw new Meteor.Error('not-authorized', 'You can only comment on tasks you can view');
    }

    // Add the comment
    await Tasks.updateAsync(taskId, {
      $push: {
        comments: {
          userId: this.userId,
          text: commentText,
          createdAt: new Date()
        }
      },
      $set: {
        updatedAt: new Date()
      }
    });

    return true;
  },

  async 'tasks.assignUsers'(taskId, userIds) {
    check(taskId, String);
    check(userIds, [String]);

    // Check if user is logged in
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to assign users');
    }

    // Only admins and supervisors can assign users
    if (!Roles.userIsInRole(this.userId, ['admin', 'supervisor'])) {
      throw new Meteor.Error('not-authorized', 'Only admins and supervisors can assign users to tasks');
    }

    // Check if task exists
    const task = await Tasks.findOneAsync(taskId);
    if (!task) {
      throw new Meteor.Error('task-not-found', 'Task not found');
    }

    // Validate user IDs exist
    if (userIds.length > 0) {
      const userCount = await Meteor.users.find({
        _id: { $in: userIds }
      }).countAsync();
      
      if (userCount !== userIds.length) {
        throw new Meteor.Error('invalid-users', 'One or more users do not exist');
      }
    }

    // Update assignees
    await Tasks.updateAsync(taskId, {
      $set: {
        assigneeIds: userIds,
        updatedAt: new Date()
      }
    });

    // Send notifications to newly assigned users
    if (userIds.length > 0) {
      try {
        await Meteor.callAsync('notifications.taskAssigned', taskId, userIds, task.title);
      } catch (error) {
        console.error('Failed to send task assignment notifications:', error);
      }
    }

    return true;
  },

  async 'tasks.updateStatus'(taskId, status) {
    check(taskId, String);
    check(status, String);

    // Check if user is logged in
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to update task status');
    }

    // Validate status
    const validStatuses = ['draft', 'scheduled', 'in_progress', 'completed', 'blocked'];
    if (!validStatuses.includes(status)) {
      throw new Meteor.Error('invalid-status', 'Invalid status value');
    }

    // Get the task
    const task = await Tasks.findOneAsync(taskId);
    if (!task) {
      throw new Meteor.Error('task-not-found', 'Task not found');
    }

    // Check permissions
    const isAdmin = Roles.userIsInRole(this.userId, ['admin', 'supervisor']);
    const isAssigned = task.assigneeIds && task.assigneeIds.includes(this.userId);
    
    if (!isAdmin && !isAssigned) {
      throw new Meteor.Error('not-authorized', 'You can only update status of tasks you are assigned to');
    }

    // Update the task status
    await Tasks.updateAsync(taskId, {
      $set: {
        status: status,
        updatedAt: new Date()
      }
    });

    return true;
  }
});