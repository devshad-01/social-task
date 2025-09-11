import React, { useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { useRole } from '../hooks/useRole';
import { TaskReminderManager } from '../components/admin/TaskReminderManager';
import { NotificationTester } from '../components/admin/NotificationTester';
import { Icons } from '../components/Icons';

export const AdminSystemPage = () => {
  const [activeTab, setActiveTab] = useState('reminders');
  
  const { user, loading } = useTracker(() => {
    const user = Meteor.user();
    return {
      user,
      loading: !user
    };
  }, []);

  const { isAdmin } = useRole();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Icons.loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow">
        <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <Icons.shield className="w-5 h-5 text-yellow-600" />
          <div>
            <div className="font-medium text-yellow-800">Access Denied</div>
            <div className="text-sm text-yellow-700 mt-1">
              Administrative privileges required to access system management.
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      id: 'reminders',
      label: 'Task Reminders',
      icon: Icons.bell
    },
    {
      id: 'notifications',
      label: 'Notification Testing',
      icon: Icons.zap
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Icons.settings className="w-6 h-6" />
          Task Administration
        </h1>
        <p className="text-gray-600 mt-1">
          Manage scheduled tasks and reminder settings
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm
                  ${isActive 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'reminders' && (
          <TaskReminderManager />
        )}
        {activeTab === 'notifications' && (
          <NotificationTester onClose={() => setActiveTab('reminders')} />
        )}
      </div>

      {/* System Info Footer */}
      <div className="bg-white p-4 rounded-lg shadow mt-8">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <span>System Status: Online</span>
            <span>•</span>
            <span>Last Updated: {new Date().toLocaleTimeString()}</span>
          </div>
          <button 
            className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
            onClick={() => window.location.reload()}
          >
            🔄 Refresh
          </button>
        </div>
      </div>
    </div>
  );
};
