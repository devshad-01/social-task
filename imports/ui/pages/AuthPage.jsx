import React, { useState } from 'react';
import { AuthContainer } from '../components/auth/AuthContainer';
import { App } from '../App';

export const AuthPage = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleAuthenticated = (authData) => {
    setUser(authData.user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  if (isAuthenticated && user) {
    return <App user={user} onLogout={handleLogout} />;
  }

  return <AuthContainer onAuthenticated={handleAuthenticated} />;
};
