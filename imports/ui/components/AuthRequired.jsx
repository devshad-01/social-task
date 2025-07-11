import React from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { useAuth } from '../hooks/useAuth';
import { useTokenRoutes } from '../hooks/useTokenRoutes';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContainer } from './auth/AuthContainer';

export const AuthRequired = ({ children }) => {
  const { user, userId } = useTracker(() => {
    return {
      user: Meteor.user(),
      userId: Meteor.userId()
    };
  }, []);

  const { currentForm, tokenData } = useTokenRoutes();
  const location = useLocation();

  console.log('[AuthRequired] user:', !!user);
  console.log('[AuthRequired] userId:', !!userId);
  console.log('[AuthRequired] currentForm:', currentForm);
  console.log('[AuthRequired] current location:', location.pathname);

  const handleNavigation = (path) => {
    console.log('[AuthRequired] Navigating to:', path);
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  // If user is not authenticated, show auth forms
  if (!user && !userId) {
    console.log('[AuthRequired] No user found, showing auth forms');
    
    // If the user is trying to access an auth route directly, allow it
    if (location.pathname.startsWith('/auth/') || 
        location.pathname.includes('/reset-password') || 
        location.pathname.includes('/verify-email')) {
      return <AuthContainer 
        currentForm={currentForm} 
        tokenData={tokenData} 
        handleNavigation={handleNavigation}
      />;
    }
    
    // Otherwise, redirect to login
    return <Navigate to="/auth/login" replace />;
  }

  console.log('[AuthRequired] User is authenticated, showing main app');
  
  // If authenticated user is trying to access an auth route, redirect to main app
  if (location.pathname.startsWith('/auth/') || 
      location.pathname.includes('/reset-password') || 
      location.pathname.includes('/verify-email')) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};
