import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { check, Match } from 'meteor/check';

import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema, updateProfileSchema, changePasswordSchema } from './schemas';
import { findUserByEmail, normalizeEmail } from './server/utils';

// Helper function to validate with Zod and return formatted errors
const validateWithZod = (schema, data) => {
  try {
    schema.parse(data);
    return { isValid: true, errors: {} };
  } catch (error) {
    const errors = {};
    // Check if error has the expected structure
    if (error.errors && Array.isArray(error.errors)) {
      error.errors.forEach((err) => {
        const path = err.path && err.path.length > 0 ? err.path[0] : 'unknown';
        errors[path] = err.message;
      });
    } else {
      // Fallback for different error structures
      errors.general = error.message || 'Validation failed';
    }
    return { isValid: false, errors };
  }
};

Meteor.methods({
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   */
  async 'users.register'(userData) {
    console.log('[users.register] called with:', userData.email);
    // Validate the data with Zod
    const { isValid, errors } = validateWithZod(registerSchema, userData);
    
    if (!isValid) {
      throw new Meteor.Error('validation-error', 'Validation Failed', errors);
    }
    
    // Check if user already exists with our custom utility function
    console.log('[users.register] Checking if email exists:', userData.email);
    
    // Custom email check from utils
    const existingUser = await findUserByEmail(userData.email);
    
    if (existingUser) {
      console.log('[users.register] User already exists:', userData.email);
      throw new Meteor.Error(
        'user-exists', 
        'A user with this email already exists'
      );
    }
    
    try {
      // Split fullName into firstName and lastName
      const nameParts = userData.fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // Create the user account with normalized email
      const normalizedEmail = normalizeEmail(userData.email);
      console.log('[users.register] Creating user with normalized email:', normalizedEmail);
      
      const userId = await Accounts.createUserAsync({
        email: normalizedEmail,
        password: userData.password,
        profile: {
          fullName: userData.fullName,
          firstName: firstName,
          lastName: lastName,
          role: 'user',
          createdAt: new Date()
        }
      });
      console.log('[users.register] User created:', userId);
      // Send verification email
      if (userId) {
        Accounts.sendVerificationEmail(userId);
        console.log('[users.register] Verification email sent to:', userData.email);
      }
      
      return { success: true, userId };
    } catch (error) {
      console.error('[users.register] Error:', error);
      throw new Meteor.Error(
        'registration-failed',
        error.reason || 'Registration failed'
      );
    }
  },
  
  /**
   * Send a password reset email
   * @param {Object} data - Contains email address
   */
  async 'users.forgotPassword'(data) {
    console.log('[users.forgotPassword] called with:', data.email);
    // Validate the data with Zod
    const { isValid, errors } = validateWithZod(forgotPasswordSchema, data);
    
    if (!isValid) {
      throw new Meteor.Error('validation-error', 'Validation Failed', errors);
    }
    
    const { email } = data;
    
    // Check if email exists in the system using our custom utility
    const user = await findUserByEmail(email);
    console.log('[users.forgotPassword] Email lookup result:', user ? 'User found' : 'No user found');
    
    if (!user) {
      console.log('[users.forgotPassword] No user found for:', email);
      // We don't want to leak information about registered emails
      // So we return success even if the email doesn't exist
      return { success: true };
    }
    try {
      await Accounts.sendResetPasswordEmail(user._id, email);
      console.log('[users.forgotPassword] Reset email sent to:', email);
      return { success: true };
    } catch (error) {
      console.error('[users.forgotPassword] Error:', error);
      throw new Meteor.Error(
        'reset-email-failed',
        'Failed to send password reset email'
      );
    }
  },
  
  /**
   * Reset user password with token
   * @param {Object} data - Contains password, confirmPassword and token
   */
  async 'users.resetPassword'(data) {
    console.log('[users.resetPassword] called with token:', data.token);
    // Validate password data
    const { isValid, errors } = validateWithZod(
      resetPasswordSchema, 
      { password: data.password, confirmPassword: data.confirmPassword }
    );
    
    if (!isValid) {
      throw new Meteor.Error('validation-error', 'Validation Failed', errors);
    }
    
    check(data.token, String);
    
    try {
      await Accounts.resetPassword(data.token, data.password);
      console.log('[users.resetPassword] Password reset successful for token:', data.token);
      return { success: true };
    } catch (error) {
      console.error('[users.resetPassword] Error:', error);
      throw new Meteor.Error(
        'reset-password-failed',
        error.reason || 'Failed to reset password. Token may be invalid or expired.'
      );
    }
  },
  
  /**
   * Update user profile
   * @param {Object} profileData - User profile data to update
   */
  async 'users.updateProfile'(profileData) {
    console.log('[users.updateProfile] called by user:', this.userId, 'with:', profileData);
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in');
    }
    
    // Validate the data with Zod
    const { isValid, errors } = validateWithZod(updateProfileSchema, profileData);
    
    if (!isValid) {
      throw new Meteor.Error('validation-error', 'Validation Failed', errors);
    }
    
    // Split fullName into firstName and lastName if provided
    const updateData = {};
    if (profileData.fullName) {
      const nameParts = profileData.fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      updateData['profile.fullName'] = profileData.fullName;
      updateData['profile.firstName'] = firstName;
      updateData['profile.lastName'] = lastName;
    }
    
    // Handle other allowed fields
    const allowedFields = ['phone', 'bio'];
    allowedFields.forEach(key => {
      if (profileData[key] !== undefined) {
        updateData[`profile.${key}`] = profileData[key];
      }
    });
    
    // Add updatedAt timestamp
    updateData['profile.updatedAt'] = new Date();
    
    try {
      await Meteor.users.updateAsync(
        { _id: this.userId },
        { $set: updateData }
      );
      console.log('[users.updateProfile] Profile updated for user:', this.userId);
      return { success: true };
    } catch (error) {
      console.error('[users.updateProfile] Error:', error);
      throw new Meteor.Error(
        'update-profile-failed',
        'Failed to update profile'
      );
    }
  },
  
  /**
   * Change user password
   * @param {Object} data - Contains oldPassword and newPassword
   */
  async 'users.changePassword'(data) {
    console.log('[users.changePassword] called by user:', this.userId);
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in');
    }
    
    // Validate the data with Zod
    const { isValid, errors } = validateWithZod(changePasswordSchema, data);
    
    if (!isValid) {
      throw new Meteor.Error('validation-error', 'Validation Failed', errors);
    }
    
    try {
      await Accounts.changePasswordAsync(data.oldPassword, data.newPassword);
      console.log('[users.changePassword] Password changed for user:', this.userId);
      return { success: true };
    } catch (error) {
      console.error('[users.changePassword] Error:', error);
      throw new Meteor.Error(
        'change-password-failed',
        error.reason || 'Failed to change password'
      );
    }
  },
  
  /**
   * Resend verification email
   */
  async 'users.resendVerificationEmail'() {
    console.log('[users.resendVerificationEmail] called by user:', this.userId);
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in');
    }
    
    const user = await Meteor.users.findOneAsync(this.userId);
    const unverifiedEmail = user.emails?.find(email => !email.verified);
    
    if (!unverifiedEmail) {
      throw new Meteor.Error(
        'no-unverified-email',
        'No unverified email found'
      );
    }
    
    try {
      Accounts.sendVerificationEmail(this.userId, unverifiedEmail.address);
      console.log('[users.resendVerificationEmail] Verification email resent to:', unverifiedEmail.address);
      return { success: true };
    } catch (error) {
      console.error('[users.resendVerificationEmail] Error:', error);
      throw new Meteor.Error(
        'verification-email-failed',
        'Failed to send verification email'
      );
    }
  }
});
