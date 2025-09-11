import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Roles } from 'meteor/alanning:roles';
import { CronJobs } from './CronJobsCollection';
import { cronJobManager } from './cronJobManager';

// Ensure admin-only access
function requireAdmin(userId) {
  if (!userId) {
    throw new Meteor.Error('not-authorized', 'Must be logged in');
  }
  
  // Check both Roles package and profile role
  const user = Meteor.users.findOne(userId);
  const isAdmin = (user?.profile?.role === 'admin') || 
                  (Roles && typeof Roles.userIsInRole === 'function' && Roles.userIsInRole(userId, ['admin']));
  
  if (!isAdmin) {
    throw new Meteor.Error('not-authorized', 'Admin access required');
  }
}

Meteor.methods({
  /**
   * Simple method to create a new cron job
   */
  'cronJobs.create'(jobData) {
    requireAdmin(this.userId);
    
    check(jobData, {
      name: String,
      description: Match.Optional(String),
      cronExpression: String,
      taskType: String,
      taskData: Match.Optional(Object),
      isActive: Match.Optional(Boolean)
    });

    const jobId = CronJobs.insert({
      name: jobData.name,
      description: jobData.description || '',
      cronExpression: jobData.cronExpression,
      taskType: jobData.taskType,
      taskData: jobData.taskData || {},
      isActive: jobData.isActive !== false,
      status: 'stopped',
      runCount: 0,
      successCount: 0,
      errorCount: 0,
      createdAt: new Date(),
      createdBy: this.userId,
      updatedAt: new Date(),
      updatedBy: this.userId
    });

    // Start the job if it's active
    if (jobData.isActive !== false) {
      try {
        cronJobManager.addJob(jobId);
      } catch (error) {
        console.error('Failed to start cron job:', error);
      }
    }

    return jobId;
  },

  /**
   * Toggle job active status
   */
  'cronJobs.toggle'(jobId, isActive) {
    requireAdmin(this.userId);
    
    check(jobId, String);
    check(isActive, Boolean);

    const job = CronJobs.findOne(jobId);
    if (!job) {
      throw new Meteor.Error('not-found', 'Job not found');
    }

    CronJobs.update(jobId, {
      $set: {
        isActive: isActive,
        status: isActive ? 'running' : 'stopped',
        updatedAt: new Date(),
        updatedBy: this.userId
      }
    });

    try {
      if (isActive) {
        cronJobManager.addJob(jobId);
      } else {
        cronJobManager.removeJob(jobId);
      }
    } catch (error) {
      console.error('Failed to toggle cron job:', error);
    }

    return true;
  },

  /**
   * Remove a cron job
   */
  'cronJobs.remove'(jobId) {
    requireAdmin(this.userId);
    
    check(jobId, String);

    const job = CronJobs.findOne(jobId);
    if (!job) {
      throw new Meteor.Error('not-found', 'Job not found');
    }

    // Stop the job first
    try {
      cronJobManager.removeJob(jobId);
    } catch (error) {
      console.error('Failed to stop cron job:', error);
    }
    
    // Remove from database
    CronJobs.remove(jobId);

    return true;
  },

  /**
   * Run a job immediately
   */
  'cronJobs.runNow'(jobId) {
    requireAdmin(this.userId);
    
    check(jobId, String);

    const job = CronJobs.findOne(jobId);
    if (!job) {
      throw new Meteor.Error('not-found', 'Job not found');
    }

    // Execute the job immediately
    try {
      cronJobManager.executeJob(jobId);
      return { success: true, message: 'Job started successfully' };
    } catch (error) {
      throw new Meteor.Error('execution-failed', `Failed to run job: ${error.message}`);
    }
  }
});
    
    const query = {};
    
    // Build query from filter
    if (filter.status) {
      query.status = filter.status;
    }
    
    if (filter.type) {
      query.type = filter.type;
    }
    
    if (filter.enabled !== undefined) {
      query.enabled = filter.enabled;
    }
    
    if (filter.search) {
      query.$or = [
        { name: { $regex: filter.search, $options: 'i' } },
        { description: { $regex: filter.search, $options: 'i' } },
        { tags: { $in: [new RegExp(filter.search, 'i')] } }
      ];
    }
    
    const cronJobs = CronJobs.find(query, {
      sort: { priority: -1, name: 1 },
      limit: options.limit || 50,
      skip: options.skip || 0
    }).fetch();
    
    const total = CronJobs.find(query).count();
    
    return {
      jobs: cronJobs,
      total,
      hasMore: total > ((options.skip || 0) + cronJobs.length)
    };
  },

  /**
   * Create a new cron job
   */
  async 'cronJobs.create'(jobData) {
    requireAdmin(this.userId);
    
    check(jobData, {
      name: String,
      type: String,
      description: String,
      schedule: String,
      enabled: Boolean,
      config: Object,
      timeout: Match.Optional(Number),
      maxRetries: Match.Optional(Number),
      tags: Match.Optional([String]),
      priority: Match.Optional(Number)
    });
    
    // Validate cron expression (simplified validation)
    if (!this.isValidCronExpression(jobData.schedule)) {
      throw new Meteor.Error('invalid-schedule', 'Invalid cron expression');
    }
    
    const now = new Date();
    const cronJob = {
      ...jobData,
      status: jobData.enabled ? CRON_STATUS.ACTIVE : CRON_STATUS.PAUSED,
      timeout: jobData.timeout || 300000,
      maxRetries: jobData.maxRetries || 3,
      tags: jobData.tags || [],
      priority: jobData.priority || 3,
      
      // Initialize tracking
      runCount: 0,
      failureCount: 0,
      
      // Admin tracking
      createdBy: this.userId,
      createdAt: now,
      updatedAt: now
    };
    
    const jobId = await CronJobs.insertAsync(cronJob);
    
    // Start the job if enabled
    if (jobData.enabled) {
      const job = await CronJobs.findOneAsync(jobId);
      await cronJobManager.startJob(job);
    }
    
    return jobId;
  },

  /**
   * Update an existing cron job
   */
  async 'cronJobs.update'(jobId, updates) {
    requireAdmin(this.userId);
    
    check(jobId, String);
    check(updates, Object);
    
    const job = await CronJobs.findOneAsync(jobId);
    if (!job) {
      throw new Meteor.Error('not-found', 'Cron job not found');
    }
    
    // If schedule is being updated, validate it
    if (updates.schedule && !this.isValidCronExpression(updates.schedule)) {
      throw new Meteor.Error('invalid-schedule', 'Invalid cron expression');
    }
    
    const updateData = {
      ...updates,
      updatedAt: new Date()
    };
    
    await CronJobs.updateAsync(jobId, { $set: updateData });
    
    // Restart job if it was running and schedule/config changed
    if ((updates.schedule || updates.config) && job.enabled) {
      cronJobManager.stopJob(jobId);
      const updatedJob = await CronJobs.findOneAsync(jobId);
      await cronJobManager.startJob(updatedJob);
    }
    
    return true;
  },

  /**
   * Enable/disable a cron job
   */
  async 'cronJobs.toggle'(jobId, enabled) {
    requireAdmin(this.userId);
    
    check(jobId, String);
    check(enabled, Boolean);
    
    const job = await CronJobs.findOneAsync(jobId);
    if (!job) {
      throw new Meteor.Error('not-found', 'Cron job not found');
    }
    
    await CronJobs.updateAsync(jobId, {
      $set: {
        enabled,
        status: enabled ? CRON_STATUS.ACTIVE : CRON_STATUS.PAUSED,
        updatedAt: new Date()
      }
    });
    
    if (enabled) {
      const updatedJob = await CronJobs.findOneAsync(jobId);
      await cronJobManager.startJob(updatedJob);
    } else {
      cronJobManager.stopJob(jobId);
    }
    
    return true;
  },

  /**
   * Delete a cron job
   */
  async 'cronJobs.delete'(jobId) {
    requireAdmin(this.userId);
    
    check(jobId, String);
    
    const job = await CronJobs.findOneAsync(jobId);
    if (!job) {
      throw new Meteor.Error('not-found', 'Cron job not found');
    }
    
    // Stop the job first
    cronJobManager.stopJob(jobId);
    
    // Delete from database
    await CronJobs.removeAsync(jobId);
    
    return true;
  },

  /**
   * Manually execute a cron job (for testing)
   */
  async 'cronJobs.execute'(jobId) {
    requireAdmin(this.userId);
    
    check(jobId, String);
    
    const job = await CronJobs.findOneAsync(jobId);
    if (!job) {
      throw new Meteor.Error('not-found', 'Cron job not found');
    }
    
    try {
      await cronJobManager.executeJob(job);
      return { success: true };
    } catch (error) {
      throw new Meteor.Error('execution-failed', error.message);
    }
  },

  /**
   * Get cron job execution history/logs
   */
  'cronJobs.getHistory'(jobId, limit = 10) {
    requireAdmin(this.userId);
    
    check(jobId, String);
    check(limit, Number);
    
    // This would require a separate CronJobLogs collection
    // For now, return basic job info
    const job = CronJobs.findOne(jobId);
    if (!job) {
      throw new Meteor.Error('not-found', 'Cron job not found');
    }
    
    return {
      job,
      executions: [] // Placeholder for execution history
    };
  },

  /**
   * Initialize default cron jobs (run once on setup)
   */
  async 'cronJobs.initializeDefaults'() {
    requireAdmin(this.userId);
    
    let created = 0;
    
    for (const defaultJob of DEFAULT_CRON_JOBS) {
      const existing = await CronJobs.findOneAsync({ type: defaultJob.type });
      
      if (!existing) {
        const jobData = {
          ...defaultJob,
          createdBy: this.userId,
          createdAt: new Date(),
          updatedAt: new Date(),
          runCount: 0,
          failureCount: 0
        };
        
        const jobId = await CronJobs.insertAsync(jobData);
        
        // Start if enabled
        if (defaultJob.enabled) {
          const job = await CronJobs.findOneAsync(jobId);
          await cronJobManager.startJob(job);
        }
        
        created++;
      }
    }
    
    return { created };
  },

  /**
   * Get system cron job statistics
   */
  'cronJobs.getStats'() {
    requireAdmin(this.userId);
    
    const stats = {
      total: CronJobs.find().count(),
      active: CronJobs.find({ status: CRON_STATUS.ACTIVE }).count(),
      paused: CronJobs.find({ status: CRON_STATUS.PAUSED }).count(),
      error: CronJobs.find({ status: CRON_STATUS.ERROR }).count(),
      enabled: CronJobs.find({ enabled: true }).count(),
      runningJobs: cronJobManager.activeJobs.size
    };
    
    return stats;
  }
});

// Helper method for cron validation
Meteor.methods({
  isValidCronExpression(expression) {
    // Basic validation - in production use a proper cron parser library
    const parts = expression.trim().split(/\s+/);
    return parts.length === 6; // seconds, minutes, hours, day, month, day-of-week
  }
});
