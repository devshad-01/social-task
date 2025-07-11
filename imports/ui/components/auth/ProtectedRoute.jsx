import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';

/**
 * A wrapper component that redirects to the login page if the user is not authenticated
 */
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthContext();
  const location = useLocation();
  
  if (isLoading) {
    // Show loading spinner while checking auth
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <svg className="animate-spin h-12 w-12 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    // Redirect to login page but save the attempted location
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  
  return children;
};

/**
 * A wrapper component that redirects to the home page if the user is already authenticated
 */
export const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthContext();
  const location = useLocation();
  
  // Get the saved location from state or use home page as default
  const from = location.state?.from?.pathname || '/';
  
  if (isLoading) {
    // Show loading spinner while checking auth
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <svg className="animate-spin h-12 w-12 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }
  
  if (isAuthenticated) {
    // Redirect to the page they were trying to access before login
    return <Navigate to={from} replace />;
  }
  
  return children;
};
