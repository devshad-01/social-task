import { Meteor } from 'meteor/meteor';
import { Tasks } from '../tasks/TasksCollection';
import { ReminderConfigs } from '../reminders/methods';
import { Roles } from 'meteor/alanning:roles';
import { SmartNotificationService } from '../notifications/SmartNotificationService.js';
import cron from 'node-cron';

let cronJobs = {};

// Start scheduled task monitoring
const startScheduledTaskMonitoring = () => {
  // Check every minute for scheduled tasks that need to be activated
  cronJobs.scheduledTasks = cron.schedule('* * * * *', async () => {
    console.log('🔍 Checking for scheduled tasks to activate...');
    
    try {
      const now = new Date();
      
      // Find scheduled tasks that are due for execution (not completion)
      const scheduledTasks = await Tasks.find({
        status: 'scheduled',
        scheduledAt: { $lte: now },
        isScheduled: true
      }).fetchAsync();

      console.log(`📋 Found ${scheduledTasks.length} scheduled tasks due for activation`);

      for (const task of scheduledTasks) {
        // Update task status to pending and send notifications
        await Tasks.updateAsync(task._id, {
          $set: {
            status: 'pending',
            activatedAt: now
          }
        });

        // Send persistent notifications to assigned users (they should always see task assignments)
        if (task.assigneeIds && task.assigneeIds.length > 0) {
          const assignerUser = await Meteor.users.findOneAsync(task.createdBy);
          const assignerName = assignerUser?.profile?.fullName || assignerUser?.profile?.name || 'System';
          
          try {
            // Send persistent notification (stores in DB + TTL delivery)
            for (const userId of task.assigneeIds) {
              await SmartNotificationService.sendTaskAssignment(
                userId, 
                task.title, 
                assignerName, 
                task._id
              );
            }
            console.log(`✅ Sent persistent activation notifications for task: ${task.title}`);
          } catch (error) {
            console.error('❌ Error sending task activation notifications:', error);
          }
        }

        console.log(`✅ Activated scheduled task: ${task.title}`);
      }
    } catch (error) {
      console.error('❌ Error processing scheduled tasks:', error);
    }
  });

  console.log('✅ Scheduled task monitoring started');
};

// Start task reminders based on admin configuration
const startTaskReminders = () => {
  // Check every minute for reminder configurations that need to be processed
  cronJobs.reminders = cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const currentTime = now.getHours().toString().padStart(2, '0') + ':' + 
                         now.getMinutes().toString().padStart(2, '0');
      
      // Get enabled reminder configs for this time
      const reminderConfigs = await ReminderConfigs.find({
        enabled: true,
        time: currentTime
      }).fetchAsync();

      if (reminderConfigs.length === 0) {
        return; // No reminders for this time
      }

      for (const config of reminderConfigs) {
        await processReminderType(config);
      }
    } catch (error) {
      console.error('❌ Error processing task reminders:', error);
    }
  });

  console.log('✅ Task reminder system started');
};

// Process different types of reminders
const processReminderType = async (config) => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  let taskQuery = {};

  try {
    switch (config.type) {
      case 'due-today':
        taskQuery = {
          dueDate: {
            $gte: new Date(today.setHours(0, 0, 0, 0)),
            $lt: new Date(today.setHours(23, 59, 59, 999))
          },
          status: { $in: ['pending', 'in-progress'] }
        };
        break;
        
      case 'overdue':
        taskQuery = {
          dueDate: { $lt: new Date() },
          status: { $in: ['pending', 'in-progress'] }
        };
        break;
        
      case 'due-tomorrow':
        taskQuery = {
          dueDate: {
            $gte: new Date(tomorrow.setHours(0, 0, 0, 0)),
            $lt: new Date(tomorrow.setHours(23, 59, 59, 999))
          },
          status: { $in: ['pending', 'in-progress'] }
        };
        break;
        
      case 'high-priority':
        taskQuery = {
          priority: 'high',
          status: { $in: ['pending', 'in-progress'] }
        };
        break;
    }

    const tasks = await Tasks.find(taskQuery).fetchAsync();
    
    if (tasks.length > 0) {
      // Get all assigned users from these tasks
      const assignedUsers = new Set();
      tasks.forEach(task => {
        if (task.assigneeIds) {
          task.assigneeIds.forEach(userId => assignedUsers.add(userId));
        }
      });

      // Send smart reminders to all assigned users
      for (const userId of assignedUsers) {
        // Determine if reminder should be ephemeral or persistent
        const isEphemeral = ['due-today', 'overdue'].includes(config.type);
        
        if (isEphemeral) {
          // Ephemeral reminders (due today, overdue) - TTL only, no DB storage
          await Meteor.callAsync('notifications.sendSmart', {
            category: 'REMINDER',
            userId: userId,
            title: `⏰ ${config.type === 'overdue' ? 'Overdue' : 'Due Today'} Tasks`,
            message: config.message,
            actionUrl: '/tasks',
            data: { 
              type: 'task_reminder', 
              reminderType: config.type,
              taskCount: tasks.length 
            }
          });
        } else {
          // Persistent reminders (due tomorrow, high priority) - Store in DB
          await Meteor.callAsync('notifications.sendSmart', {
            category: 'TASK_UPDATE',
            userId: userId,
            title: `📋 ${config.type === 'due-tomorrow' ? 'Tomorrow\'s Tasks' : 'High Priority Tasks'}`,
            message: config.message,
            actionUrl: '/tasks',
            data: { 
              type: 'task_reminder', 
              reminderType: config.type,
              taskCount: tasks.length 
            }
          });
        }
      }

      console.log(`📨 Sent ${config.type} reminders to ${assignedUsers.size} users for ${tasks.length} tasks`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${config.type} reminder:`, error);
  }
};

Meteor.methods({
  async 'admin.startSimpleCron'() {
    const user = await Meteor.userAsync();
    if (!user || !(user.profile?.role === 'admin')) {
      throw new Meteor.Error('not-authorized', 'Admin access required');
    }

    // Stop existing jobs
    Object.values(cronJobs).forEach(job => {
      if (job) job.destroy();
    });
    cronJobs = {};

    // Start monitoring systems
    startScheduledTaskMonitoring();
    startTaskReminders();

    console.log('✅ Simple task management system started by admin');
    return { success: true, message: 'Task management system started' };
  },

  async 'admin.stopSimpleCron'() {
    const user = await Meteor.userAsync();
    if (!user || !(user.profile?.role === 'admin')) {
      throw new Meteor.Error('not-authorized', 'Admin access required');
    }

    Object.values(cronJobs).forEach(job => {
      if (job) job.destroy();
    });
    cronJobs = {};

    console.log('⏹️ Task management system stopped by admin');
    return { success: true, message: 'Task management system stopped' };
  }
});

// Auto-start the system when server starts
Meteor.startup(() => {
  startScheduledTaskMonitoring();
  startTaskReminders();
  console.log('🚀 Task management system auto-started');
});
