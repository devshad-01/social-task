import React, { useState } from 'react';
import ProfileUpdateForm from '../components/profile/ProfileUpdateForm';
import ChangePasswordForm from '../components/profile/ChangePasswordForm';
import { Icons } from '../components/Icons';
import { useAuthContext } from '../context/AuthContext';
import { Meteor } from 'meteor/meteor';

export const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const { user, isLoading, resendVerificationEmail } = useAuthContext();

  const tabs = [
    { id: 'profile', label: 'Profile', icon: Icons.user },
    { id: 'security', label: 'Security', icon: Icons.settings }
  ];

  const handleLogout = () => {
    Meteor.logout();
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
      </div>
    </div>
  );
};
