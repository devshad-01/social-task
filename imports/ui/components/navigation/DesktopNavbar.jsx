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
        <div className="desktop-navbar-left">
          <div className="desktop-logo">Posty</div>

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
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right side - Search, Notifications, User Menu */}
        <div className="desktop-navbar-right">
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
          <NotificationBell />

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
                  <span>{user.name.split(' ').map(n => n[0]).join('')}</span>
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
              <UserMenu />
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
