import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Icons } from '../Icons';

export const ProfileSettings = ({ settings, onSettingChange }) => {
  const settingGroups = [
    {
      title: 'Notifications',
      settings: [
        {
          key: 'emailNotifications',
          label: 'Email Notifications',
          description: 'Receive email notifications for important updates',
          type: 'toggle',
          value: settings.emailNotifications
        },
        {
          key: 'pushNotifications',
          label: 'Push Notifications',
          description: 'Receive push notifications on your device',
          type: 'toggle',
          value: settings.pushNotifications
        },
        {
          key: 'taskReminders',
          label: 'Task Reminders',
          description: 'Get reminded about upcoming task deadlines',
          type: 'toggle',
          value: settings.taskReminders
        }
      ]
    },
    {
      title: 'Privacy',
      settings: [
        {
          key: 'profileVisibility',
          label: 'Profile Visibility',
          description: 'Control who can see your profile',
          type: 'select',
          value: settings.profileVisibility,
          options: [
            { value: 'public', label: 'Public' },
            { value: 'team', label: 'Team Only' },
            { value: 'private', label: 'Private' }
          ]
        },
        {
          key: 'showEmail',
          label: 'Show Email',
          description: 'Display your email address on your profile',
          type: 'toggle',
          value: settings.showEmail
        }
      ]
    },
    {
      title: 'Preferences',
      settings: [
        {
          key: 'theme',
          label: 'Theme',
          description: 'Choose your preferred theme',
          type: 'select',
          value: settings.theme,
          options: [
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
            { value: 'system', label: 'System' }
          ]
        },
        {
          key: 'language',
          label: 'Language',
          description: 'Select your preferred language',
          type: 'select',
          value: settings.language,
          options: [
            { value: 'en', label: 'English' },
            { value: 'es', label: 'Spanish' },
            { value: 'fr', label: 'French' },
            { value: 'de', label: 'German' }
          ]
        }
      ]
    }
  ];

  const handleToggle = (key) => {
    onSettingChange(key, !settings[key]);
  };

  const handleSelect = (key, value) => {
    onSettingChange(key, value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {settingGroups.map((group, groupIndex) => (
            <div key={groupIndex}>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {group.title}
              </h3>
              <div className="space-y-4">
                {group.settings.map((setting, settingIndex) => (
                  <div key={settingIndex} className="flex items-center justify-between py-3 border-b last:border-b-0">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          {setting.label}
                        </span>
                        {setting.type === 'toggle' && setting.value && (
                          <Badge variant="success" size="sm">
                            On
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {setting.description}
                      </p>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                      {setting.type === 'toggle' ? (
                        <Button
                          variant={setting.value ? 'primary' : 'outline'}
                          size="sm"
                          onClick={() => handleToggle(setting.key)}
                        >
                          {setting.value ? 'On' : 'Off'}
                        </Button>
                      ) : (
                        <select
                          value={setting.value}
                          onChange={(e) => handleSelect(setting.key, e.target.value)}
                          className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {setting.options.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 pt-6 border-t">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" className="flex-1">
              <Icons.download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
            <Button variant="destructive" className="flex-1">
              <Icons.trash className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
