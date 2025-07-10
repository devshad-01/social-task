import React, { useRef, useEffect, useContext } from 'react';
import { Icons } from '../Icons';
import { NavigationContext } from '../../context/NavigationContext';

export const UserMenu = ({ onClose }) => {
  const { user } = useContext(NavigationContext);
  const menuRef = useRef(null);
  
  const handleClose = () => {
    if (onClose) {
      onClose();
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
    // Handle menu item actions
    switch (itemId) {
      case 'profile':
        console.log('Navigate to profile');
        break;
      case 'settings':
        console.log('Navigate to settings');
        break;
      case 'admin':
        console.log('Navigate to admin panel');
        break;
      case 'logout':
        console.log('Handle logout');
        break;
      default:
        break;
    }
    onClose();
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
              <div className="avatar avatar-lg bg-primary-100 text-primary-600 font-medium">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span>{user.name.split(' ').map(n => n[0]).join('')}</span>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-800">{user.name}</h3>
                <p className="text-sm text-neutral-600">{user.email}</p>
                <span className="badge badge-primary mt-1 capitalize">
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
                <item.icon className="w-5 h-5" />
                <div className="flex-1 text-left">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-sm text-neutral-500">{item.description}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Safe area padding */}
          <div className="safe-area-bottom" />
        </div>
      </div>
    );
  }

  // Desktop dropdown menu
  return (
    <div 
      ref={menuRef}
      className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-neutral-200 z-50 animate-fade-in"
    >
      {/* User Info */}
      <div className="p-4 border-b border-neutral-200">
        <div className="flex items-center space-x-3">
          <div className="avatar avatar-base bg-primary-100 text-primary-600 font-medium">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span>{user.name.split(' ').map(n => n[0]).join('')}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-neutral-800 truncate">{user.name}</p>
            <p className="text-xs text-neutral-600 truncate">{user.email}</p>
            <span className="badge badge-primary text-xs mt-1 capitalize">
              {user.role.replace('-', ' ')}
            </span>
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
              item.danger ? 'text-red-600' : 'text-neutral-700'
            }`}
          >
            <item.icon className="w-4 h-4" />
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
