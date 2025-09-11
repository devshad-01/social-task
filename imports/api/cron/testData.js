import { Meteor } from 'meteor/meteor';
import { Tasks } from '../tasks/TasksCollection.js';

/**
 * Create test data for cron job testing
 */
Meteor.methods({
  async 'test.createScheduledTasks'() {
    // Only admin can create test data
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'Must be logged in');
    }
    
    const user = await Meteor.users.findOneAsync(this.userId);
    const isAdmin = user?.profile?.role === 'admin';
    if (!isAdmin) {
      throw new Meteor.Error('not-authorized', 'Admin access required');
    }

    const now = new Date();
    const testTasks = [];

    // Create a task due in 2 minutes (for testing)
    const dueSoon = new Date(now.getTime() + 2 * 60 * 1000);
    testTasks.push({
      title: 'Test Task - Due Soon',
      description: 'This task will be picked up by the cron job in 2 minutes',
      status: 'scheduled',
      priority: 'high',
      dueDate: dueSoon,
      assignedTo: [this.userId],
      createdBy: this.userId,
      createdAt: now,
      updatedAt: now,
      isActive: true
    });

    // Create an overdue task
    const overdue = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 1 day ago
    testTasks.push({
      title: 'Test Task - Overdue',
      description: 'This task is overdue and should trigger alerts',
      status: 'in_progress',
      priority: 'medium',
      dueDate: overdue,
      assignedTo: [this.userId],
      createdBy: this.userId,
      createdAt: overdue,
      updatedAt: overdue,
      isActive: true
    });

    // Create a task due in 5 minutes
    const dueLater = new Date(now.getTime() + 5 * 60 * 1000);
    testTasks.push({
      title: 'Test Task - Due Later',
      description: 'This task will be processed later',
      status: 'scheduled',
      priority: 'low',
      dueDate: dueLater,
      assignedTo: [this.userId],
      createdBy: this.userId,
      createdAt: now,
      updatedAt: now,
      isActive: true
    });

    const createdIds = [];
    for (const task of testTasks) {
      const taskId = await Tasks.insertAsync(task);
      createdIds.push(taskId);
      console.log(`[TestData] Created test task: ${task.title} (${taskId}) - Due: ${task.dueDate}`);
    }

    console.log(`[TestData] Created ${createdIds.length} test tasks for cron job testing`);
    return {
      message: `Created ${createdIds.length} test tasks`,
      taskIds: createdIds,
      testInfo: {
        dueSoon: dueSoon.toLocaleString(),
        overdue: overdue.toLocaleString(),
        dueLater: dueLater.toLocaleString()
      }
    };
  },

  async 'test.cleanupTestTasks'() {
    // Only admin can cleanup test data
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'Must be logged in');
    }
    
    const user = await Meteor.users.findOneAsync(this.userId);
    const isAdmin = user?.profile?.role === 'admin';
    if (!isAdmin) {
      throw new Meteor.Error('not-authorized', 'Admin access required');
    }

    const deletedCount = await Tasks.removeAsync({
      title: { $regex: /^Test Task -/ }
    });

    console.log(`[TestData] Cleaned up ${deletedCount} test tasks`);
    return { message: `Cleaned up ${deletedCount} test tasks` };
  }
});
