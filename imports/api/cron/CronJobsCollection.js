import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const CronJobs = new Mongo.Collection('cronJobs');

// Cron Job Status
export const CRON_STATUS = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  DISABLED: 'disabled',
  ERROR: 'error'
};

// Predefined cron job types
export const CRON_TYPES = {
  NOTIFICATION_CLEANUP: 'notification_cleanup',
  NOTIFICATION_RETRY: 'notification_retry', 
  TASK_REMINDERS: 'task_reminders',
  OVERDUE_NOTIFICATIONS: 'overdue_notifications',
  DAILY_SUMMARY: 'daily_summary',
  WEEKLY_REPORTS: 'weekly_reports',
  META_API_SYNC: 'meta_api_sync',
  DATABASE_BACKUP: 'database_backup',
  ANALYTICS_PROCESSING: 'analytics_processing'
};

// Cron job schema
export const CronJobSchema = {
  name: String,           // Display name
  type: String,           // CRON_TYPES
  description: String,    // What this job does
  schedule: String,       // Cron expression (e.g., '0 */15 * * * *' for every 15 minutes)
  status: String,         // CRON_STATUS
  enabled: Boolean,       // Can be toggled by admin
  
  // Configuration
  config: Object,         // Job-specific configuration
  timeout: Number,        // Max execution time in ms
  maxRetries: Number,     // Max retry attempts
  
  // Execution tracking
  lastRun: Date,
  nextRun: Date,
  runCount: Number,
  failureCount: Number,
  lastError: String,
  
  // Admin settings
  createdBy: String,      // Admin user ID
  createdAt: Date,
  updatedAt: Date,
  
  // Metadata
  tags: [String],         // For categorization
  priority: Number        // 1 (low) to 5 (critical)
};

// Default cron jobs that ship with the application
export const DEFAULT_CRON_JOBS = [
  {
    name: 'Notification Cleanup',
    type: CRON_TYPES.NOTIFICATION_CLEANUP,
    description: 'Clean up old sent notifications and failed notifications',
    schedule: '0 0 2 * * *', // Daily at 2 AM
    status: CRON_STATUS.ACTIVE,
    enabled: true,
    config: {
      retentionDays: 30,
      batchSize: 1000
    },
    timeout: 300000, // 5 minutes
    maxRetries: 3,
    tags: ['maintenance', 'cleanup'],
    priority: 3
  },
  
  {
    name: 'Notification Retry Processor',
    type: CRON_TYPES.NOTIFICATION_RETRY,
    description: 'Process failed notifications for retry',
    schedule: '0 */5 * * * *', // Every 5 minutes
    status: CRON_STATUS.ACTIVE,
    enabled: true,
    config: {
      batchSize: 50,
      maxAge: 86400000 // 24 hours
    },
    timeout: 120000, // 2 minutes
    maxRetries: 2,
    tags: ['notifications', 'retry'],
    priority: 4
  },
  
  {
    name: 'Task Due Date Reminders',
    type: CRON_TYPES.TASK_REMINDERS,
    description: 'Send reminders for tasks due soon',
    schedule: '0 0 9,15 * * *', // 9 AM and 3 PM daily
    status: CRON_STATUS.ACTIVE,
    enabled: true,
    config: {
      reminderHours: [24, 4, 1], // Hours before due date
      includeWeekends: false
    },
    timeout: 180000, // 3 minutes
    maxRetries: 3,
    tags: ['tasks', 'reminders'],
    priority: 4
  },
  
  {
    name: 'Overdue Task Notifications',
    type: CRON_TYPES.OVERDUE_NOTIFICATIONS,
    description: 'Notify about overdue tasks',
    schedule: '0 0 10 * * *', // Daily at 10 AM
    status: CRON_STATUS.ACTIVE,
    enabled: true,
    config: {
      escalationLevels: [1, 3, 7], // Days overdue for escalation
      notifyManagers: true
    },
    timeout: 240000, // 4 minutes
    maxRetries: 3,
    tags: ['tasks', 'overdue', 'escalation'],
    priority: 5
  },
  
  {
    name: 'Daily Summary Reports',
    type: CRON_TYPES.DAILY_SUMMARY,
    description: 'Generate and send daily summary reports to managers',
    schedule: '0 0 18 * * 1-5', // 6 PM on weekdays
    status: CRON_STATUS.ACTIVE,
    enabled: true,
    config: {
      recipients: ['admin', 'supervisor'],
      includeMetrics: true,
      includeCharts: false
    },
    timeout: 600000, // 10 minutes
    maxRetries: 2,
    tags: ['reports', 'daily'],
    priority: 3
  },
  
  {
    name: 'Meta API Data Sync',
    type: CRON_TYPES.META_API_SYNC,
    description: 'Sync social media accounts and posts from Meta API',
    schedule: '0 0 */6 * * *', // Every 6 hours
    status: CRON_STATUS.PAUSED, // Paused until API configured
    enabled: false,
    config: {
      syncAccounts: true,
      syncPosts: true,
      maxPostAge: 604800000 // 7 days
    },
    timeout: 900000, // 15 minutes
    maxRetries: 3,
    tags: ['meta', 'sync', 'social'],
    priority: 3
  }
];
