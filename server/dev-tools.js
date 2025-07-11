import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { findUserByEmail } from '../imports/api/users/server/utils';

/**
 * DEVELOPMENT HELPER TOOL
 * 
 * These methods are only for development and should be removed in production.
 */
if (Meteor.isDevelopment) {
  Meteor.methods({
    /**
     * Remove a test user by email
     * THIS IS FOR DEVELOPMENT USE ONLY
     */
    'dev.removeTestUser'(email) {
      check(email, String);
      
      console.log('[dev.removeTestUser] Trying to remove test user with email:', email);
      
      const user = findUserByEmail(email);
      
      if (!user) {
        console.log('[dev.removeTestUser] No user found with email:', email);
        return { success: false, message: 'No user found with that email' };
      }
      
      // Remove the user
      try {
        Meteor.users.remove({ _id: user._id });
        console.log('[dev.removeTestUser] Successfully removed user with email:', email);
        return { success: true, message: 'User successfully removed' };
      } catch (error) {
        console.error('[dev.removeTestUser] Error removing user:', error);
        throw new Meteor.Error('remove-user-failed', 'Failed to remove test user');
      }
    },
    
    /**
     * List all users in the system
     * THIS IS FOR DEVELOPMENT USE ONLY
     */
    'dev.listAllUsers'() {
      const users = Meteor.users.find({}, {
        fields: {
          'emails.address': 1,
          'profile.fullName': 1,
          'profile.firstName': 1, 
          'profile.lastName': 1,
          'profile.role': 1,
          'createdAt': 1
        }
      }).fetch();
      
      console.log('[dev.listAllUsers] Found', users.length, 'users');
      return users;
    }
  });
}
