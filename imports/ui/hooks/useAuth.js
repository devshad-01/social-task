import { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { useTracker } from 'meteor/react-meteor-data';

/**
 * Custom hook to handle user authentication state
 * @returns {Object} - Authentication state and methods
 */
export const useAuth = () => {
  // Track user's authentication status
  const { user, userId, isLoading } = useTracker(() => {
    const handler = Meteor.subscribe('userData');
    const user = Meteor.user();
    const userId = Meteor.userId();
    
    console.log('[useAuth] Subscription ready:', handler.ready());
    console.log('[useAuth] User:', !!user);
    console.log('[useAuth] UserId:', !!userId);
    
    return {
      user,
      userId,
      isLoading: !handler.ready()
    };
  }, []);

  // Login method
  const login = async ({ email, password, rememberMe = false }) => {
    console.log('[useAuth] login called with:', email);
    try {
      await new Promise((resolve, reject) => {
        Meteor.loginWithPassword(email, password, (error) => {
          if (error) {
            console.error('[useAuth] login error:', error);
            reject(error);
          } else {
            resolve();
          }
        });
      });
      
      // If remember me is not checked, set a shorter session expiry
      if (!rememberMe) {
        Meteor.call('users.setShortSessionExpiry');
      }
      
      console.log('[useAuth] login successful:', email);
    } catch (error) {
      throw error;
    }
  };

  // Logout method
  const logout = async () => {
    console.log('[useAuth] logout called');
    await new Promise((resolve) => {
      Meteor.logout(() => {
        console.log('[useAuth] logout successful');
        resolve();
      });
    });
  };

  // Register method
  const register = async (data) => {
    console.log('[useAuth] register called with:', data.email);
    return new Promise((resolve, reject) => {
      Meteor.call('users.register', data, (error, result) => {
        if (error) {
          console.error('[useAuth] register error:', error);
          reject(error);
        } else {
          console.log('[useAuth] register successful:', result);
          resolve(result);
        }
      });
    });
  };

  // Forgot password method
  const forgotPassword = async (email) => {
    console.log('[useAuth] forgotPassword called with:', email);
    return new Promise((resolve, reject) => {
      Meteor.call('users.forgotPassword', { email }, (error, result) => {
        if (error) {
          console.error('[useAuth] forgotPassword error:', error);
          reject(error);
        } else {
          console.log('[useAuth] forgotPassword successful:', result);
          resolve(result);
        }
      });
    });
  };

  // Reset password method
  const resetPassword = async (data) => {
    console.log('[useAuth] resetPassword called with token:', data.token);
    return new Promise((resolve, reject) => {
      Meteor.call('users.resetPassword', data, (error, result) => {
        if (error) {
          console.error('[useAuth] resetPassword error:', error);
          reject(error);
        } else {
          console.log('[useAuth] resetPassword successful:', result);
          resolve(result);
        }
      });
    });
  };

  // Update profile method
  const updateProfile = async (profileData) => {
    console.log('[useAuth] updateProfile called with:', profileData);
    return new Promise((resolve, reject) => {
      Meteor.call('users.updateProfile', profileData, (error, result) => {
        if (error) {
          console.error('[useAuth] updateProfile error:', error);
          reject(error);
        } else {
          console.log('[useAuth] updateProfile successful:', result);
          resolve(result);
        }
      });
    });
  };

  // Change password method
  const changePassword = async (data) => {
    console.log('[useAuth] changePassword called');
    return new Promise((resolve, reject) => {
      Meteor.call('users.changePassword', data, (error, result) => {
        if (error) {
          console.error('[useAuth] changePassword error:', error);
          reject(error);
        } else {
          console.log('[useAuth] changePassword successful:', result);
          resolve(result);
        }
      });
    });
  };

  // Resend verification email method
  const resendVerificationEmail = async () => {
    return new Promise((resolve, reject) => {
      Meteor.call('users.resendVerificationEmail', (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  };

  // Verify email method
  const verifyEmail = async (token) => {
    return new Promise((resolve, reject) => {
      Accounts.verifyEmail(token, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve({ success: true });
        }
      });
    });
  };

  const isAuthenticated = !!userId;
  const isEmailVerified = user?.emails?.[0]?.verified;

  return {
    user,
    userId,
    isLoading,
    isAuthenticated,
    isEmailVerified,
    login,
    logout,
    register,
    forgotPassword,
    resetPassword,
    updateProfile,
    changePassword,
    resendVerificationEmail,
    verifyEmail
  };
};
