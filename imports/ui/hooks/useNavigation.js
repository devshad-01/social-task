import { useState, useEffect } from 'react';

export const useNavigation = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Mock user data - replace with actual user data from Meteor
  const [user, setUser] = useState({
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin', // 'admin' or 'team-member'
    avatar: null,
  });

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

  return {
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
};
