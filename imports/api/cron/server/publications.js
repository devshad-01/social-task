import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Roles } from 'meteor/alanning:roles';
import { CronJobs } from '../CronJobsCollection';

// Publication for cron jobs (admin only)
Meteor.publish('cronJobs.all', async function() {
  // Check if user is logged in
  if (!this.userId) {
    return this.ready();
  }

  // Check admin role using profile or Roles package
  const user = await Meteor.users.findOneAsync(this.userId);
  const isAdmin = (user?.profile?.role === 'admin') || 
                  (Roles && typeof Roles.userIsInRole === 'function' && Roles.userIsInRole(this.userId, ['admin']));
  
  if (!isAdmin) {
    return this.ready();
  }

  return CronJobs.find({}, { 
    sort: { createdAt: -1 }
  });
});

// Publication for specific cron job (admin only)
Meteor.publish('cronJobs.byId', async function(jobId) {
  check(jobId, String);

  // Check if user is logged in
  if (!this.userId) {
    return this.ready();
  }

  // Check admin role using profile or Roles package
  const user = await Meteor.users.findOneAsync(this.userId);
  const isAdmin = (user?.profile?.role === 'admin') || 
                  (Roles && typeof Roles.userIsInRole === 'function' && Roles.userIsInRole(this.userId, ['admin']));
  
  if (!isAdmin) {
    return this.ready();
  }

  return CronJobs.find({ _id: jobId });
});
