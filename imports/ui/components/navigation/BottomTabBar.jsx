import React, { useContext, useState } from 'react';
import { Icons } from '../Icons';
import { Link } from 'react-router-dom';
import { NavigationContext } from '../../context/NavigationContext';

export const BottomTabBar = () => {
  const { navigationItems, activeTab, setActiveTab } = useContext(NavigationContext);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Filter to main navigation items for bottom bar (dashboard, tasks, clients, profile)
  const mainTabs = navigationItems.filter(item => 
    ['dashboard', 'tasks', 'clients', 'profile'].includes(item.id)
  );

  // Split tabs to show add button in center
  const leftTabs = mainTabs.slice(0, 2); // dashboard, tasks
  const rightTabs = mainTabs.slice(2); // clients, profile

  const handleAddClick = () => {
    setShowAddModal(true);
  };

  const handleAddOption = (option) => {
    setShowAddModal(false);
    if (option === 'task') {
      // Navigate to add task
      window.location.href = '/add-post';
    } else if (option === 'social') {
      // Open social account modal (you can implement this)
      console.log('Add social account');
    }
  };

  return (
    <>
      <nav className="bottom-tab-bar">
        <div className="bottom-tab-container safe-area-bottom">
          {/* Left tabs */}
          {leftTabs.map((item) => {
            const Icon = item.icon && Icons[item.icon];
            const isActive = activeTab === item.id;
            const hasNotificationBadge = item.badge && item.badge > 0;

            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => setActiveTab(item.id)}
                className={`bottom-tab-item ${isActive ? 'bottom-tab-active' : ''}`}
              >
                <div className="bottom-tab-icon-wrapper">
                  <Icon 
                    className={`bottom-tab-icon ${isActive ? 'active' : ''}`} 
                  />
                  {hasNotificationBadge && (
                    <span className="notification-badge">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>
                <span className={`bottom-tab-label ${isActive ? 'active' : ''}`}>
                  {item.label}
                </span>
                
                {/* Active indicator */}
                {isActive && (
                  <div className="bottom-tab-indicator" />
                )}
              </Link>
            );
          })}
          
          {/* Center Add Button */}
          <button
            onClick={handleAddClick}
            className="bottom-tab-add-button"
          >
            <div className="add-button-icon">
              <Icons.plus className="w-6 h-6" />
            </div>
          </button>
          
          {/* Right tabs */}
          {rightTabs.map((item) => {
            const Icon = item.icon && Icons[item.icon];
            const isActive = activeTab === item.id;
            const hasNotificationBadge = item.badge && item.badge > 0;

            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => setActiveTab(item.id)}
                className={`bottom-tab-item ${isActive ? 'bottom-tab-active' : ''}`}
              >
                <div className="bottom-tab-icon-wrapper">
                  <Icon 
                    className={`bottom-tab-icon ${isActive ? 'active' : ''}`} 
                  />
                  {hasNotificationBadge && (
                    <span className="notification-badge">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>
                <span className={`bottom-tab-label ${isActive ? 'active' : ''}`}>
                  {item.label}
                </span>
                
                {/* Active indicator */}
                {isActive && (
                  <div className="bottom-tab-indicator" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
      
      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="sidebar-backdrop" onClick={() => setShowAddModal(false)}>
            <div className="backdrop-overlay" />
          </div>
          <div className="bg-white rounded-lg p-6 m-4 max-w-sm w-full relative z-10 shadow-xl">
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--neutral-800)' }}>
              What would you like to add?
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => handleAddOption('task')}
                className="w-full flex items-center gap-3 p-3 rounded-lg transition-colors hover-lift"
                style={{ 
                  backgroundColor: 'var(--primary-50)',
                  color: 'var(--primary-700)'
                }}
              >
                <Icons.tasks className="w-5 h-5" style={{ color: 'var(--primary-600)' }} />
                <span className="font-medium">Add Task</span>
              </button>
              <button
                onClick={() => handleAddOption('social')}
                className="w-full flex items-center gap-3 p-3 rounded-lg transition-colors hover-lift"
                style={{ 
                  backgroundColor: 'var(--secondary-50)',
                  color: 'var(--secondary-700)'
                }}
              >
                <Icons.facebook className="w-5 h-5" style={{ color: 'var(--secondary-600)' }} />
                <span className="font-medium">Add Social Account</span>
              </button>
            </div>
            <button
              onClick={() => setShowAddModal(false)}
              className="w-full mt-4 p-2 transition-colors"
              style={{ 
                color: 'var(--neutral-500)',
                ':hover': { color: 'var(--neutral-700)' }
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};
