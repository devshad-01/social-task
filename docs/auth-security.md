# 🔐 Authentication & Security Patterns

## User Authentication System

### Login/Registration Components

#### LoginForm.jsx
```javascript
// imports/ui/components/auth/LoginForm.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate } from 'react-router-dom';
import { useTracker } from 'meteor/react-meteor-data';

export function LoginForm() {
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const user = useTracker(() => Meteor.user());
  
  const { register, handleSubmit, formState: { errors } } = useForm();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (data) => {
    setIsLoading(true);
    setLoginError('');

    Meteor.loginWithPassword(data.email, data.password, (error) => {
      setIsLoading(false);
      if (error) {
        setLoginError(error.reason || 'Login failed');
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Social Media Task Manager
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {loginError && (
            <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded">
              {loginError}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Invalid email address'
                  }
                })}
                type="email"
                className="input-field mt-1"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="text-error-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                {...register('password', { required: 'Password is required' })}
                type="password"
                className="input-field mt-1"
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="text-error-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex justify-center"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center">
            <a href="/forgot-password" className="text-sm text-primary-600 hover:text-primary-500">
              Forgot your password?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
```

#### SetPasswordForm.jsx (for invited users)
```javascript
// imports/ui/components/auth/SetPasswordForm.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, Navigate } from 'react-router-dom';

export function SetPasswordForm() {
  const { token } = useParams();
  const [isValidToken, setIsValidToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  
  const password = watch('password');

  useEffect(() => {
    // Verify token validity
    Meteor.call('auth.verifyEnrollmentToken', token, (error, result) => {
      setIsValidToken(!error && result);
    });
  }, [token]);

  if (success) {
    return <Navigate to="/login" replace />;
  }

  if (isValidToken === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Invalid Link</h2>
          <p className="text-gray-600">This password setup link is invalid or has expired.</p>
        </div>
      </div>
    );
  }

  const onSubmit = (data) => {
    setIsLoading(true);
    
    Accounts.resetPassword(token, data.password, (error) => {
      setIsLoading(false);
      if (!error) {
        setSuccess(true);
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Set Your Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create a password for your account
          </p>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              {...register('password', { 
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters'
                }
              })}
              type="password"
              className="input-field mt-1"
              placeholder="Create a password"
            />
            {errors.password && (
              <p className="text-error-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              {...register('confirmPassword', { 
                required: 'Please confirm your password',
                validate: value => value === password || 'Passwords do not match'
              })}
              type="password"
              className="input-field mt-1"
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && (
              <p className="text-error-500 text-sm mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full"
          >
            {isLoading ? 'Setting Password...' : 'Set Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

### Route Protection

#### ProtectedRoute.jsx
```javascript
// imports/ui/components/auth/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useTracker } from 'meteor/react-meteor-data';
import { Roles } from 'meteor/alanning:roles';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export function ProtectedRoute({ 
  children, 
  requiredRole = null, 
  redirectTo = '/login' 
}) {
  const { user, loading } = useTracker(() => {
    const handle = Meteor.subscribe('users.current');
    return {
      user: Meteor.user(),
      loading: !handle.ready()
    };
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  if (requiredRole && !Roles.userIsInRole(user._id, requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

// Usage examples:
// <ProtectedRoute>{children}</ProtectedRoute>
// <ProtectedRoute requiredRole="admin">{adminContent}</ProtectedRoute>
```

#### RoleBasedAccess.jsx
```javascript
// imports/ui/components/auth/RoleBasedAccess.jsx
import React from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Roles } from 'meteor/alanning:roles';

export function RoleBasedAccess({ 
  allowedRoles = [], 
  children, 
  fallback = null 
}) {
  const hasAccess = useTracker(() => {
    const userId = Meteor.userId();
    if (!userId) return false;
    
    return allowedRoles.some(role => 
      Roles.userIsInRole(userId, role)
    );
  });

  return hasAccess ? children : fallback;
}

// Usage:
// <RoleBasedAccess allowedRoles={['admin']}>
//   <AdminPanel />
// </RoleBasedAccess>
```

## Security Methods & Validation

### Server-Side Authentication Methods
```javascript
// imports/api/users/auth-methods.js
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';

Meteor.methods({
  'auth.verifyEnrollmentToken'(token) {
    check(token, String);
    
    try {
      // Verify token without consuming it
      const user = Accounts._hashLoginToken(token);
      return !!user;
    } catch (error) {
      return false;
    }
  },
  
  'auth.changePassword'(oldPassword, newPassword) {
    check(oldPassword, String);
    check(newPassword, String);
    
    if (!this.userId) {
      throw new Meteor.Error('not-logged-in');
    }
    
    if (newPassword.length < 8) {
      throw new Meteor.Error('password-too-short', 'Password must be at least 8 characters');
    }
    
    return Accounts.changePassword(oldPassword, newPassword);
  },
  
  'auth.resetUserPassword'(userId, newPassword) {
    check(userId, String);
    check(newPassword, String);
    
    if (!Roles.userIsInRole(this.userId, 'admin')) {
      throw new Meteor.Error('access-denied');
    }
    
    return Accounts.setPassword(userId, newPassword);
  }
});
```

### Input Validation Schemas
```javascript
// imports/api/validation/schemas.js
import SimpleSchema from 'simpl-schema';

export const UserProfileSchema = new SimpleSchema({
  name: {
    type: String,
    min: 2,
    max: 100,
    custom() {
      // No special characters except spaces, hyphens, apostrophes
      if (!/^[a-zA-Z\s\-']+$/.test(this.value)) {
        return 'invalidName';
      }
    }
  },
  avatarUrl: {
    type: String,
    optional: true,
    custom() {
      if (this.value && !SimpleSchema.RegEx.Url.test(this.value)) {
        return 'invalidUrl';
      }
    }
  }
});

export const PasswordSchema = new SimpleSchema({
  password: {
    type: String,
    min: 8,
    max: 128,
    custom() {
      // Must contain at least one letter and one number
      if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(this.value)) {
        return 'weakPassword';
      }
    }
  }
});

export const EmailSchema = new SimpleSchema({
  email: {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
    max: 254 // RFC compliant max length
  }
});
```

### Rate Limiting & Security
```javascript
// imports/api/security/rate-limiting.js
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';

// Login attempt limiting
DDPRateLimiter.addRule({
  name: 'login',
  type: 'method',
  connectionId() { return true; }
}, 5, 60000); // 5 attempts per minute

// Password reset limiting
DDPRateLimiter.addRule({
  name: 'forgotPassword',
  type: 'method',
  connectionId() { return true; }
}, 3, 300000); // 3 attempts per 5 minutes

// General method rate limiting
DDPRateLimiter.addRule({
  type: 'method',
  userId(userId) { return !!userId; }
}, 100, 60000); // 100 method calls per minute for logged-in users

// Subscription rate limiting
DDPRateLimiter.addRule({
  type: 'subscription',
  userId(userId) { return !!userId; }
}, 50, 60000); // 50 subscription attempts per minute
```

### Data Sanitization
```javascript
// imports/api/security/sanitization.js
import DOMPurify from 'isomorphic-dompurify';

export const sanitizeInput = {
  // Sanitize HTML content
  html(input) {
    if (typeof input !== 'string') return '';
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br'],
      ALLOWED_ATTR: []
    });
  },
  
  // Sanitize plain text
  text(input) {
    if (typeof input !== 'string') return '';
    return input.trim().slice(0, 10000); // Limit length
  },
  
  // Sanitize file names
  filename(input) {
    if (typeof input !== 'string') return '';
    return input.replace(/[^a-zA-Z0-9.-]/g, '_').slice(0, 255);
  },
  
  // Remove XSS patterns
  removeXSS(input) {
    if (typeof input !== 'string') return '';
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }
};

// Usage in methods:
Meteor.methods({
  'tasks.create'(taskData) {
    // Sanitize inputs
    taskData.title = sanitizeInput.text(taskData.title);
    taskData.content = sanitizeInput.html(taskData.content);
    
    // Then validate with schema
    check(taskData, TaskSchema);
    
    // Process...
  }
});
```

## Social Media API Security

### Facebook API Token Management
```javascript
// imports/api/social/facebook-security.js
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = Meteor.settings.private?.encryptionKey;
if (!ENCRYPTION_KEY) {
  throw new Error('Encryption key not configured');
}

export const FacebookSecurity = {
  // Encrypt access tokens before storage
  encryptToken(token) {
    return CryptoJS.AES.encrypt(token, ENCRYPTION_KEY).toString();
  },
  
  // Decrypt tokens for API calls
  decryptToken(encryptedToken) {
    const bytes = CryptoJS.AES.decrypt(encryptedToken, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  },
  
  // Validate Facebook webhook signatures
  validateWebhookSignature(payload, signature) {
    const expectedSignature = CryptoJS
      .HmacSHA256(payload, Meteor.settings.private.facebookAppSecret)
      .toString();
    
    return `sha256=${expectedSignature}` === signature;
  },
  
  // Check token validity
  async validateAccessToken(token) {
    try {
      const response = await fetch(
        `https://graph.facebook.com/me?access_token=${token}`
      );
      return response.ok;
    } catch (error) {
      return false;
    }
  },
  
  // Refresh long-lived token
  async refreshLongLivedToken(shortToken) {
    const url = new URL('https://graph.facebook.com/oauth/access_token');
    url.searchParams.set('grant_type', 'fb_exchange_token');
    url.searchParams.set('client_id', Meteor.settings.private.facebookAppId);
    url.searchParams.set('client_secret', Meteor.settings.private.facebookAppSecret);
    url.searchParams.set('fb_exchange_token', shortToken);
    
    const response = await fetch(url.toString());
    const data = await response.json();
    
    return data.access_token;
  }
};
```

### Content Security Policy
```javascript
// server/security.js
import { WebApp } from 'meteor/webapp';

WebApp.connectHandlers.use((req, res, next) => {
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://connect.facebook.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://graph.facebook.com https://*.facebook.com",
    "frame-src https://www.facebook.com",
    "worker-src 'self' blob:"
  ].join('; ');
  
  res.setHeader('Content-Security-Policy', csp);
  
  next();
});
```

## Profile & Password Management

#### ProfileForm.jsx
```javascript
// imports/ui/components/profile/ProfileForm.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTracker } from 'meteor/react-meteor-data';

export function ProfileForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const user = useTracker(() => Meteor.user());
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.profile?.name || '',
      email: user?.emails?.[0]?.address || ''
    }
  });

  const onSubmit = (data) => {
    setIsLoading(true);
    setSuccess(false);
    
    Meteor.call('users.updateProfile', {
      name: data.name
    }, (error) => {
      setIsLoading(false);
      if (!error) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    });
  };

  return (
    <div className="card max-w-md">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        Profile Settings
      </h2>
      
      {success && (
        <div className="bg-success-50 border border-success-200 text-success-700 px-4 py-3 rounded mb-4">
          Profile updated successfully!
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <input
            {...register('name', { 
              required: 'Name is required',
              minLength: { value: 2, message: 'Name must be at least 2 characters' },
              maxLength: { value: 100, message: 'Name must be under 100 characters' }
            })}
            className="input-field"
          />
          {errors.name && (
            <p className="text-error-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            {...register('email')}
            type="email"
            disabled
            className="input-field bg-gray-50 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">
            Contact admin to change your email address
          </p>
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full"
        >
          {isLoading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
}
```

This authentication system provides complete security coverage for your Social Media & Task Management PWA, including secure token management, role-based access control, and protection against common security vulnerabilities.
