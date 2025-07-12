import React, { useContext, useState } from 'react';
import { Icons } from '../Icons';
import { NavigationContext } from '../../context/NavigationContext';
import { UserMenu } from './UserMenu';

export const MobileTopHeader = () => {
  const { toggleMenu, unreadCount, user } = useContext(NavigationContext);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="mobile-header mobile-header-enhanced safe-area-top">
      <div className="mobile-header-left">
        <button
          onClick={toggleMenu}
          className="header-icon-button"
          aria-label="Open menu"
        >
          <Icons.menu />
        </button>
        <div className="mobile-header-title">
          <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center mr-3">
            <span className="text-white font-bold text-lg">P</span>
          </div>
          <span>Posty</span>
        </div>
      </div>

      <div className="mobile-header-actions">
        <button 
          className="header-icon-button notification-button" 
          aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        >
          <Icons.bell />
          {unreadCount > 0 && (
            <span className="notification-badge notification-badge-enhanced">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* User Avatar Button */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="header-icon-button"
            aria-label="User menu"
            style={{ padding: 0 }}
          >
            <div className="user-avatar-mobile">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} />
              ) : (
                <span>{user?.name?.split(' ').map(n => n[0]).join('') || 'U'}</span>
              )}
            </div>
          </button>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 top-14 z-50">
              <UserMenu onClose={() => setShowUserMenu(false)} />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
