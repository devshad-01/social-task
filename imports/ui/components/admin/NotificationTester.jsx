import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { Button } from '../common/Button';
import { Input, Select } from '../common/Input';

export const NotificationTester = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [testType, setTestType] = useState('ephemeral');

  const runTest = async (type) => {
    setLoading(true);
    setResult(null);

    try {
      let response;
      
      switch (type) {
        case 'ephemeral':
          // Test ephemeral notification (TTL-only, no DB storage)
          response = await Meteor.callAsync('notifications.taskDueReminder', {
            userId: Meteor.userId(),
            taskTitle: 'Sample Task - Test Notification',
            minutesLeft: 5
          });
          setResult({
            type: 'Ephemeral (TTL-only)',
            description: 'Task due reminder - expires in 5 minutes, not stored in DB',
            details: response,
            icon: '⏰'
          });
          break;

        case 'persistent':
          // Test persistent notification (DB + TTL delivery)
          response = await Meteor.callAsync('notifications.smartTaskAssigned', {
            userId: Meteor.userId(),
            taskTitle: 'Important Project Task',
            assignerName: 'Test Admin',
            taskId: 'test-task-123'
          });
          setResult({
            type: 'Persistent (DB + TTL)',
            description: 'Task assignment - stored in DB and notification center',
            details: response,
            icon: '📋'
          });
          break;

        case 'meeting':
          // Test meeting alert (ephemeral)
          response = await Meteor.callAsync('notifications.meetingAlert', {
            userId: Meteor.userId(),
            meetingTitle: 'Sprint Planning Meeting',
            minutesUntil: 10
          });
          setResult({
            type: 'Meeting Alert (Ephemeral)',
            description: 'Meeting reminder - expires in 10 minutes',
            details: response,
            icon: '📅'
          });
          break;

        case 'overdue':
          // Test real overdue task detection and notification
          try {
            // First, check for actual overdue tasks
            const overdueTasks = await Meteor.callAsync('tasks.getOverdue');
            
            if (overdueTasks && overdueTasks.length > 0) {
              // Send notifications for real overdue tasks
              response = await Meteor.callAsync('admin.sendOverdueReminders');
              setResult({
                type: 'Real Overdue Tasks Alert',
                description: `Found ${overdueTasks.length} overdue task(s). Sent notifications.`,
                details: response,
                icon: '🚨'
              });
            } else {
              // No overdue tasks, send a test notification with 3-second TTL
              response = await Meteor.callAsync('notifications.sendSmart', {
                category: 'REMINDER',
                userId: Meteor.userId(),
                title: '🚨 Overdue Tasks Test',
                message: 'Test alert - No actual overdue tasks found',
                actionUrl: '/tasks',
                data: { 
                  type: 'overdue_reminder',
                  testMode: true,
                  ttlSeconds: 3
                }
              });
              setResult({
                type: 'Overdue Test (No Tasks)',
                description: 'No overdue tasks found. Sent test notification (3s TTL)',
                details: response,
                icon: '🚨'
              });
            }
          } catch (error) {
            console.error('Overdue test error:', error);
            setResult({
              type: 'Overdue Test Error',
              description: `Error: ${error.reason || error.message}`,
              details: error,
              icon: '❌'
            });
          }
          break;

        case 'createOverdue':
          // Create a test overdue task
          try {
            response = await Meteor.callAsync('tasks.createTestOverdue');
            setResult({
              type: 'Test Overdue Task Created',
              description: `Created overdue task (Due: ${response.dueDate.toLocaleDateString()})`,
              details: response,
              icon: '🔧'
            });
          } catch (error) {
            console.error('Create overdue task error:', error);
            setResult({
              type: 'Create Overdue Task Error',
              description: `Error: ${error.reason || error.message}`,
              details: error,
              icon: '❌'
            });
          }
          break;

        case 'stats':
          // Get smart notification statistics
          response = await Meteor.callAsync('notifications.getSmartStats');
          setResult({
            type: 'Smart Notification Statistics',
            description: 'Current system stats for ephemeral vs persistent notifications',
            details: response,
            icon: '📊'
          });
          break;
      }
    } catch (error) {
      setResult({
        type: 'Error',
        description: error.message,
        details: { error: error.reason || error.message },
        icon: '❌'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>🧪</span>
          <span>Smart Notification System Tester</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="ml-auto"
          >
            ✕
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Explanation */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">📚 Notification Types</h4>
          <div className="space-y-2 text-sm text-blue-800">
            <div><strong>Ephemeral:</strong> TTL-only, expires quickly (5-10 min), not stored in DB</div>
            <div><strong>Persistent:</strong> Stored in DB + TTL delivery (30-60 min), shows in notification center</div>
          </div>
        </div>

        {/* Test Buttons Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => runTest('ephemeral')}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <span>⏰</span>
            <span>Test Task Due Reminder</span>
          </Button>

          <Button
            onClick={() => runTest('persistent')}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <span>📋</span>
            <span>Test Task Assignment</span>
          </Button>

          <Button
            onClick={() => runTest('meeting')}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <span>📅</span>
            <span>Test Meeting Alert</span>
          </Button>

          <Button
            onClick={() => runTest('overdue')}
            disabled={loading}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white"
          >
            <span>🚨</span>
            <span>Test Overdue Alert</span>
          </Button>

          <Button
            onClick={() => runTest('createOverdue')}
            disabled={loading}
            className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white"
          >
            <span>🔧</span>
            <span>Create Test Overdue Task</span>
          </Button>

          <Button
            onClick={() => runTest('stats')}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <span>📊</span>
            <span>Get Statistics</span>
          </Button>
        </div>

        {/* Results */}
        {loading && (
          <div className="text-center py-4">
            <div className="inline-flex items-center space-x-2">
              <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <span>Testing notification...</span>
            </div>
          </div>
        )}

        {result && (
          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-2xl">{result.icon}</span>
              <div>
                <h4 className="font-medium">{result.type}</h4>
                <p className="text-sm text-gray-600">{result.description}</p>
              </div>
            </div>
            
            <div className="bg-white p-3 rounded border">
              <pre className="text-xs text-gray-700 overflow-auto">
                {JSON.stringify(result.details, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Usage Guide */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h4 className="font-medium text-green-900 mb-2">💡 Usage Guide</h4>
          <div className="space-y-1 text-sm text-green-800">
            <div><strong>Ephemeral:</strong> Use for time-sensitive alerts that become irrelevant quickly</div>
            <div><strong>Persistent:</strong> Use for important updates users must see, even if offline</div>
            <div><strong>Check your browser notifications and in-app notification center!</strong></div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
};
