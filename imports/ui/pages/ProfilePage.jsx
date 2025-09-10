import React, { useState, useContext } from 'react';
import ProfileUpdateForm from '../components/profile/ProfileUpdateForm';
import ChangePasswordForm from '../components/profile/ChangePasswordForm';
import { Icons } from '../components/Icons';
import { useAuthContext } from '../context/AuthContext';
import { ResponsiveContext } from '../context/ResponsiveContext';
import { WebPushService } from '../../api/notifications/webPush';
import { Meteor } from 'meteor/meteor';

export const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);
  const { user, isLoading, resendVerificationEmail } = useAuthContext();
  const { isMobileOrTablet } = useContext(ResponsiveContext);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: Icons.user },
    { id: 'security', label: 'Security', icon: Icons.settings },
    { id: 'notifications', label: 'Notifications', icon: Icons.bell }
  ];

  const handleLogout = () => {
    Meteor.logout();
  };

  const handleEnableNotifications = async () => {
    try {
      const subscription = await WebPushService.requestPermissionAndSubscribe();
      setNotificationPermission(subscription ? 'granted' : 'denied');
      if (subscription) {
        // Send a test notification using the new notification system
        await new Promise((resolve, reject) => {
          Meteor.call('notifications.sendTest', {
            title: 'Notifications Enabled!',
            message: 'You will now receive push notifications for task updates.',
            actionUrl: '/notifications'
          }, (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          });
        });
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
    }
  };

  const handleTestNotification = async () => {
    try {
      await new Promise((resolve, reject) => {
        Meteor.call('notifications.sendTest', {
          title: 'Test Notification',
          message: 'This is a test notification to check if everything is working correctly!',
          actionUrl: '/dashboard'
        }, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
      alert('Failed to send test notification. Please make sure notifications are enabled.');
    }
  };

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8">
        <svg className="animate-spin h-12 w-12 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <div className={`profile-page-enhanced ${isMobileOrTablet ? 'mobile' : 'desktop'}`}>
      {/* Mobile Header */}
      {isMobileOrTablet && (
        <div className="profile-mobile-header">
          <div className="profile-user-summary">
            <div className="profile-avatar-large">
              {user?.profile?.avatar ? (
                <img src={user.profile.avatar} alt={user?.profile?.fullName || 'User'} />
              ) : (
                <div className="avatar-placeholder">
                  <span>{user?.profile?.fullName?.split(' ').map(n => n[0]).join('') || user?.username?.charAt(0)?.toUpperCase() || 'U'}</span>
                </div>
              )}
            </div>
            <div className="profile-user-details">
              <h1 className="profile-name">{user?.profile?.fullName || user?.username || 'User'}</h1>
              <p className="profile-email">{user?.emails?.[0]?.address}</p>
              <div className="profile-badges">
                <div className="profile-role-badge">
                  <Icons.shield className="w-4 h-4" />
                  <span>{user?.profile?.role || 'User'}</span>
                </div>
                {user?.emails?.[0]?.verified ? (
                  <div className="profile-verified-badge">
                    <Icons.checkCircle className="w-4 h-4" />
                    <span>Verified</span>
                  </div>
                ) : (
                  <div className="profile-unverified-badge">
                    <Icons.alertTriangle className="w-4 h-4" />
                    <span>Unverified</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Header */}
      {!isMobileOrTablet && (
        <div className="profile-header">
          <div>
            <h1 className="profile-header-title">Profile</h1>
            <p className="profile-header-subtitle">Manage your account details and preferences</p>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className={`profile-tabs-enhanced ${isMobileOrTablet ? 'mobile' : 'desktop'}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`profile-tab-enhanced ${activeTab === tab.id ? 'active' : ''}`}
          >
            {React.createElement(tab.icon, { className: "profile-tab-icon-enhanced" })}
            <span className="profile-tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className={`profile-content-enhanced ${isMobileOrTablet ? 'mobile' : 'desktop'}`}>
        {activeTab === 'profile' && (
          <div className="profile-tab-section">
            {!isMobileOrTablet && (
              <div className="profile-avatar-section-desktop">
                <div className="profile-avatar">
                  {user?.profile?.avatar ? (
                    <img src={user.profile.avatar} alt={user?.profile?.fullName || 'User'} />
                  ) : (
                    <span>{user?.profile?.fullName?.split(' ').map(n => n[0]).join('') || 'U'}</span>
                  )}
                </div>
                <div className="profile-user-info">
                  <h2>{user?.profile?.fullName || 'User'}</h2>
                  <p>{user?.emails?.[0]?.address}</p>
                  <div className="profile-user-role">
                    <Icons.shield className="profile-verification-icon" />
                    {user?.profile?.role || 'User'} {user?.profile?.department ? `• ${user.profile.department}` : ''}
                  </div>
                </div>
              </div>
            )}
            
            <div className="profile-form-section-enhanced">
              <div className="profile-card">
                <div className="profile-card-header">
                  <h3>Personal Information</h3>
                  <p>Update your basic profile details</p>
                </div>
                <ProfileUpdateForm />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="profile-tab-section">
            <div className="profile-form-section-enhanced">
              <div className="profile-card">
                <div className="profile-card-header">
                  <h3>Change Password</h3>
                  <p>Keep your account secure with a strong password</p>
                </div>
                <ChangePasswordForm />
              </div>
            </div>
            
            <div className="profile-card">
              <div className="profile-card-header">
                <h3>Email Verification</h3>
                <p>Verify your email address for account security</p>
              </div>
              
              {user?.emails?.[0]?.verified ? (
                <div className="profile-status-section verified">
                  <div className="profile-status-indicator">
                    <Icons.checkCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="profile-status-content">
                    <h4>Email Verified</h4>
                    <p>Your email address has been successfully verified</p>
                  </div>
                </div>
              ) : (
                <div className="profile-status-section unverified">
                  <div className="profile-status-indicator">
                    <Icons.alertTriangle className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="profile-status-content">
                    <h4>Email Not Verified</h4>
                    <p>Please verify your email address to secure your account</p>
                    <button
                      onClick={() => resendVerificationEmail()}
                      className="profile-action-button primary"
                    >
                      <Icons.mail className="w-4 h-4" />
                      Resend Verification Email
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="profile-card">
              <div className="profile-card-header">
                <h3>Account Actions</h3>
                <p>Manage your session and account</p>
              </div>
              <div className="profile-action-section">
                <button
                  onClick={handleLogout}
                  className="profile-action-button danger"
                >
                  <Icons.logout className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="profile-tab-section">
            <div className="profile-card">
              <div className="profile-card-header">
                <h3>Browser Notifications</h3>
                <p>Get instant notifications for task assignments and updates</p>
              </div>
              
              <div className="profile-status-section">
                <div className="profile-status-indicator">
                  <Icons.bell className={`w-6 h-6 ${
                    notificationPermission === 'granted' ? 'text-green-600' : 
                    notificationPermission === 'denied' ? 'text-red-600' : 'text-gray-600'
                  }`} />
                </div>
                <div className="profile-status-content">
                  <h4>Notification Status</h4>
                  <p>
                    {notificationPermission === 'granted' 
                      ? 'Notifications are enabled and working' 
                      : notificationPermission === 'denied' 
                      ? 'Notifications are blocked by your browser' 
                      : 'Notifications are not set up yet'
                    }
                  </p>
                  
                  <div className="profile-action-group">
                    {notificationPermission !== 'granted' && (
                      <button
                        onClick={handleEnableNotifications}
                        className="profile-action-button primary"
                      >
                        <Icons.bell className="w-4 h-4" />
                        Enable Notifications
                      </button>
                    )}
                    
                    {notificationPermission === 'granted' && (
                      <button
                        onClick={handleTestNotification}
                        className="profile-action-button secondary"
                      >
                        <Icons.zap className="w-4 h-4" />
                        Send Test Notification
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {notificationPermission === 'denied' && (
                <div className="profile-alert danger">
                  <Icons.alertTriangle className="w-5 h-5" />
                  <div>
                    <h4>Notifications Blocked</h4>
                    <p>To enable notifications, click the lock icon in your browser's address bar and allow notifications.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="profile-card">
              <div className="profile-card-header">
                <h3>Notification Preferences</h3>
                <p>Choose what notifications you want to receive</p>
              </div>
              
              <div className="profile-preferences">
                <div className="profile-preference-item">
                  <div className="profile-preference-content">
                    <h4>Task Assignments</h4>
                    <p>Notify when tasks are assigned to you</p>
                  </div>
                  <div className="profile-preference-toggle">
                    <input type="checkbox" defaultChecked className="toggle-switch" />
                  </div>
                </div>
                
                <div className="profile-preference-item">
                  <div className="profile-preference-content">
                    <h4>Task Completions</h4>
                    <p>Notify when assigned tasks are completed</p>
                  </div>
                  <div className="profile-preference-toggle">
                    <input type="checkbox" defaultChecked className="toggle-switch" />
                  </div>
                </div>
                
                <div className="profile-preference-item">
                  <div className="profile-preference-content">
                    <h4>Due Date Reminders</h4>
                    <p>Notify about upcoming due dates</p>
                  </div>
                  <div className="profile-preference-toggle">
                    <input type="checkbox" defaultChecked className="toggle-switch" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
