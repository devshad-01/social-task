import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';

// Import API files
import '../imports/api/users/methods';
import '../imports/api/users/publications';
import '../imports/api/users/server/hooks';
import '../imports/api/posts/methods';
import '../imports/api/posts/server/publications';
import '../imports/api/tasks/methods';
import '../imports/api/tasks/server';
import '../imports/api/notifications/methods';
import '../imports/api/notifications/server/publications';
import './cloudinary_methods.js';
import '../imports/api/clients/server/publications';
import '../imports/startup/server/index.js';


Meteor.startup(async () => {
  // Configure accounts settings
  Accounts.config({
    sendVerificationEmail: true,
    forbidClientAccountCreation: false,
    loginExpirationInDays: 30,
  });
  
  // Set password reset token expiration (1 hour)
  Accounts.urls.resetPassword = function(token) {
    return Meteor.absoluteUrl(`reset-password/${token}`);
  };
  
  // Set email verification token URL
  Accounts.urls.verifyEmail = function(token) {
    return Meteor.absoluteUrl(`verify-email/${token}`);
  };

  // Create admin user if none exists
  const adminUser = await Meteor.users.findOneAsync({
    'profile.role': 'admin'
  });
  
  if (!adminUser) {
    console.log('Creating admin user...');
    const adminId = await Accounts.createUserAsync({
      email: 'admin@posty.com',
      password: 'Admin123!',
      profile: {
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        createdAt: new Date()
      }
    });
    
    // Verify admin email automatically
    await Meteor.users.updateAsync(
      { _id: adminId },
      { $set: { 'emails.0.verified': true } }
    );

    // Assign admin role
    await Roles.addUsersToRoles(adminId, ['admin']);
    
    console.log('Admin user created successfully with admin role!');
  }
});
