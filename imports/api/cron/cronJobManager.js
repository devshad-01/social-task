import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Roles } from 'meteor/alanning:roles';
import { CronJobs, CRON_STATUS, CRON_TYPES } from './CronJobsCollection';
import { NotificationQueue } from '../notifications/NotificationsCollection';
import { Tasks } from '../tasks/TasksCollection';
import cron from 'node-cron';

class CronJobManager {
  constructor() {
    this.activeJobs = new Map();
    this.isInitialized = false;
  }

  /**
   * Initialize the cron system on server startup
   */
  async initialize() {
    if (this.isInitialized) return;
    
    console.log('[CronJobManager] Initializing cron job system...');
    
    try {
      // Load and start all active cron jobs
      const activeJobs = await CronJobs.find({ 
        status: CRON_STATUS.ACTIVE,
        enabled: true 
      }).fetchAsync();
      
      for (const job of activeJobs) {
        await this.startJob(job);
      }
      
      this.isInitialized = true;
      console.log(`[CronJobManager] Started ${activeJobs.length} cron jobs`);
      
    } catch (error) {
      console.error('[CronJobManager] Failed to initialize:', error);
    }
  }

  /**
   * Start a specific cron job
   */
  async startJob(jobConfig) {
    try {
      if (this.activeJobs.has(jobConfig._id)) {
        this.stopJob(jobConfig._id);
      }

      // Validate cron expression
      if (!cron.validate(jobConfig.schedule)) {
        throw new Error(`Invalid cron expression: ${jobConfig.schedule}`);
      }

      const task = cron.schedule(jobConfig.schedule, async () => {
        await this.executeJob(jobConfig);
      }, {
        scheduled: false,
        timezone: 'UTC'
      });

      task.start();
      this.activeJobs.set(jobConfig._id, task);
      
      // Update next run time
      await this.updateNextRunTime(jobConfig._id, jobConfig.schedule);
      
      console.log(`[CronJobManager] Started job: ${jobConfig.name} (${jobConfig.schedule})`);
      
    } catch (error) {
      console.error(`[CronJobManager] Failed to start job ${jobConfig.name}:`, error);
      await this.markJobError(jobConfig._id, error);
    }
  }

  /**
   * Stop a specific cron job
   */
  stopJob(jobId) {
    const task = this.activeJobs.get(jobId);
    if (task) {
      task.stop();
      task.destroy();
      this.activeJobs.delete(jobId);
      console.log(`[CronJobManager] Stopped job: ${jobId}`);
    }
  }

  /**
   * Execute a cron job with timeout and error handling
   */
  async executeJob(jobConfig) {
    const startTime = new Date();
    let success = false;
    let error = null;

    try {
      console.log(`[CronJobManager] Executing job: ${jobConfig.name}`);
      
      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Job execution timeout')), jobConfig.timeout || 300000);
      });

      // Execute the actual job
      const jobPromise = this.runJobByType(jobConfig);
      
      // Race between job execution and timeout
      await Promise.race([jobPromise, timeoutPromise]);
      
      success = true;
      console.log(`[CronJobManager] Job ${jobConfig.name} completed successfully`);
      
    } catch (err) {
      error = err;
      console.error(`[CronJobManager] Job ${jobConfig.name} failed:`, err);
    }

    // Update job statistics
    await this.updateJobStats(jobConfig._id, success, error, startTime);
    
    // Update next run time
    await this.updateNextRunTime(jobConfig._id, jobConfig.schedule);
  }

  /**
   * Route job execution based on type
   */
  async runJobByType(jobConfig) {
    switch (jobConfig.type) {
      case CRON_TYPES.NOTIFICATION_CLEANUP:
        return await this.cleanupNotifications(jobConfig.config);
        
      case CRON_TYPES.NOTIFICATION_RETRY:
        return await this.retryFailedNotifications(jobConfig.config);
        
      case CRON_TYPES.TASK_REMINDERS:
        return await this.sendTaskReminders(jobConfig.config);
        
      case CRON_TYPES.OVERDUE_NOTIFICATIONS:
        return await this.sendOverdueNotifications(jobConfig.config);
        
      case CRON_TYPES.DAILY_SUMMARY:
        return await this.generateDailySummary(jobConfig.config);
        
      case CRON_TYPES.DATA_CLEANUP:
        return await this.performDataCleanup(jobConfig.config);
        
      case CRON_TYPES.SYSTEM_HEALTH:
        return await this.checkSystemHealth(jobConfig.config);
        
      default:
        throw new Error(`Unknown job type: ${jobConfig.type}`);
    }
  }

  /**
   * Cleanup old notifications
   */
  async cleanupNotifications(config) {
    const cutoffDate = new Date(Date.now() - (config.retentionDays * 24 * 60 * 60 * 1000));
    
    const result = await NotificationQueue.removeAsync({
      $or: [
        { status: 'sent', sentAt: { $lt: cutoffDate } },
        { status: 'failed', failedAt: { $lt: cutoffDate } }
      ]
    });
    
    console.log(`[CronJobManager] Cleaned up ${result} old notifications`);
    return { cleaned: result };
  }

  /**
   * Retry failed notifications that are eligible
   */
  async retryFailedNotifications(config) {
    const retryQueue = await NotificationQueue.find({
      status: 'retry',
      scheduleAt: { $lte: new Date() },
      retryCount: { $lt: config.maxRetries || 5 }
    }).fetchAsync();
    
    let processed = 0;
    let succeeded = 0;
    
    for (const notification of retryQueue) {
      try {
        // Import notification queue service
        const { NotificationQueueService } = await import('../notifications/notificationQueue');
        await NotificationQueueService.processNotification(notification);
        succeeded++;
        processed++;
      } catch (error) {
        console.error(`[CronJobManager] Failed to retry notification ${notification._id}:`, error);
      }
    }
    
    console.log(`[CronJobManager] Processed ${processed} retry notifications, ${succeeded} succeeded`);
    return { processed, succeeded, failed: processed - succeeded };
  }

  /**
   * Send task due date reminders
   */
  async sendTaskReminders(config) {
    const now = new Date();
    const reminderTasks = [];
    
    for (const hours of config.reminderHours) {
      const dueDate = new Date(now.getTime() + (hours * 60 * 60 * 1000));
      const startRange = new Date(dueDate.getTime() - (30 * 60 * 1000)); // 30 min window
      const endRange = new Date(dueDate.getTime() + (30 * 60 * 1000));
      
      const tasks = await Tasks.find({
        dueDate: { $gte: startRange, $lte: endRange },
        status: { $ne: 'completed' }
      }).fetchAsync();
      
      reminderTasks.push(...tasks);
    }
    
    // Send reminders
    const { NotificationMethods } = await import('../notifications/methods');
    let sent = 0;
    
    for (const task of reminderTasks) {
      for (const assigneeId of task.assigneeIds || []) {
        try {
          await NotificationMethods.taskDueReminder.call({}, {
            taskId: task._id,
            userId: assigneeId,
            hoursUntilDue: Math.ceil((task.dueDate - now) / (60 * 60 * 1000))
          });
          sent++;
        } catch (error) {
          console.error(`[CronJobManager] Failed to send reminder for task ${task._id}:`, error);
        }
      }
    }
    
    console.log(`[CronJobManager] Sent ${sent} task reminders`);
    return { sent, tasks: reminderTasks.length };
  }

  /**
   * Send overdue task notifications
   */
  async sendOverdueNotifications(config) {
    const now = new Date();
    const overdueTasks = await Tasks.find({
      dueDate: { $lt: now },
      status: { $ne: 'completed' }
    }).fetchAsync();
    
    let sent = 0;
    
    for (const task of overdueTasks) {
      const daysOverdue = Math.floor((now - task.dueDate) / (24 * 60 * 60 * 1000));
      
      // Check if we should send escalation for this overdue period
      if (config.escalationLevels.includes(daysOverdue)) {
        // Send to assignees
        for (const assigneeId of task.assigneeIds || []) {
          try {
            const { NotificationMethods } = await import('../notifications/methods');
            await NotificationMethods.taskOverdue.call({}, {
              taskId: task._id,
              userId: assigneeId,
              daysOverdue
            });
            sent++;
          } catch (error) {
            console.error(`[CronJobManager] Failed to send overdue notification:`, error);
          }
        }
        
        // Escalate to managers if configured
        if (config.notifyManagers && daysOverdue >= 3) {
          const managers = await Meteor.users.find({
            'profile.role': { $in: ['admin', 'supervisor'] }
          }).fetchAsync();
          
          for (const manager of managers) {
            try {
              const { NotificationMethods } = await import('../notifications/methods');
              await NotificationMethods.taskOverdueEscalation.call({}, {
                taskId: task._id,
                managerId: manager._id,
                daysOverdue
              });
              sent++;
            } catch (error) {
              console.error(`[CronJobManager] Failed to send escalation notification:`, error);
            }
          }
        }
      }
    }
    
    console.log(`[CronJobManager] Sent ${sent} overdue notifications for ${overdueTasks.length} tasks`);
    return { sent, overdue: overdueTasks.length };
  }

  /**
   * Generate daily summary reports
   */
  async generateDailySummary(config) {
    // Implementation for daily summary reports
    console.log(`[CronJobManager] Generated daily summary (placeholder)`);
    return { generated: true };
  }

  /**
   * Sync Meta API data
   */
  async syncMetaAPI(config) {
    // Implementation for Meta API sync
    console.log(`[CronJobManager] Meta API sync (placeholder)`);
    return { synced: true };
  }

  /**
   * Update job statistics after execution
   */
  async updateJobStats(jobId, success, error, startTime) {
    const updateData = {
      lastRun: startTime,
      runCount: { $inc: 1 },
      updatedAt: new Date()
    };
    
    if (success) {
      updateData.status = CRON_STATUS.ACTIVE;
      updateData.$unset = { lastError: 1 };
    } else {
      updateData.failureCount = { $inc: 1 };
      updateData.lastError = error?.message || 'Unknown error';
      
      // Mark as error status if too many failures
      const job = await CronJobs.findOneAsync(jobId);
      if (job && job.failureCount >= (job.maxRetries || 3)) {
        updateData.status = CRON_STATUS.ERROR;
      }
    }
    
    await CronJobs.updateAsync(jobId, updateData);
  }

  /**
   * Calculate and update next run time
   */
  async updateNextRunTime(jobId, schedule) {
    try {
      // This is a simplified version - in production you'd use a proper cron parser
      const nextRun = new Date(Date.now() + 60000); // Placeholder: 1 minute from now
      
      await CronJobs.updateAsync(jobId, {
        $set: { nextRun }
      });
    } catch (error) {
      console.error(`[CronJobManager] Failed to update next run time:`, error);
    }
  }

  /**
   * Mark job with error status
   */
  async markJobError(jobId, error) {
    await CronJobs.updateAsync(jobId, {
      $set: {
        status: CRON_STATUS.ERROR,
        lastError: error.message,
        updatedAt: new Date()
      }
    });
  }

  /**
   * Restart all cron jobs (used after configuration changes)
   */
  async restartAllJobs() {
    console.log('[CronJobManager] Restarting all cron jobs...');
    
    // Stop all current jobs
    for (const [jobId] of this.activeJobs) {
      this.stopJob(jobId);
    }
    
    // Reinitialize
    this.isInitialized = false;
    await this.initialize();
  }
}

// Export singleton instance
export const cronJobManager = new CronJobManager();

// Auto-initialize on server startup
if (Meteor.isServer) {
  Meteor.startup(async () => {
    // Small delay to ensure other systems are ready
    setTimeout(async () => {
      await cronJobManager.initialize();
    }, 5000);
  });
}
