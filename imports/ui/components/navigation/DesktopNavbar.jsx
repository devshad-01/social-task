import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icons } from '../Icons';
import { NavigationContext } from '../../context/NavigationContext';
import { NotificationBell } from '../notifications/NotificationBell';
import { UserMenu } from './UserMenu';
import { useRole } from '../../hooks/useRole';

export const DesktopNavbar = () => {
  const { 
    navigationItems, 
    activeTab, 
    setActiveTab, 
    unreadCount, 
    user, 
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    canCreateTasks
  } = useContext(NavigationContext);
  const { isAdmin } = useRole();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const navigate = useNavigate();

  // Filter navigation items for desktop navbar based on role
  const mainNavItems = navigationItems.filter(item => {
    const adminOnlyPages = ['clients', 'team', 'analytics', 'posts'];
    // Show all pages to admin, hide admin-only pages from team members
    return isAdmin || !adminOnlyPages.includes(item.id);
  });

  const handleNotificationClick = (notification) => {
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    } else {
      navigate('/notifications');
    }
    if (notification.id) {
      markNotificationAsRead(notification.id);
    }
  };

  return (
    <nav className="desktop-navbar">
      <div className="desktop-navbar-container">
        <div className="desktop-navbar-top">
          {/* Logo */}
          <div className="desktop-logo">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-xl font-bold text-gray-800">Posty</span>
            </div>
          </div>

          {/* Main Navigation */}
          <div className="desktop-nav-items">
            {mainNavItems.map((item) => {
              const Icon = Icons[item.icon];
              const isActive = activeTab === item.id;

              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => setActiveTab(item.id)}
                  className={`desktop-nav-item ${isActive ? 'desktop-nav-item-active' : ''}`}
                >
                  <Icon className="desktop-nav-icon" />
                  <span className="desktop-nav-label">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Quick Actions - Only show for admin/managers */}
          {canCreateTasks && (
            <div className="desktop-quick-actions">
              <h3 className="desktop-quick-actions-title">Quick Actions</h3>
              <div className="desktop-quick-actions-grid">
                <button
                  onClick={() => navigate('/add-task')}
                  className="desktop-quick-action-btn"
                >
                  <Icons.tasks className="desktop-quick-action-icon" />
                  <span>Add Task</span>
                </button>
                <button
                  onClick={() => navigate('/add-post')}
                  className="desktop-quick-action-btn"
                >
                  <Icons.post className="desktop-quick-action-icon" />
                  <span>Add Post</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom section with user info */}
        <div className="desktop-navbar-bottom">
          {/* Search Bar */}
          <div className="desktop-search-container">
            <div className="search-input-wrapper">
              <Icons.search className="search-icon" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="search-input"
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
            </div>
          </div>

          {/* Notifications */}
          <div className="desktop-notification-container">
            <NotificationBell 
              notifications={notifications}
              onMarkAllAsRead={markAllNotificationsAsRead}
              onNotificationClick={handleNotificationClick}
            />
          </div>

          {/* User Menu - Simplified */}
          <div className="user-menu-container">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="user-menu-button-simple"
            >
              <div className="user-info-compact">
                <div className="user-name">{user?.name || 'User'}</div>
                <div className="user-role">{user?.role?.replace('-', ' ') || 'User'}</div>
              </div>
              <Icons.chevronDown className="menu-arrow-icon" />
            </button>

            {/* User Menu Dropdown */}
            {showUserMenu && (
              <div className="absolute bottom-full right-0 mb-2 z-50">
                <UserMenu onClose={() => setShowUserMenu(false)} />
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
