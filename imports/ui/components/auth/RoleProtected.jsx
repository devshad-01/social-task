import React from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import { Navigate } from 'react-router-dom';

export const RoleProtected = ({ children, allowedRoles = [], redirectTo = '/dashboard', fallback = null }) => {
  const { user, loading } = useTracker(() => ({
    user: Meteor.user(),
    loading: !Meteor.userId() && Meteor.loggingIn()
  }), []);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check if user has required roles
  const hasRequiredRole = allowedRoles.length === 0 || 
    Roles.userIsInRole(user._id, allowedRoles);

  if (!hasRequiredRole) {
    if (fallback) {
      return fallback;
    }
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export const useRole = () => {
  return useTracker(() => {
    const user = Meteor.user();
    return {
      user,
      isAdmin: user && Roles.userIsInRole(user._id, ['admin']),
      isSupervisor: user && Roles.userIsInRole(user._id, ['supervisor']),
      isAdminOrSupervisor: user && Roles.userIsInRole(user._id, ['admin', 'supervisor']),
      userRoles: user ? Roles.getRolesForUser(user._id) : []
    };
  }, []);
};
