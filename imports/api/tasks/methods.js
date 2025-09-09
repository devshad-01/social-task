import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Roles } from 'meteor/alanning:roles';
import { Tasks } from './TasksCollection';

console.log('[SERVER] Loading tasks methods file...');

// Task creation method
Meteor.methods({
  async 'tasks.insert'(taskData) {
    console.log('=== [SERVER] tasks.insert method called ===');
    console.log('[SERVER] tasks.insert] Method called with data:', taskData);
    console.log('[SERVER] tasks.insert] Called by user:', this.userId);
    console.log('[SERVER] tasks.insert] User connection:', !!this.connection);
    
    try {
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
      console.log('[SERVER] tasks.insert] Check validation passed');

      // Check if user is logged in
      if (!this.userId) {
        console.error('[SERVER] tasks.insert] No user logged in');
        throw new Meteor.Error('not-authorized', 'You must be logged in to create tasks');
      }

      // Check if user has permission to create tasks (admin/supervisor only)
      if (Roles && typeof Roles.userIsInRole === 'function' && this.userId) {
        if (!Roles.userIsInRole(this.userId, ['admin', 'supervisor'])) {
          console.error('[SERVER] tasks.insert] User does not have permission:', this.userId);
          throw new Meteor.Error('not-authorized', 'Only admins and supervisors can create tasks');
        }
      }

      console.log('[SERVER] tasks.insert] User has permission, proceeding...');

      // Validate assignee IDs exist
      if (taskData.assigneeIds && taskData.assigneeIds.length > 0) {
        console.log('[SERVER] tasks.insert] Validating assignees:', taskData.assigneeIds);
        const assigneeCount = await Meteor.users.find({
          _id: { $in: taskData.assigneeIds }
        }).countAsync();
        
        if (assigneeCount !== taskData.assigneeIds.length) {
          throw new Meteor.Error('invalid-assignees', 'One or more assignees do not exist');
        }
        console.log('[SERVER] tasks.insert] Assignees validated successfully');
      }

      // Prepare the task document
      const taskDoc = {
        title: taskData.title,
        description: taskData.description || '',
        priority: taskData.priority || 'medium',
        status: taskData.status || 'draft',
        dueDate: taskData.dueDate || null,
        clientId: taskData.clientId || null,
        assigneeIds: taskData.assigneeIds || [],
        socialAccountIds: taskData.socialAccountIds || [],
        attachments: taskData.attachments || [],
        tags: taskData.tags || [],
        comments: [],
        createdBy: this.userId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('[SERVER] tasks.insert] Inserting task with data:', taskDoc);
      
      // Insert the task without schema validation first
      const taskId = await Tasks.insertAsync(taskDoc, { validate: false });

      console.log('[SERVER] tasks.insert] Task created with ID:', taskId);

      // Send notifications to assignees if task is assigned
      if (taskData.assigneeIds && taskData.assigneeIds.length > 0) {
        console.log('[SERVER] tasks.insert] Sending notifications to assignees:', taskData.assigneeIds);
        console.log('[SERVER] tasks.insert] Debug - taskId:', taskId);
        console.log('[SERVER] tasks.insert] Debug - taskData.title:', taskData.title);
        console.log('[SERVER] tasks.insert] Debug - this.userId:', this.userId);
        console.log('[SERVER] tasks.insert] Debug - assigneeIds:', taskData.assigneeIds);
        try {
          await Meteor.callAsync('notifications.taskAssigned', {
            taskId,
            taskTitle: taskData.title,
            assignedBy: this.userId,
            assigneeIds: taskData.assigneeIds
          });
          console.log('[SERVER] tasks.insert] Notifications sent successfully');
        } catch (error) {
          console.error('[SERVER] tasks.insert] Failed to send task assignment notifications:', error);
          // Don't fail the task creation if notification fails
        }
      }

      console.log('[SERVER] tasks.insert] Method completed, returning taskId:', taskId);
      return taskId;
      
    } catch (error) {
      console.error('[SERVER] tasks.insert] Error occurred:', error);
      console.error('[SERVER] tasks.insert] Error stack:', error.stack);
      throw error;
    }
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
          await Meteor.callAsync('notifications.taskAssigned', {
            taskId,
            taskTitle: task.title,
            assignedBy: this.userId,
            assigneeIds: newAssignees
          });
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
        await Meteor.callAsync('notifications.taskAssigned', {
          taskId,
          taskTitle: task.title,
          assignedBy: this.userId,
          assigneeIds: userIds
        });
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
    const isAdmin = (Roles && typeof Roles.userIsInRole === 'function' && this.userId) 
      ? Roles.userIsInRole(this.userId, ['admin', 'supervisor'])
      : false;
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

    // Send notifications when task is completed
    if (status === 'completed') {
      try {
        const currentUser = await Meteor.users.findOneAsync(this.userId);
        const userName = currentUser?.profile?.fullName || currentUser?.emails?.[0]?.address || 'Someone';
        
        // Get all admins and supervisors to notify
        const adminUsers = await Meteor.users.find({
          'profile.role': { $in: ['admin', 'supervisor'] }
        }).fetchAsync();
        const adminIds = adminUsers.map(user => user._id);
        
        await Meteor.callAsync('notifications.taskCompleted', {
          taskId,
          taskTitle: task.title,
          completedBy: this.userId,
          adminIds
        });
        console.log('[SERVER] tasks.updateStatus] Task completion notification sent');
      } catch (error) {
        console.error('[SERVER] tasks.updateStatus] Failed to send completion notification:', error);
      }
    }

    return true;
  }
});