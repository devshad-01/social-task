import React, { useContext, useState } from 'react';
import { Icons } from '../Icons';
import { Link, useNavigate } from 'react-router-dom';
import { NavigationContext } from '../../context/NavigationContext';
import { useRole } from '../../hooks/useRole';

export const BottomTabBar = () => {
  const { navigationItems, activeTab, setActiveTab, canCreateTasks } = useContext(NavigationContext);
  const { isAdmin } = useRole();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMoreModal, setShowMoreModal] = useState(false);
  const navigate = useNavigate();
  
  // Filter and reorder navigation items for bottom bar
  // For admin: dashboard, tasks, profile, more (with add button)
  // For user: dashboard, tasks, profile, more (no add button)
  const getOrderedTabs = () => {
    const allTabs = navigationItems.filter(item => 
      ['dashboard', 'tasks', 'profile'].includes(item.id)
    );
    
    // Add More tab for accessing additional features
    const moreTab = {
      id: 'more',
      label: 'More',
      icon: 'more',
      path: '#',
      onClick: () => setShowMoreModal(true)
    };
    
    // Reorder: dashboard, tasks on left; profile, more on right
    const dashboard = allTabs.find(item => item.id === 'dashboard');
    const tasks = allTabs.find(item => item.id === 'tasks');
    const profile = allTabs.find(item => item.id === 'profile');
    
    if (canCreateTasks) {
      // For admin: dashboard, tasks, [add button], profile, more
      return {
        leftTabs: [dashboard, tasks].filter(Boolean),
        rightTabs: [profile, moreTab].filter(Boolean)
      };
    } else {
      // For user: dashboard, tasks, profile, more (no add button)
      return {
        leftTabs: [dashboard, tasks].filter(Boolean),
        rightTabs: [profile, moreTab].filter(Boolean)
      };
    }
  };

  const { leftTabs, rightTabs } = getOrderedTabs();

  const handleAddClick = () => {
    setShowAddModal(true);
  };

  const handleAddOption = (option) => {
    setShowAddModal(false);
    if (option === 'task') {
      navigate('/add-task');
    } else if (option === 'post') {
      navigate('/add-post');
    }
  };

  return (
    <>
      <nav className="bottom-tab-bar bottom-tab-bar-enhanced">
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
                className={`bottom-tab-item ${isActive ? 'active' : ''}`}
              >
                <div className="bottom-tab-icon-wrapper">
                  <Icon 
                    className="bottom-tab-icon" 
                  />
                  {hasNotificationBadge && (
                    <span className="notification-badge notification-badge-enhanced">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>
                <span className="bottom-tab-label">
                  {item.label}
                </span>
              </Link>
            );
          })}
          
          {/* Center Add Button - Only show for admin/managers */}
          {canCreateTasks && (
            <button
              onClick={handleAddClick}
              className="bottom-tab-add-button"
            >
              <Icons.plus />
            </button>
          )}
          
          {/* Right tabs */}
          {rightTabs.map((item) => {
            const Icon = item.icon && Icons[item.icon];
            const isActive = activeTab === item.id;
            const hasNotificationBadge = item.badge && item.badge > 0;

            // Handle More tab differently
            if (item.id === 'more') {
              return (
                <button
                  key={item.id}
                  onClick={item.onClick}
                  className="bottom-tab-item"
                >
                  <div className="bottom-tab-icon-wrapper">
                    <Icon className="bottom-tab-icon" />
                  </div>
                  <span className="bottom-tab-label">
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => setActiveTab(item.id)}
                className={`bottom-tab-item ${isActive ? 'active' : ''}`}
              >
                <div className="bottom-tab-icon-wrapper">
                  <Icon 
                    className="bottom-tab-icon" 
                  />
                  {hasNotificationBadge && (
                    <span className="notification-badge notification-badge-enhanced">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>
                <span className="bottom-tab-label">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
      
      {/* Add Modal */}
      {showAddModal && (
        <div className="sidebar-backdrop animate-fade-in z-50 flex items-center justify-center">
          {/* Overlay click closes modal */}
          <div className="backdrop-overlay" onClick={() => setShowAddModal(false)} />
          <div className="bg-white rounded-xl p-6 m-4 max-w-sm w-full relative z-10 shadow-2xl animate-scale-in">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              What would you like to add?
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => handleAddOption('task')}
                className="w-full flex items-center gap-3 p-4 rounded-lg transition-all duration-200 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:scale-105"
              >
                <Icons.tasks className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Add Task</span>
              </button>
              <button
                onClick={() => handleAddOption('post')}
                className="w-full flex items-center gap-3 p-4 rounded-lg transition-all duration-200 bg-green-50 hover:bg-green-100 text-green-700 hover:scale-105"
              >
                <Icons.post className="w-5 h-5 text-green-600" />
                <span className="font-medium">Add Post</span>
              </button>
            </div>
            <button
              onClick={() => setShowAddModal(false)}
              className="w-full mt-4 p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* More Modal */}
      {showMoreModal && (
        <div className="sidebar-backdrop animate-fade-in z-50 flex items-center justify-center">
          {/* Overlay click closes modal */}
          <div className="backdrop-overlay" onClick={() => setShowMoreModal(false)} />
          <div className="bg-white rounded-xl p-6 m-4 max-w-sm w-full relative z-10 shadow-2xl animate-scale-in">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              More Options
            </h3>
            <div className="space-y-3">
              {/* Admin-only options */}
              {isAdmin && (
                <>
                  <button
                    onClick={() => {
                      setShowMoreModal(false);
                      navigate('/clients');
                    }}
                    className="w-full flex items-center gap-3 p-4 rounded-lg transition-all duration-200 bg-purple-50 hover:bg-purple-100 text-purple-700 hover:scale-105"
                  >
                    <Icons.building className="w-5 h-5 text-purple-600" />
                    <span className="font-medium">Clients</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowMoreModal(false);
                      navigate('/analytics');
                    }}
                    className="w-full flex items-center gap-3 p-4 rounded-lg transition-all duration-200 bg-green-50 hover:bg-green-100 text-green-700 hover:scale-105"
                  >
                    <Icons.chart className="w-5 h-5 text-green-600" />
                    <span className="font-medium">Analytics</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowMoreModal(false);
                      navigate('/team');
                    }}
                    className="w-full flex items-center gap-3 p-4 rounded-lg transition-all duration-200 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:scale-105"
                  >
                    <Icons.users className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">Team</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowMoreModal(false);
                      navigate('/admin-system');
                    }}
                    className="w-full flex items-center gap-3 p-4 rounded-lg transition-all duration-200 bg-red-50 hover:bg-red-100 text-red-700 hover:scale-105"
                  >
                    <Icons.settings className="w-5 h-5 text-red-600" />
                    <span className="font-medium">System Admin</span>
                  </button>
                </>
              )}
              
              {/* Available to all users */}
              <button
                onClick={() => {
                  setShowMoreModal(false);
                  navigate('/notifications');
                }}
                className="w-full flex items-center gap-3 p-4 rounded-lg transition-all duration-200 bg-orange-50 hover:bg-orange-100 text-orange-700 hover:scale-105"
              >
                <Icons.bell className="w-5 h-5 text-orange-600" />
                <span className="font-medium">Notifications</span>
              </button>
              <button
                onClick={() => {
                  setShowMoreModal(false);
                  navigate('/settings');
                }}
                className="w-full flex items-center gap-3 p-4 rounded-lg transition-all duration-200 bg-gray-50 hover:bg-gray-100 text-gray-700 hover:scale-105"
              >
                <Icons.settings className="w-5 h-5 text-gray-600" />
                <span className="font-medium">Settings</span>
              </button>
            </div>
            <button
              onClick={() => setShowMoreModal(false)}
              className="w-full mt-4 p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};
