import React, { useRef, useEffect, useContext } from 'react';
import { Icons } from '../Icons';
import { Link } from 'react-router-dom';
import { NavigationContext } from '../../context/NavigationContext';
import { Meteor } from 'meteor/meteor';

export const MobileSidebar = () => {
  const { navigationItems, activeTab, setActiveTab, isMenuOpen, closeMenu, user } = useContext(NavigationContext);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen, closeMenu]);

  if (!isMenuOpen) return null;

  // Filter main navigation items for sidebar
  const mainItems = navigationItems.filter(item => 
    ['dashboard', 'tasks', 'clients', 'team', 'analytics'].includes(item.id)
  );

  const handleItemClick = (itemId) => {
    setActiveTab(itemId);
    closeMenu();
  };

  const handleLogout = () => {
    Meteor.logout();
    closeMenu();
  };

  return (
    <div className="sidebar-backdrop animate-fade-in">
      {/* Backdrop */}
      <div className="backdrop-overlay" onClick={closeMenu} />
      
      {/* Sidebar */}
      <div 
        ref={sidebarRef}
        className="sidebar-container mobile-sidebar-enhanced animate-slide-in-left"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="sidebar-header">
            <div className="flex items-center justify-between">
              <div className="sidebar-logo">
                <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-lg">P</span>
                </div>
                <span>Posty</span>
              </div>
              <button
                onClick={closeMenu}
                className="sidebar-close"
                aria-label="Close menu"
              >
                <Icons.close />
              </button>
            </div>
          </div>

          {/* User Info */}
          <div className="sidebar-user">
            <div className="flex items-center space-x-3">
              <div className="sidebar-avatar">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span>{user?.name?.split(' ').map(n => n[0]).join('') || 'U'}</span>
                )}
              </div>
              <div className="sidebar-user-info">
                <p className="sidebar-user-name">{user?.name || 'User'}</p>
                <p className="sidebar-user-email">{user?.email || 'user@example.com'}</p>
                <span className="sidebar-user-role">
                  {user?.role?.replace('-', ' ') || 'User'}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="sidebar-nav">
            <div className="sidebar-nav-section">
              <h3 className="sidebar-nav-title">Main Menu</h3>
              
              {mainItems.map((item) => {
                const Icon = Icons[item.icon];
                const isActive = activeTab === item.id;

                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={() => handleItemClick(item.id)}
                    className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                  >
                    <Icon className="sidebar-nav-icon" />
                    <span>{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs rounded-full min-w-[18px] h-4 flex items-center justify-center px-1">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Footer - Removed logout, moved to profile page */}
        </div>
      </div>
    </div>
  );
};
