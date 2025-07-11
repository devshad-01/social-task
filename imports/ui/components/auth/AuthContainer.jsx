import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { SignUpForm } from './SignUpForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';

export const AuthContainer = ({ onAuthenticated }) => {
  const [currentView, setCurrentView] = useState('login'); // 'login', 'signup', 'forgot-password'

  const handleLogin = async (formData) => {
    // This will be connected to Meteor accounts later
    console.log('Login:', formData);
    // Simulate API call
    setTimeout(() => {
      onAuthenticated({ 
        user: { 
          id: '1', 
          email: formData.email, 
          fullName: 'John Doe', 
          role: 'team-member' 
        } 
      });
    }, 1000);
  };

  const handleSignUp = async (formData) => {
    // This will be connected to Meteor accounts later
    console.log('Sign up:', formData);
    // Simulate API call
    setTimeout(() => {
      onAuthenticated({ 
        user: { 
          id: '2', 
          email: formData.email, 
          fullName: formData.fullName, 
          role: formData.role 
        } 
      });
    }, 1000);
  };

  const handleForgotPassword = async (email) => {
    // This will be connected to Meteor accounts later
    console.log('Forgot password:', email);
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });
  };

  switch (currentView) {
    case 'signup':
      return (
        <SignUpForm
          onSignUp={handleSignUp}
          onLogin={() => setCurrentView('login')}
        />
      );
    case 'forgot-password':
      return (
        <ForgotPasswordForm
          onResetPassword={handleForgotPassword}
          onBackToLogin={() => setCurrentView('login')}
        />
      );
    default:
      return (
        <LoginForm
          onLogin={handleLogin}
          onSignUp={() => setCurrentView('signup')}
          onForgotPassword={() => setCurrentView('forgot-password')}
        />
      );
  }
};
