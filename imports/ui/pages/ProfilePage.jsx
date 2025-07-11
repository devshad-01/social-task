import React, { useState } from 'react';
import { ProfileCard } from '../components/profile/ProfileCard';
import { ProfileEditModal } from '../components/profile/ProfileEditModal';
import { ProfileActivity } from '../components/profile/ProfileActivity';
import { ProfileSettings } from '../components/profile/ProfileSettings';
import { Icons } from '../components/Icons';

export const ProfilePage = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState({
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin',
    department: 'Management',
    location: 'San Francisco, CA',
    phone: '+1 (555) 123-4567',
    joinDate: 'January 2022',
    avatar: null,
    bio: 'Experienced social media manager with a passion for creating engaging content and building strong online communities.',
    skills: ['Social Media Strategy', 'Content Creation', 'Team Leadership', 'Analytics'],
    stats: {
      tasksCompleted: 248,
      projectsDelivered: 24,
      hoursLogged: 1240,
      successRate: '98%'
    }
  });

  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    taskReminders: true,
    profileVisibility: 'team',
    showEmail: true,
    theme: 'light',
    language: 'en'
  });

  const mockActivities = [
    {
      type: 'task_completed',
      title: 'Task Completed',
      description: 'Completed "Instagram Content Calendar" for Fashion Brand Co.',
      timestamp: '2 hours ago',
      badge: 'High Priority'
    },
    {
      type: 'task_created',
      title: 'New Task Created',
      description: 'Created "Facebook Ad Campaign" for Tech Startup Inc.',
      timestamp: '1 day ago',
      badge: 'Marketing'
    },
    {
      type: 'client_added',
      title: 'Client Added',
      description: 'Added new client "Youth Brand LLC" to the system',
      timestamp: '3 days ago',
      badge: 'New Client'
    },
    {
      type: 'profile_updated',
      title: 'Profile Updated',
      description: 'Updated profile information and skills',
      timestamp: '1 week ago'
    }
  ];

  const handleEditProfile = () => {
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (updatedUser) => {
    // Here you would typically make an API call to update the user
    console.log('Saving profile:', updatedUser);
    setUser(updatedUser);
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: Icons.user },
    { id: 'activity', label: 'Activity', icon: Icons.clock },
    { id: 'settings', label: 'Settings', icon: Icons.settings }
  ];

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
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <ProfileCard user={user} onEdit={handleEditProfile} />
            </div>
            <div>
              <ProfileActivity activities={mockActivities.slice(0, 3)} />
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="max-w-4xl">
            <ProfileActivity activities={mockActivities} />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-4xl">
            <ProfileSettings settings={settings} onSettingChange={handleSettingChange} />
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        onSave={handleSaveProfile}
      />
    </div>
  );
};
