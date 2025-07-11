import React, { createContext, useState, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Define the shape of our navigation state
const initialState = {
  activeTab: 'dashboard',
  isMenuOpen: false,
  isSearchOpen: false,
  notifications: [],
  unreadCount: 0,
  user: {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin',
    avatar: null,
  }
};

// Create the context
export const NavigationContext = createContext(initialState);

// Create the provider component
export const NavigationProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState(initialState.activeTab);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState(initialState.user);
  
  const location = useLocation();

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

  // Mock notifications - replace with actual data
  useEffect(() => {
    const mockNotifications = [
      {
        id: '1',
        title: 'New task assigned',
        message: 'You have been assigned a new social media task',
        type: 'task',
        read: false,
        timestamp: new Date(),
      },
      {
        id: '2',
        title: 'Comment added',
        message: 'Sarah commented on your task',
        type: 'comment',
        read: false,
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
      }
    ];
    
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  }, []);

  // Navigation items based on user role
  const getNavigationItems = () => {
    const baseItems = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: 'home',
        path: '/',
        roles: ['admin', 'team-member']
      },
      {
        id: 'tasks',
        label: 'Tasks',
        icon: 'tasks',
        path: '/tasks',
        roles: ['admin', 'team-member']
      },
      {
        id: 'notifications',
        label: 'Notifications',
        icon: 'bell',
        path: '/notifications',
        roles: ['admin', 'team-member'],
        badge: unreadCount
      },
      {
        id: 'profile',
        label: 'Profile',
        icon: 'user',
        path: '/profile',
        roles: ['admin', 'team-member']
      }
    ];

    const adminItems = [
      {
        id: 'clients',
        label: 'Clients',
        icon: 'building',
        path: '/clients',
        roles: ['admin']
      },
      {
        id: 'team',
        label: 'Team',
        icon: 'users',
        path: '/team',
        roles: ['admin']
      },
      {
        id: 'analytics',
        label: 'Analytics',
        icon: 'chart',
        path: '/analytics',
        roles: ['admin']
      }, {
        id: 'posts',
        label: 'Posts',
        icon: 'plus',
        path: '/posts',
        roles: ['admin']
      }
    ];

    const items = user.role === 'admin' ? [...baseItems, ...adminItems] : baseItems;
    return items.filter(item => item.roles.includes(user.role));
  };

  const navigationItems = getNavigationItems();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);
  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);
  const closeSearch = () => setIsSearchOpen(false);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    closeMenu();
  };

  const value = {
    activeTab,
    setActiveTab: handleTabChange,
    isMenuOpen,
    toggleMenu,
    closeMenu,
    isSearchOpen,
    toggleSearch,
    closeSearch,
    navigationItems,
    user,
    notifications,
    unreadCount,
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
