import React, { useRef, useEffect, useContext, useState } from 'react';
import { Icons } from '../Icons';
import { NavigationContext } from '../../context/NavigationContext';
import { useAuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const UserMenu = ({ onClose }) => {
  const { user } = useContext(NavigationContext);
  const { logout } = useAuthContext();
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };
  
  const handleLogout = async (e) => {
    e.preventDefault();
    console.log('[UserMenu] Logging out user');
    try {
      await logout();
      handleClose();
      navigate('/auth/login');
    } catch (error) {
      console.error('[UserMenu] Logout error:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        handleClose();
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const menuItems = [
    {
      id: 'profile',
      label: 'Profile',
      icon: Icons.user,
      description: 'View and edit your profile'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Icons.settings,
      description: 'Manage your preferences'
    },
    ...(user.role === 'admin' ? [
      {
        id: 'admin',
        label: 'Admin Panel',
        icon: Icons.settings,
        description: 'Manage app settings'
      }
    ] : []),
    {
      id: 'logout',
      label: 'Sign Out',
      icon: Icons.logout,
      description: 'Sign out of your account',
      danger: true
    }
  ];

  const handleMenuItemClick = (itemId) => {
    switch (itemId) {
      case 'profile':
        navigate('/profile');
        break;
      case 'settings':
        navigate('/settings');
        break;
      case 'admin':
        navigate('/admin');
        break;
      case 'logout':
        handleLogout(new Event('click'));
        return;
      default:
        break;
    }
    handleClose();
  };

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 animate-fade-in" onClick={onClose}>
        <div 
          ref={menuRef}
          className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Handle */}
          <div className="flex justify-center py-3">
            <div className="w-10 h-1 bg-neutral-300 rounded-full" />
          </div>

          {/* User Info */}
          <div className="px-6 pb-4 border-b border-neutral-200">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary-100 text-primary-600 font-medium rounded-full flex items-center justify-center">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span>{user.name.split(' ').map(n => n[0]).join('')}</span>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-800">{user.name}</h3>
                <p className="text-sm text-neutral-600">{user.email}</p>
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-primary-100 text-primary-600 rounded-full mt-1 capitalize">
                  {user.role.replace('-', ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="px-6 py-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleMenuItemClick(item.id)}
                className={`w-full flex items-center space-x-4 p-3 rounded-xl transition-colors duration-200 ${
                  item.danger 
                    ? 'hover:bg-red-50 text-red-600' 
                    : 'hover:bg-neutral-100 text-neutral-700'
                }`}
              >
                {React.createElement(item.icon, { className: "w-5 h-5" })}
                <div className="flex-1 text-left">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-sm text-neutral-500">{item.description}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Bottom padding for safe area */}
          <div className="pb-safe-area-inset-bottom" />
        </div>
      </div>
    );
  }

  // Desktop dropdown
  return (
    <div 
      ref={menuRef}
      className="w-64 bg-white rounded-xl shadow-lg border border-neutral-200 py-2 animate-fade-in"
    >
      {/* User Info */}
      <div className="px-4 py-3 border-b border-neutral-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-100 text-primary-600 font-medium rounded-full flex items-center justify-center">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-sm">{user.name.split(' ').map(n => n[0]).join('')}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-neutral-800 truncate">{user.name}</div>
            <div className="text-sm text-neutral-500 truncate">{user.email}</div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleMenuItemClick(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-neutral-50 transition-colors duration-200 ${
              item.danger ? 'text-red-600 hover:bg-red-50' : 'text-neutral-700'
            }`}
          >
            {React.createElement(item.icon, { className: "w-4 h-4" })}
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
