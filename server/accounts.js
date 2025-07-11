import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

// Simple server-side configuration for accounts
Accounts.config({
  sendVerificationEmail: true,
  forbidClientAccountCreation: false,
  loginExpirationInDays: 30,
});

// Configure email templates
Accounts.emailTemplates.siteName = 'Posty';
Accounts.emailTemplates.from = 'Posty <no-reply@posty.com>';

// Verification email template
Accounts.emailTemplates.verifyEmail = {
  subject() {
    return 'Activate your Posty account';
  },
  text(user, url) {
    return `Hello ${user.profile?.fullName || user.username || 'there'}!

Click the link below to verify your email address:
${url}

If you didn't create an account with Posty, please ignore this email.

Thanks,
The Posty Team`;
  },
  html(user, url) {
    return `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2563eb;">Welcome to Posty!</h2>
        <p>Hello ${user.profile?.fullName || user.username || 'there'}!</p>
        <p>Click the button below to verify your email address:</p>
        <a href="${url}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
        <p>If you didn't create an account with Posty, please ignore this email.</p>
        <p>Thanks,<br>The Posty Team</p>
      </div>
    `;
  }
};

// Password reset email template
Accounts.emailTemplates.resetPassword = {
  subject() {
    return 'Reset your Posty password';
  },
  text(user, url) {
    return `Hello ${user.profile?.fullName || user.username || 'there'}!

Click the link below to reset your password:
${url}

If you didn't request a password reset, please ignore this email.

Thanks,
The Posty Team`;
  },
  html(user, url) {
    return `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2563eb;">Reset Your Password</h2>
        <p>Hello ${user.profile?.fullName || user.username || 'there'}!</p>
        <p>Click the button below to reset your password:</p>
        <a href="${url}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        <p>If you didn't request a password reset, please ignore this email.</p>
        <p>Thanks,<br>The Posty Team</p>
      </div>
    `;
  }
};

// Create admin user if it doesn't exist
Meteor.startup(() => {
  if (Meteor.users.find().count() === 0) {
    console.log('Creating admin user...');
    const adminUserId = Accounts.createUser({
      email: 'admin@posty.com',
      password: 'admin123',
      profile: {
        fullName: 'Admin User',
        role: 'admin'
      }
    });
    
    // Verify the admin user automatically
    Meteor.users.update(adminUserId, {
      $set: {
        'emails.0.verified': true
      }
    });
    
    console.log('Admin user created successfully!');
  }
});
