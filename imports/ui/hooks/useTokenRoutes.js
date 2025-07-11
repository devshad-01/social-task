import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useTokenRoutes = () => {
  const [currentForm, setCurrentForm] = useState('login');
  const [tokenData, setTokenData] = useState(null);
  const location = useLocation();

  const determineCurrentForm = () => {
    const path = location.pathname;
    const params = new URLSearchParams(location.search);
    
    console.log('[useTokenRoutes] Current path:', path);
    console.log('[useTokenRoutes] Current params:', params.toString());
    
    if (path.includes('/reset-password')) {
      const token = params.get('token');
      if (token) {
        console.log('[useTokenRoutes] Setting reset-password form with token');
        setCurrentForm('reset-password');
        setTokenData({ token });
      } else {
        console.log('[useTokenRoutes] No token for reset-password, defaulting to login');
        setCurrentForm('login');
      }
    } else if (path.includes('/verify-email')) {
      const token = params.get('token');
      if (token) {
        console.log('[useTokenRoutes] Setting verify-email form with token');
        setCurrentForm('verify-email');
        setTokenData({ token });
      } else {
        console.log('[useTokenRoutes] No token for verify-email, defaulting to login');
        setCurrentForm('login');
      }
    } else if (path.includes('/signup') || path.includes('/auth/signup')) {
      console.log('[useTokenRoutes] Setting signup form');
      setCurrentForm('signup');
      setTokenData(null);
    } else if (path.includes('/forgot-password') || path.includes('/auth/forgot-password')) {
      console.log('[useTokenRoutes] Setting forgot-password form');
      setCurrentForm('forgot-password');
      setTokenData(null);
    } else if (path.includes('/login') || path.includes('/auth/login') || path === '/auth') {
      console.log('[useTokenRoutes] Setting login form');
      setCurrentForm('login');
      setTokenData(null);
    } else {
      // Only default to login for auth-related paths
      if (path.startsWith('/auth/')) {
        console.log('[useTokenRoutes] Unknown auth path, defaulting to login');
        setCurrentForm('login');
        setTokenData(null);
      }
    }
  };

  useEffect(() => {
    determineCurrentForm();
  }, [location.pathname, location.search]);

  // Also listen for popstate events for non-React Router navigation
  useEffect(() => {
    const handlePopState = () => {
      console.log('[useTokenRoutes] Pop state event detected');
      determineCurrentForm();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return { currentForm, tokenData };
};
