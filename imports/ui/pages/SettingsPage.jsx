import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input, TextArea, Select, Checkbox } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { Alert } from '../components/common/Alert';
import { Icons } from '../components/Icons';
import { useToast } from '../components/common/Toast';

export const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    // General Settings
    companyName: 'Posty Social',
    companyEmail: 'admin@posty.com',
    companyPhone: '+1 (555) 123-4567',
    companyAddress: '123 Social St, San Francisco, CA 94102',
    timezone: 'America/Los_Angeles',
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    
    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    taskReminders: true,
    clientUpdates: true,
    weeklyReports: true,
    systemAlerts: true,
    
    // Security Settings
    twoFactorEnabled: false,
    sessionTimeout: 30,
    passwordComplexity: 'medium',
    loginAttempts: 5,
    ipWhitelist: '',
    
    // Integration Settings
    connectedApps: [
      { name: 'Facebook', connected: true, lastSync: '2024-01-12T10:30:00Z' },
      { name: 'Instagram', connected: true, lastSync: '2024-01-12T10:30:00Z' },
      { name: 'Twitter', connected: false, lastSync: null },
      { name: 'LinkedIn', connected: true, lastSync: '2024-01-12T09:15:00Z' },
      { name: 'TikTok', connected: false, lastSync: null }
    ],
    
    // Advanced Settings
    dataRetention: 365,
    backupFrequency: 'weekly',
    debugMode: false,
    maintenanceMode: false,
    apiRateLimit: 1000
  });

  const { showSuccess, showError } = useToast();

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveSettings = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      showSuccess('Settings saved successfully!');
    } catch (error) {
      showError('Failed to save settings. Please try again.');
    }
  };

  const handleConnectApp = (appName) => {
    setSettings(prev => ({
      ...prev,
      connectedApps: prev.connectedApps.map(app =>
        app.name === appName
          ? { ...app, connected: true, lastSync: new Date().toISOString() }
          : app
      )
    }));
    showSuccess(`${appName} connected successfully!`);
  };

  const handleDisconnectApp = (appName) => {
    setSettings(prev => ({
      ...prev,
      connectedApps: prev.connectedApps.map(app =>
        app.name === appName
          ? { ...app, connected: false, lastSync: null }
          : app
      )
    }));
    showSuccess(`${appName} disconnected successfully!`);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Icons.settings },
    { id: 'notifications', label: 'Notifications', icon: Icons.bell },
    { id: 'security', label: 'Security', icon: Icons.lock },
    { id: 'integrations', label: 'Integrations', icon: Icons.link },
    { id: 'advanced', label: 'Advanced', icon: Icons.cog }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your application settings and preferences</p>
        </div>
        <Button onClick={handleSaveSettings} className="mt-4 sm:mt-0">
          <Icons.save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
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
      <div className="space-y-6">
        {activeTab === 'general' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Company Name"
                  value={settings.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={settings.companyEmail}
                  onChange={(e) => handleInputChange('companyEmail', e.target.value)}
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  value={settings.companyPhone}
                  onChange={(e) => handleInputChange('companyPhone', e.target.value)}
                />
                <TextArea
                  label="Address"
                  value={settings.companyAddress}
                  onChange={(e) => handleInputChange('companyAddress', e.target.value)}
                  rows={3}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Localization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  label="Timezone"
                  value={settings.timezone}
                  onChange={(e) => handleInputChange('timezone', e.target.value)}
                >
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="UTC">UTC</option>
                </Select>
                <Select
                  label="Language"
                  value={settings.language}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </Select>
                <Select
                  label="Date Format"
                  value={settings.dateFormat}
                  onChange={(e) => handleInputChange('dateFormat', e.target.value)}
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </Select>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'notifications' && (
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Checkbox
                  label="Email Notifications"
                  checked={settings.emailNotifications}
                  onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                  helpText="Receive email notifications for important updates"
                />
                <Checkbox
                  label="Push Notifications"
                  checked={settings.pushNotifications}
                  onChange={(e) => handleInputChange('pushNotifications', e.target.checked)}
                  helpText="Receive push notifications on your device"
                />
                <Checkbox
                  label="Task Reminders"
                  checked={settings.taskReminders}
                  onChange={(e) => handleInputChange('taskReminders', e.target.checked)}
                  helpText="Get reminded about upcoming task deadlines"
                />
                <Checkbox
                  label="Client Updates"
                  checked={settings.clientUpdates}
                  onChange={(e) => handleInputChange('clientUpdates', e.target.checked)}
                  helpText="Receive notifications about client activity"
                />
                <Checkbox
                  label="Weekly Reports"
                  checked={settings.weeklyReports}
                  onChange={(e) => handleInputChange('weeklyReports', e.target.checked)}
                  helpText="Get weekly performance reports via email"
                />
                <Checkbox
                  label="System Alerts"
                  checked={settings.systemAlerts}
                  onChange={(e) => handleInputChange('systemAlerts', e.target.checked)}
                  helpText="Receive notifications about system maintenance and updates"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'security' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Authentication</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                  </div>
                  <Button
                    variant={settings.twoFactorEnabled ? "destructive" : "primary"}
                    size="sm"
                    onClick={() => handleInputChange('twoFactorEnabled', !settings.twoFactorEnabled)}
                  >
                    {settings.twoFactorEnabled ? 'Disable' : 'Enable'}
                  </Button>
                </div>
                <Input
                  label="Session Timeout (minutes)"
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => handleInputChange('sessionTimeout', parseInt(e.target.value))}
                  helpText="Automatically log out after this many minutes of inactivity"
                />
                <Select
                  label="Password Complexity"
                  value={settings.passwordComplexity}
                  onChange={(e) => handleInputChange('passwordComplexity', e.target.value)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Access Control</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Max Login Attempts"
                  type="number"
                  value={settings.loginAttempts}
                  onChange={(e) => handleInputChange('loginAttempts', parseInt(e.target.value))}
                  helpText="Block account after this many failed login attempts"
                />
                <TextArea
                  label="IP Whitelist"
                  value={settings.ipWhitelist}
                  onChange={(e) => handleInputChange('ipWhitelist', e.target.value)}
                  placeholder="Enter IP addresses separated by commas"
                  helpText="Only allow access from these IP addresses (leave blank to allow all)"
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'integrations' && (
          <Card>
            <CardHeader>
              <CardTitle>Social Media Integrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {settings.connectedApps.map((app, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Icons.link className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{app.name}</h4>
                        <p className="text-sm text-gray-600">
                          {app.connected ? (
                            `Last synced: ${new Date(app.lastSync).toLocaleDateString()}`
                          ) : (
                            'Not connected'
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={app.connected ? 'success' : 'secondary'}>
                        {app.connected ? 'Connected' : 'Disconnected'}
                      </Badge>
                      <Button
                        variant={app.connected ? 'outline' : 'primary'}
                        size="sm"
                        onClick={() => app.connected ? handleDisconnectApp(app.name) : handleConnectApp(app.name)}
                      >
                        {app.connected ? 'Disconnect' : 'Connect'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'advanced' && (
          <div className="space-y-6">
            <Alert variant="warning">
              <Icons.alertTriangle className="w-4 h-4" />
              <div>
                <strong>Warning:</strong> These are advanced settings that can affect system performance and functionality. 
                Please proceed with caution.
              </div>
            </Alert>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Data Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    label="Data Retention (days)"
                    type="number"
                    value={settings.dataRetention}
                    onChange={(e) => handleInputChange('dataRetention', parseInt(e.target.value))}
                    helpText="Number of days to retain deleted data"
                  />
                  <Select
                    label="Backup Frequency"
                    value={settings.backupFrequency}
                    onChange={(e) => handleInputChange('backupFrequency', e.target.value)}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </Select>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Checkbox
                    label="Debug Mode"
                    checked={settings.debugMode}
                    onChange={(e) => handleInputChange('debugMode', e.target.checked)}
                    helpText="Enable detailed logging for troubleshooting"
                  />
                  <Checkbox
                    label="Maintenance Mode"
                    checked={settings.maintenanceMode}
                    onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
                    helpText="Temporarily disable access for maintenance"
                  />
                  <Input
                    label="API Rate Limit (requests/hour)"
                    type="number"
                    value={settings.apiRateLimit}
                    onChange={(e) => handleInputChange('apiRateLimit', parseInt(e.target.value))}
                    helpText="Maximum API requests per hour per user"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
