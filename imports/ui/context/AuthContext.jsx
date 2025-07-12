import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { WebPushService } from '../../api/notifications/webPush';

// Create the AuthContext
const AuthContext = createContext();

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const auth = useAuth();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Track auth state changes
  useEffect(() => {
    if (!auth.isLoading) {
      setLoading(false);
      console.log('[AuthProvider] Auth state loaded, user present:', !!auth.user);
      
      // Don't auto-request notification permission - it must be user-initiated
      // We'll add a notification permission request in the notification bell component
    }
  }, [auth.isLoading, auth.user]);
  
  // Enhanced logout function that navigates to login
  const enhancedLogout = async () => {
    console.log('[AuthProvider] Logging out user');
    try {
      await auth.logout();
      navigate('/auth/login');
      console.log('[AuthProvider] User logged out successfully');
    } catch (error) {
      console.error('[AuthProvider] Logout error:', error);
    }
  };
  
  const value = {
    ...auth,
    loading,
    logout: enhancedLogout,
    isAuthenticated: !!auth.user,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

// Custom hook to use AuthContext
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

// Export the context as default
export default AuthContext;
