import React from 'react';
import PropTypes from 'prop-types';

/**
 * MobileLoader - A versatile loading component for mobile pages
 * 
 * Usage Examples:
 * 
 * // Basic spinner
 * <MobileLoader type="spinner" message="Loading..." />
 * 
 * // Skeleton loader for lists/dashboards
 * <MobileLoader type="skeleton" showMessage={false} />
 * 
 * // Dots animation
 * <MobileLoader type="dots" message="Processing..." size="small" />
 * 
 * // Pulse animation
 * <MobileLoader type="pulse" message="Syncing data..." size="large" />
 * 
 * // Default loader
 * <MobileLoader /> // Uses default spinner with "Loading..." message
 */

export const MobileLoader = ({ 
  type = 'default', 
  message = 'Loading...', 
  showMessage = true,
  size = 'medium'
}) => {
  const getLoaderClass = () => {
    switch (type) {
      case 'skeleton':
        return 'mobile-loader-skeleton';
      case 'spinner':
        return 'mobile-loader-spinner';
      case 'dots':
        return 'mobile-loader-dots';
      case 'pulse':
        return 'mobile-loader-pulse';
      default:
        return 'mobile-loader-default';
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'small':
        return 'mobile-loader-small';
      case 'large':
        return 'mobile-loader-large';
      default:
        return 'mobile-loader-medium';
    }
  };

  // Skeleton loader for dashboard/lists
  if (type === 'skeleton') {
    return (
      <div className="mobile-loader-container">
        <div className="mobile-skeleton-content">
          <div className="mobile-skeleton-header">
            <div className="mobile-skeleton-title"></div>
            <div className="mobile-skeleton-subtitle"></div>
          </div>
          <div className="mobile-skeleton-cards">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="mobile-skeleton-card">
                <div className="mobile-skeleton-card-icon"></div>
                <div className="mobile-skeleton-card-content">
                  <div className="mobile-skeleton-card-title"></div>
                  <div className="mobile-skeleton-card-text"></div>
                  <div className="mobile-skeleton-card-meta">
                    <div className="mobile-skeleton-card-avatar"></div>
                    <div className="mobile-skeleton-card-date"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Default centered loaders
  return (
    <div className={`mobile-loader-container ${getLoaderClass()} ${getSizeClass()}`}>
      <div className="mobile-loader-content">
        {type === 'spinner' && (
          <div className="mobile-spinner">
            <div className="mobile-spinner-ring"></div>
          </div>
        )}
        
        {type === 'dots' && (
          <div className="mobile-dots">
            <div className="mobile-dot"></div>
            <div className="mobile-dot"></div>
            <div className="mobile-dot"></div>
          </div>
        )}
        
        {type === 'pulse' && (
          <div className="mobile-pulse">
            <div className="mobile-pulse-circle"></div>
          </div>
        )}
        
        {type === 'default' && (
          <div className="mobile-default-loader">
            <div className="mobile-default-spinner"></div>
          </div>
        )}
        
        {showMessage && (
          <p className="mobile-loader-message">{message}</p>
        )}
      </div>
    </div>
  );
};

MobileLoader.propTypes = {
  type: PropTypes.oneOf(['default', 'skeleton', 'spinner', 'dots', 'pulse']),
  message: PropTypes.string,
  showMessage: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large'])
};
