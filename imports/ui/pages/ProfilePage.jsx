import React, { useState } from 'react';
import ProfileUpdateForm from '../components/profile/ProfileUpdateForm';
import ChangePasswordForm from '../components/profile/ChangePasswordForm';
import { Icons } from '../components/Icons';
import { useAuthContext } from '../context/AuthContext';
import { WebPushService } from '../../api/notifications/webPush';
import { Meteor } from 'meteor/meteor';

export const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);
  const { user, isLoading, resendVerificationEmail } = useAuthContext();

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
    <div className="profile-page">
      {/* Header */}
      <div className="profile-header">
        <div>
          <h1 className="profile-header-title">Profile</h1>
          <p className="profile-header-subtitle">Manage your account details and preferences</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="profile-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`profile-tab ${activeTab === tab.id ? 'active' : ''}`}
          >
            {React.createElement(tab.icon, { className: "profile-tab-icon" })}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="profile-content">
        {activeTab === 'profile' && (
          <div>
            <div className="profile-avatar-section">
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
            
            <div className="profile-form-section">
              <ProfileUpdateForm />
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div>
            <div className="profile-form-section">
              <ChangePasswordForm />
            </div>
            
            <div className="profile-verification-card">
              <h3>Email Verification</h3>
              
              {user?.emails?.[0]?.verified ? (
                <div className="profile-verification-status verified">
                  <Icons.checkCircle className="profile-verification-icon" />
                  <span>Your email is verified</span>
                </div>
              ) : (
                <div>
                  <div className="profile-verification-status unverified">
                    <Icons.alertTriangle className="profile-verification-icon" />
                    <span>Your email is not verified</span>
                  </div>
                  <button
                    onClick={() => resendVerificationEmail()}
                    className="profile-button-primary"
                  >
                    <Icons.mail className="profile-verification-icon" />
                    Resend Verification Email
                  </button>
                </div>
              )}
            </div>

            <div className="profile-verification-card" style={{ marginTop: 'var(--spacing-lg)' }}>
              <h3>Account Actions</h3>
              <button
                onClick={handleLogout}
                className="profile-button-primary"
                style={{ background: 'var(--status-error)' }}
              >
                <Icons.logout className="profile-verification-icon" />
                Sign Out
              </button>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div>
            <div className="profile-verification-card">
              <h3>Browser Notifications</h3>
              <p className="mb-4 text-gray-600">Get instant notifications for task assignments, updates, and other important activities.</p>
              
              <div className="profile-verification-status">
                <Icons.bell className="profile-verification-icon" />
                <span>
                  Status: {notificationPermission === 'granted' 
                    ? 'Enabled' 
                    : notificationPermission === 'denied' 
                    ? 'Blocked' 
                    : 'Not Set'
                  }
                </span>
              </div>

              <div className="flex gap-3 mt-4">
                {notificationPermission !== 'granted' && (
                  <button
                    onClick={handleEnableNotifications}
                    className="profile-button-primary"
                  >
                    <Icons.bell className="profile-verification-icon" />
                    Enable Notifications
                  </button>
                )}
                
                {notificationPermission === 'granted' && (
                  <button
                    onClick={handleTestNotification}
                    className="profile-button-primary"
                    style={{ background: 'var(--primary-600)' }}
                  >
                    <Icons.send className="profile-verification-icon" />
                    Send Test Notification
                  </button>
                )}
              </div>

              {notificationPermission === 'denied' && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">
                    Notifications are blocked. To enable them, click the lock icon in your browser's address bar and allow notifications.
                  </p>
                </div>
              )}
            </div>

            <div className="profile-verification-card" style={{ marginTop: 'var(--spacing-lg)' }}>
              <h3>Notification Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium">Task Assignments</label>
                    <p className="text-sm text-gray-600">Notify when tasks are assigned to you</p>
                  </div>
                  <input type="checkbox" defaultChecked className="form-checkbox" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium">Task Completions</label>
                    <p className="text-sm text-gray-600">Notify when assigned tasks are completed</p>
                  </div>
                  <input type="checkbox" defaultChecked className="form-checkbox" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium">Due Date Reminders</label>
                    <p className="text-sm text-gray-600">Notify about upcoming due dates</p>
                  </div>
                  <input type="checkbox" defaultChecked className="form-checkbox" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
