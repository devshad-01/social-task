import React, { useState } from 'react';
import ProfileUpdateForm from '../components/profile/ProfileUpdateForm';
import ChangePasswordForm from '../components/profile/ChangePasswordForm';
import { Icons } from '../components/Icons';
import { useAuthContext } from '../context/AuthContext';

export const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const { user, isLoading, resendVerificationEmail } = useAuthContext();

  const tabs = [
    { id: 'profile', label: 'Profile', icon: Icons.user },
    { id: 'security', label: 'Security', icon: Icons.settings }
  ];

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
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1">Manage your account details and preferences</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {React.createElement(tab.icon, { className: "w-4 h-4" })}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'profile' && (
          <div className="max-w-4xl">
            <div className="mb-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {user?.profile?.avatar ? (
                    <img src={user.profile.avatar} alt={user?.profile?.fullName || 'User'} className="h-full w-full object-cover" />
                  ) : (
                    <svg className="h-12 w-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-medium text-gray-900">{user?.profile?.fullName || 'User'}</h2>
                  <p className="text-sm text-gray-500">{user?.emails?.[0]?.address}</p>
                  <p className="text-sm text-gray-500">
                    Role: {user?.profile?.role || 'User'} {user?.profile?.department ? `• ${user.profile.department}` : ''}
                  </p>
                </div>
              </div>
            </div>
            <ProfileUpdateForm />
          </div>
        )}

        {activeTab === 'security' && (
          <div className="max-w-4xl">
            <ChangePasswordForm />
            
            <div className="mt-8 bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-medium text-gray-900 mb-4">Email Verification</h2>
              
              {user?.emails?.[0]?.verified ? (
                <div className="flex items-center text-sm text-green-700">
                  <svg className="h-5 w-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Your email is verified
                </div>
              ) : (
                <div>
                  <div className="flex items-center text-sm text-amber-700 mb-4">
                    <svg className="h-5 w-5 mr-2 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Your email is not verified
                  </div>
                  <button
                    onClick={() => resendVerificationEmail()}
                    className="px-4 py-2 bg-primary-600 border border-transparent rounded-md font-medium text-sm text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                  >
                    Resend Verification Email
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
