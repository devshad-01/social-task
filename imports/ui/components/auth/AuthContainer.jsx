import React from 'react';
import { LoginForm } from './LoginForm';
import { SignUpForm } from './SignUpForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { ResetPasswordForm } from './ResetPasswordForm';
import { VerifyEmailForm } from './VerifyEmailForm';
import { useAuthContext } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

export const AuthContainer = ({ currentForm, tokenData, handleNavigation }) => {
  const { user, userId, loading } = useAuthContext();
  
  console.log('[AuthContainer] Rendering with form:', currentForm);
  console.log('[AuthContainer] User authenticated:', !!user);
  
  // If user is authenticated, redirect to main app
  if (user && userId && !loading) {
    console.log('[AuthContainer] User is authenticated, redirecting to dashboard');
    return <Navigate to="/" replace />;
  }
  
  return (
    <div className="min-h-screen bg-gradient-app">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {currentForm === 'login' && (
            <LoginForm 
              onSwitchToSignUp={() => handleNavigation('/auth/signup')}
              onSwitchToForgotPassword={() => handleNavigation('/auth/forgot-password')}
            />
          )}
          {currentForm === 'signup' && (
            <SignUpForm 
              onSwitchToLogin={() => handleNavigation('/auth/login')}
            />
          )}
          {currentForm === 'forgot-password' && (
            <ForgotPasswordForm 
              onBackToLogin={() => handleNavigation('/auth/login')}
            />
          )}
          {currentForm === 'reset-password' && (
            <ResetPasswordForm 
              token={tokenData?.token}
              onBackToLogin={() => handleNavigation('/auth/login')}
            />
          )}
          {currentForm === 'verify-email' && (
            <VerifyEmailForm 
              token={tokenData?.token}
              onBackToLogin={() => handleNavigation('/auth/login')}
            />
          )}
        </div>
      </div>
    </div>
  );
};
