import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';

export const useRole = () => {
  return useTracker(() => {
    const user = Meteor.user();
    const userId = Meteor.userId();
    
    if (!user || !userId) {
      return {
        hasRole: () => false,
        isAdmin: false,
        isTeamMember: false,
        roles: []
      };
    }

    // Check both profile.role and Meteor Roles for compatibility
    const profileRole = user.profile?.role;
    const userRoles = Roles.getRolesForUser(userId) || [];
    
    const hasRole = (roles) => {
      if (typeof roles === 'string') {
        // Check both profile role and Meteor roles
        return profileRole === roles || Roles.userIsInRole(userId, roles);
      }
      if (Array.isArray(roles)) {
        return roles.some(role => profileRole === role || Roles.userIsInRole(userId, role));
      }
      return false;
    };

    // Check for admin role in both systems
    const isAdmin = profileRole === 'admin' || 
                   Roles.userIsInRole(userId, 'admin') || 
                   Roles.userIsInRole(userId, 'supervisor');

    // Check for team member role
    const isTeamMember = profileRole === 'team-member' || 
                        profileRole === 'user' || 
                        (!isAdmin);

    return {
      hasRole,
      isAdmin,
      isTeamMember,
      profileRole,
      roles: userRoles
    };
  });
};
