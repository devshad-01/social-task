import React, { useRef, useEffect, useContext } from 'react';
import { Icons } from '../Icons';
import { Link } from 'react-router-dom';
import { NavigationContext } from '../../context/NavigationContext';

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

  // Filter admin-only items for sidebar
  const sidebarItems = navigationItems.filter(item => 
    ['clients', 'team', 'analytics'].includes(item.id)
  );

  const handleItemClick = (itemId) => {
    setActiveTab(itemId);
    closeMenu();
  };

  return (
    <div className="sidebar-backdrop animate-fade-in">
      {/* Backdrop */}
      <div className="backdrop-overlay" onClick={closeMenu} />
      
      {/* Sidebar */}
      <div 
        ref={sidebarRef}
        className="sidebar-container absolute left-0 top-0 bottom-0 w-80 bg-white shadow-2xl animate-slide-in-left"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">P</span>
                </div>
                <h2 className="text-xl font-bold text-neutral-800">Posty</h2>
              </div>
              <button
                onClick={closeMenu}
                className="btn-icon p-2"
                aria-label="Close menu"
              >
                <Icons.close className="w-6 h-6 text-neutral-600" />
              </button>
            </div>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center space-x-3">
              <div className="avatar avatar-lg bg-primary-100 text-primary-600 font-medium">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span>{user.name.split(' ').map(n => n[0]).join('')}</span>
                )}
              </div>
              <div>
                <p className="font-semibold text-neutral-800">{user.name}</p>
                <p className="text-sm text-neutral-600">{user.email}</p>
                <span className="badge badge-primary mt-1 capitalize">
                  {user.role.replace('-', ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 p-6 space-y-2">
            <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4">
              Admin Panel
            </h3>
            
            {sidebarItems.map((item) => {
              const Icon = Icons[item.icon];
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center space-x-3 p-4 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-primary-100 text-primary-700 border border-primary-200' 
                      : 'text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-2">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Quick Actions */}
            <div className="pt-6 mt-6 border-t border-neutral-200">
              <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4">
                Quick Actions
              </h3>
              
              <div className="space-y-2">
                <button className="w-full flex items-center space-x-3 p-4 rounded-xl text-neutral-700 hover:bg-neutral-100 transition-colors duration-200">
                  <Icons.user className="w-5 h-5" />
                  <span>Add Team Member</span>
                </button>
                
                <button className="w-full flex items-center space-x-3 p-4 rounded-xl text-neutral-700 hover:bg-neutral-100 transition-colors duration-200">
                  <Icons.building className="w-5 h-5" />
                  <span>Add Client</span>
                </button>
                
                <button className="w-full flex items-center space-x-3 p-4 rounded-xl text-neutral-700 hover:bg-neutral-100 transition-colors duration-200">
                  <Icons.tasks className="w-5 h-5" />
                  <span>Create Task</span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-neutral-200">
            <button className="w-full flex items-center space-x-3 p-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors duration-200">
              <Icons.logout className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
