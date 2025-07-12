import React, { createContext, useState, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Notifications as NotificationsCollection } from '../../api/notifications/NotificationsCollection';

// Define the shape of our navigation state
const initialState = {
  activeTab: 'dashboard',
  isMenuOpen: false,
  isSearchOpen: false,
  notifications: [],
  unreadCount: 0,
  user: null
};

// Create the context
export const NavigationContext = createContext(initialState);

// Create the provider component
export const NavigationProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState(initialState.activeTab);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const location = useLocation();

  // Track user and notifications with Meteor's reactive data
  const { user, notifications, unreadCount } = useTracker(() => {
    const userHandle = Meteor.subscribe('userData');
    const notificationsHandle = Meteor.subscribe('notifications.user');
    const unreadCountHandle = Meteor.subscribe('notifications.unreadCount');
    
    const user = Meteor.user();
    const notifications = NotificationsCollection.find({}, { 
      sort: { createdAt: -1 }, 
      limit: 10 
    }).fetch();
    
    const unreadCount = NotificationsCollection.find({ read: false }).count();
    
    return {
      user: user ? {
        id: user._id,
        name: user.profile?.firstName && user.profile?.lastName 
          ? `${user.profile.firstName} ${user.profile.lastName}`
          : user.username || 'User',
        email: user.emails?.[0]?.address || '',
        role: user.profile?.role || 'user',
        avatar: user.profile?.avatar || null,
        isEmailVerified: user.emails?.[0]?.verified || false
      } : null,
      notifications,
      unreadCount,
      loading: !userHandle.ready() || !notificationsHandle.ready() || !unreadCountHandle.ready()
    };
  }, []);

  // Update active tab based on route
  useEffect(() => {
    const path = location.pathname;
    
    if (path === '/') setActiveTab('dashboard');
    else if (path === '/tasks') setActiveTab('tasks');
    else if (path === '/notifications') setActiveTab('notifications');
    else if (path === '/profile') setActiveTab('profile');
    else if (path === '/clients') setActiveTab('clients');
    else if (path === '/team') setActiveTab('team');
    else if (path === '/analytics') setActiveTab('analytics');
    else if (path === '/posts') setActiveTab('posts');

  }, [location]);

  // Notification actions
  const markNotificationAsRead = (notificationId) => {
    Meteor.call('notifications.markAsRead', notificationId, (error) => {
      if (error) {
        console.error('Error marking notification as read:', error);
      }
    });
  };

  const markAllNotificationsAsRead = () => {
    Meteor.call('notifications.markAllAsRead', (error) => {
      if (error) {
        console.error('Error marking all notifications as read:', error);
      }
    });
  };

  // Navigation items based on user role
  const getNavigationItems = () => {
    const baseItems = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: 'home',
        path: '/',
        roles: ['admin', 'manager', 'user']
      },
      {
        id: 'tasks',
        label: 'Tasks',
        icon: 'tasks',
        path: '/tasks',
        roles: ['admin', 'manager', 'user']
      },
      {
        id: 'notifications',
        label: 'Notifications',
        icon: 'bell',
        path: '/notifications',
        roles: ['admin', 'manager', 'user'],
        badge: unreadCount
      },
      {
        id: 'profile',
        label: 'Profile',
        icon: 'user',
        path: '/profile',
        roles: ['admin', 'manager', 'user']
      },
      {
        id: 'clients',
        label: 'Clients',
        icon: 'building',
        path: '/clients',
        roles: ['admin', 'manager']
      },
      {
        id: 'team',
        label: 'Team',
        icon: 'users',
        path: '/team',
        roles: ['admin', 'manager']
      },
      {
        id: 'analytics',
        label: 'Analytics',
        icon: 'chart',
        path: '/analytics',
        roles: ['admin', 'manager']
      },
      {
        id: 'posts',
        label: 'Posts',
        icon: 'post',
        path: '/posts',
        roles: ['admin', 'manager', 'user']
      }
    ];

    // Filter items based on user role
    if (!user) return baseItems;
    
    return baseItems.filter(item => 
      item.roles.includes(user.role)
    );
  };

  const navigationItems = getNavigationItems();

  // Helper functions for navigation
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);
  const openSearch = () => setIsSearchOpen(true);
  const closeSearch = () => setIsSearchOpen(false);

  // Check if user has admin privileges
  const isAdmin = user?.role === 'admin';
  const canCreateTasks = user?.role === 'admin' || user?.role === 'manager';

  const value = {
    activeTab,
    setActiveTab,
    isMenuOpen,
    toggleMenu,
    closeMenu,
    isSearchOpen,
    openSearch,
    closeSearch,
    navigationItems,
    user,
    notifications,
    unreadCount,
    isAdmin,
    canCreateTasks,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

// Custom hook for using the navigation context
export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
