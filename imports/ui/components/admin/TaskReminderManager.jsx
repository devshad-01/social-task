import React, { useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Icons } from '../Icons';

export const TaskReminderManager = () => {
  const [reminderType, setReminderType] = useState('due-today');
  const [customMessage, setCustomMessage] = useState('');
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  const reminderOptions = [
    { 
      value: 'due-today', 
      label: 'Tasks Due Today',
      defaultMessage: 'You have tasks due today. Please check your task list.'
    },
    { 
      value: 'overdue', 
      label: 'Overdue Tasks',
      defaultMessage: 'You have overdue tasks that need immediate attention.'
    },
    { 
      value: 'due-tomorrow', 
      label: 'Tasks Due Tomorrow',
      defaultMessage: 'Reminder: You have tasks due tomorrow.'
    },
    { 
      value: 'high-priority', 
      label: 'High Priority Tasks',
      defaultMessage: 'You have high priority tasks that require attention.'
    }
  ];

  const currentOption = reminderOptions.find(opt => opt.value === reminderType);

  const handleSave = () => {
    if (!selectedTime) {
      alert('Please select a time for reminders');
      return;
    }

    setLoading(true);

    const reminderConfig = {
      type: reminderType,
      message: customMessage || currentOption.defaultMessage,
      time: selectedTime,
      enabled: isEnabled
    };

    Meteor.call('admin.setTaskReminder', reminderConfig, (error) => {
      setLoading(false);
      if (error) {
        alert('Error saving reminder: ' + error.reason);
      } else {
        alert('✅ Task reminder saved successfully!');
      }
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center gap-2 mb-4">
        <Icons.bell className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-medium text-gray-900">Task Reminder Settings</h2>
      </div>
      
      <p className="text-gray-600 mb-6">
        Set up automated reminders for task management. Choose reminder type, time, and custom message.
      </p>

      <div className="space-y-6">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-medium text-gray-900">Enable Task Reminders</h3>
            <p className="text-sm text-gray-600">Send automated notifications for task management</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => setIsEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Reminder Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reminder Type
          </label>
          <select
            value={reminderType}
            onChange={(e) => {
              setReminderType(e.target.value);
              setCustomMessage(''); // Reset custom message when type changes
            }}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {reminderOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Reminder Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reminder Time
          </label>
          <div className="relative">
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => {
                console.log('Time changed:', e.target.value);
                setSelectedTime(e.target.value);
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              required
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Icons.clock className="w-4 h-4 text-gray-400" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Daily reminder will be sent at this time (Current: {selectedTime || 'Not set'})
          </p>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reminder Message
          </label>
          <div className="space-y-2">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 font-medium">Default Message:</p>
              <p className="text-sm text-blue-700">{currentOption.defaultMessage}</p>
            </div>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Enter custom message (optional)"
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500">
              Leave empty to use default message, or enter a custom message
            </p>
          </div>
        </div>

        {/* Preview */}
        {isEnabled && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Icons.bell className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-800">Reminder Preview</span>
            </div>
            <p className="text-sm text-green-700">
              <strong>Type:</strong> {currentOption.label}
            </p>
            <p className="text-sm text-green-700">
              <strong>Time:</strong> Daily at {selectedTime}
            </p>
            <p className="text-sm text-green-700">
              <strong>Message:</strong> {customMessage || currentOption.defaultMessage}
            </p>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Icons.loader className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                💾 Save Reminder Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
