import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';
import { Email } from 'meteor/email';

// Import API files
import '../imports/api/users/methods';
import '../imports/api/users/publications';
import '../imports/api/users/server/hooks';
import '../imports/api/posts/methods';
import '../imports/api/posts/server/publications';
import '../imports/api/tasks/methods';
import '../imports/api/tasks/server';
import '../imports/api/notifications/methods';
import '../imports/api/notifications/notificationQueue';
import '../imports/api/notifications/server/publications';
import '../imports/api/notifications/webPushServer';
import '../imports/api/cron/methodsSimple';
import '../imports/api/cron/testData';
import '../imports/api/cron/server/publications';
import './cloudinary_methods.js';
import '../imports/api/clients/server/publications';
import '../imports/startup/server/index.js';
import '../imports/api/clients/FacebookPosts.js';
import '../imports/api/clients/InstagramPosts.js'; 
import '../imports/api/clientsaccounts/server/publications';
import '../imports/api/meta/methods.js';
import '../imports/api/meta/FetchAccounts.js';
import '../imports/api/meta/instagram.js';



Meteor.startup(async () => {
  // Configure email error handling first
  const originalEmailSend = Email.send;
  Email.send = function(options) {
    try {
      // Check if we're in development and skip actual email sending
      if (Meteor.isDevelopment) {
        console.log('📧 Development mode: Email would be sent to:', options.to);
        console.log('📧 Subject:', options.subject);
        return; // Skip actual sending in development
      }
      return originalEmailSend.call(this, options);
    } catch (error) {
      console.error('❌ Email sending failed:', error.message);
      // Don't throw the error, just log it
      return;
    }
  };

  // Override Accounts.sendVerificationEmail to prevent crashes
  const originalSendVerificationEmail = Accounts.sendVerificationEmail;
  Accounts.sendVerificationEmail = function(userId, address) {
    try {
      if (Meteor.isDevelopment) {
        console.log('📧 Development mode: Verification email would be sent to:', address);
        return;
      }
      return originalSendVerificationEmail.call(this, userId, address);
    } catch (error) {
      console.error('❌ Verification email sending failed:', error.message);
      return;
    }
  };

  // Configure accounts settings
  Accounts.config({
    sendVerificationEmail: !Meteor.isDevelopment, // Disable in development
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
