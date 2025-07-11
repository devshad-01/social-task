import React, { useContext, useState } from 'react';
import { Icons } from '../Icons';
import { NavigationContext } from '../../context/NavigationContext';
import { UserMenu } from './UserMenu';

export const MobileTopHeader = () => {
  const { toggleMenu, unreadCount, user } = useContext(NavigationContext);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="mobile-header safe-area-top">
      <div className="mobile-header-left">
        <button
          onClick={toggleMenu}
          className="header-icon-button"
          aria-label="Open menu"
        >
          <Icons.menu />
        </button>
        <div className="mobile-header-title">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center mr-2">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <span className="text-lg font-semibold text-gray-800">Posty</span>
        </div>
      </div>

      <div className="mobile-header-actions">
        <button className="header-icon-button" aria-label="Search">
          <Icons.search />
        </button>
        
        <button className="header-icon-button notification-button" aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}>
          <Icons.bell />
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
          )}
        </button>

        {/* User Avatar Button */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="header-icon-button p-1"
            aria-label="User menu"
          >
            <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-medium text-sm">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span>{user.name.split(' ').map(n => n[0]).join('')}</span>
              )}
            </div>
          </button>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 top-12 z-50">
              <UserMenu onClose={() => setShowUserMenu(false)} />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
