import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

// Simple reminder configuration collection
export const ReminderConfigs = new Mongo.Collection('reminderConfigs');

Meteor.methods({
  async 'admin.setTaskReminder'(config) {
    check(config, {
      type: String,
      message: String,
      time: String,
      enabled: Boolean
    });

    // Check admin access
    const user = await Meteor.userAsync();
    if (!user) {
      throw new Meteor.Error('not-authorized', 'You must be logged in');
    }

    // Check if user is admin (simplified check)
    const isAdmin = user.profile && user.profile.role === 'admin';
    
    if (!isAdmin) {
      throw new Meteor.Error('not-authorized', 'Admin access required');
    }

    // Save or update reminder config
    const existingConfig = await ReminderConfigs.findOneAsync({ type: config.type });
    
    if (existingConfig) {
      await ReminderConfigs.updateAsync(existingConfig._id, {
        $set: {
          message: config.message,
          time: config.time,
          enabled: config.enabled,
          updatedAt: new Date(),
          updatedBy: user._id
        }
      });
    } else {
      await ReminderConfigs.insertAsync({
        type: config.type,
        message: config.message,
        time: config.time,
        enabled: config.enabled,
        createdAt: new Date(),
        createdBy: user._id,
        updatedAt: new Date(),
        updatedBy: user._id
      });
    }

    console.log(`📅 Admin ${user.profile?.name || user.username} saved reminder config:`, {
      type: config.type,
      time: config.time,
      enabled: config.enabled
    });

    return { success: true };
  },

  async 'admin.getReminderConfigs'() {
    const user = await Meteor.userAsync();
    if (!user) {
      throw new Meteor.Error('not-authorized', 'You must be logged in');
    }

    // Check if user is admin
    const isAdmin = user.profile && user.profile.role === 'admin';
    
    if (!isAdmin) {
      throw new Meteor.Error('not-authorized', 'Admin access required');
    }

    return await ReminderConfigs.find({}).fetchAsync();
  },

  /**
   * Send overdue reminders for all overdue tasks
   */
  async 'admin.sendOverdueReminders'() {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'Must be logged in');
    }

    const user = await Meteor.users.findOneAsync(this.userId);
    const isAdmin = user.profile && user.profile.role === 'admin';
    
    if (!isAdmin) {
      throw new Meteor.Error('not-authorized', 'Admin access required');
    }

    try {
      // Import SmartNotificationService
      const { SmartNotificationService } = await import('../notifications/SmartNotificationService.js');
      const { Tasks } = await import('../tasks/TasksCollection.js');
      
      const now = new Date();
      
      // Find all overdue tasks
      const overdueTasks = await Tasks.find({
        dueDate: { $lt: now },
        status: { $ne: 'completed' }
      }).fetchAsync();

      let notifications = 0;
      const results = [];

      for (const task of overdueTasks) {
        // Send notification to each assignee
        for (const assigneeId of task.assigneeIds || []) {
          try {
            const result = await SmartNotificationService.sendTaskOverdue(assigneeId, task);
            results.push({
              taskId: task._id,
              userId: assigneeId,
              title: task.title,
              success: true,
              result
            });
            notifications++;
          } catch (error) {
            console.error('[admin.sendOverdueReminders] Error sending to user:', assigneeId, error);
            results.push({
              taskId: task._id,
              userId: assigneeId,
              title: task.title,
              success: false,
              error: error.message
            });
          }
        }
      }

      console.log(`[admin.sendOverdueReminders] Sent ${notifications} notifications for ${overdueTasks.length} overdue tasks`);
      
      return {
        sent: notifications,
        overdueTasks: overdueTasks.length,
        results
      };
    } catch (error) {
      console.error('[admin.sendOverdueReminders] Error:', error);
      throw new Meteor.Error('server-error', 'Failed to send overdue reminders');
    }
  }
});
