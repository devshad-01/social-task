import React, { useContext } from 'react';
import { Icons } from '../Icons';
import { Link } from 'react-router-dom';
import { NavigationContext } from '../../context/NavigationContext';

export const BottomTabBar = () => {
  const { navigationItems, activeTab, setActiveTab } = useContext(NavigationContext);
  
  // Filter to main navigation items for bottom bar (first 4-5 items)
  const mainTabs = navigationItems.filter(item => 
    ['dashboard', 'tasks', 'notifications', 'profile'].includes(item.id)
  );

  return (
    <nav className="bottom-tab-bar">
      <div className="bottom-tab-container safe-area-bottom">
        {mainTabs.map((item) => {
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
  );
};
