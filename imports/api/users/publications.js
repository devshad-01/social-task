import { Meteor } from 'meteor/meteor';

/**
 * Publish user data for the current user
 * This will publish only the necessary user data for the current logged in user
 * Sensitive information like services will be removed
 */
Meteor.publish('userData', function() {
  if (!this.userId) {
    return this.ready();
  }
  
  return Meteor.users.find(
    { _id: this.userId },
    {
      fields: {
        emails: 1,
        profile: 1,
        createdAt: 1
      }
    }
  );
});

/**
 * Publish minimal user data for other users
 * This will publish only public information about users
 */
Meteor.publish('users.public', function() {
  return Meteor.users.find(
    {},
    {
      fields: {
        'profile.firstName': 1,
        'profile.lastName': 1,
        'profile.avatar': 1,
        'profile.role': 1
      }
    }
  );
});

/**
 * Publish team members
 * This will publish only team members based on roles
 */
Meteor.publish('users.team', function() {
  if (!this.userId) {
    return this.ready();
  }
  
  // You can add role-based filtering here
  return Meteor.users.find(
    { 'profile.role': { $in: ['admin', 'manager', 'user'] } },
    {
      fields: {
        'profile.firstName': 1,
        'profile.lastName': 1,
        'profile.avatar': 1,
        'profile.role': 1,
        'profile.bio': 1,
        'emails.address': 1,
        'emails.verified': 1,
        createdAt: 1
      }
    }
  );
});

/**
 * Publish all users for admin/supervisor use (e.g., task assignment)
 * Only publish essential data for assignment purposes
 */
Meteor.publish('users.all', async function() {
  if (!this.userId) {
    return this.ready();
  }
  
  // Only allow admins and supervisors to see all users
  const user = await Meteor.users.findOneAsync(this.userId);
  if (!user || !['admin', 'supervisor'].includes(user.profile?.role)) {
    return this.ready();
  }
  
  return Meteor.users.find(
    {},
    {
      fields: {
        emails: 1,
        'profile.firstName': 1,
        'profile.lastName': 1,
        'profile.fullName': 1,
        'profile.role': 1,
        'profile.avatar': 1
      }
    }
  );
});
