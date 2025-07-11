import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Icons } from '../Icons';
import { NavigationContext } from '../../context/NavigationContext';
import { NotificationBell } from './NotificationBell';
import { UserMenu } from './UserMenu';

export const DesktopNavbar = () => {
  const { navigationItems, activeTab, setActiveTab, unreadCount, user, notifications } = useContext(NavigationContext);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Filter navigation items for desktop navbar
  const mainNavItems = navigationItems.filter(item => 
    ['dashboard', 'tasks', 'clients', 'team', 'analytics'].includes(item.id)
  );

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

          {/* User Menu */}
          <div className="user-menu-container">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="user-menu-button"
            >
              <div className="user-avatar">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="avatar-image" />
                ) : (
                  <span className="text-sm font-medium">{user.name.split(' ').map(n => n[0]).join('')}</span>
                )}
              </div>
              <div className="user-info">
                <div className="user-name">{user.name}</div>
                <div className="user-role">{user.role.replace('-', ' ')}</div>
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
