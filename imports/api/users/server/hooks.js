import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';

// Set up email templates
const appName = Meteor.settings.public.app?.name || 'App';
Accounts.emailTemplates.siteName = appName;
Accounts.emailTemplates.from = Meteor.settings.private?.email?.from || 'noreply@example.com';

// Verification email template
Accounts.emailTemplates.verifyEmail = {
  subject() {
    return `${appName}: Verify Your Email Address`;
  },
  text(user, url) {
    const emailAddress = user.emails[0].address;
    return `Hello ${user.profile?.firstName || 'there'},
    
To verify your email address (${emailAddress}), simply click the link below:
${url}

If you did not request this verification, please ignore this email.

Thanks,
The ${appName} Team`;
  },
  html(user, url) {
    const emailAddress = user.emails[0].address;
    return `
      <html>
        <head>
          <style>
            body { font-family: sans-serif; color: #333; line-height: 1.5; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 4px; }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Verify Your Email Address</h1>
            <p>Hello ${user.profile?.firstName || 'there'},</p>
            <p>To verify your email address (${emailAddress}), simply click the button below:</p>
            <p><a href="${url}" class="button">Verify Email Address</a></p>
            <p>Or copy and paste this link into your browser:</p>
            <p>${url}</p>
            <p>If you did not request this verification, please ignore this email.</p>
            <div class="footer">
              <p>Thanks,<br />The ${appName} Team</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
};

// Reset password email template
Accounts.emailTemplates.resetPassword = {
  subject() {
    return `${appName}: Reset Your Password`;
  },
  text(user, url) {
    return `Hello ${user.profile?.firstName || 'there'},
    
To reset your password, simply click the link below:
${url}

This link will expire in 1 hour.

If you did not request a password reset, please ignore this email.

Thanks,
The ${appName} Team`;
  },
  html(user, url) {
    return `
      <html>
        <head>
          <style>
            body { font-family: sans-serif; color: #333; line-height: 1.5; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 4px; }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Reset Your Password</h1>
            <p>Hello ${user.profile?.firstName || 'there'},</p>
            <p>To reset your password, simply click the button below:</p>
            <p><a href="${url}" class="button">Reset Password</a></p>
            <p>Or copy and paste this link into your browser:</p>
            <p>${url}</p>
            <p>This link will expire in 1 hour.</p>
            <p>If you did not request a password reset, please ignore this email.</p>
            <div class="footer">
              <p>Thanks,<br />The ${appName} Team</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
};

// Assign default role to new users
Accounts.onCreateUser((options, user) => {
  // Add profile information if provided
  if (options.profile) {
    user.profile = options.profile;
  }

  // Add creation date
  user.createdAt = new Date();

  // Assign default role to new users (team members)
  Meteor.defer(() => {
    try {
      if (Roles && typeof Roles.userIsInRole === 'function') {
        if (!Roles.userIsInRole(user._id, ['admin', 'supervisor'])) {
          Roles.addUsersToRoles(user._id, ['member']);
        }
      } else {
        console.warn('Roles package not available, skipping role assignment');
      }
    } catch (error) {
      console.error('Error assigning user roles:', error);
    }
  });

  return user;
});
