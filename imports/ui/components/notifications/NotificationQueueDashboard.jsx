import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { Roles } from 'meteor/alanning:roles';

/**
 * Notification Queue Admin Dashboard
 * Professional monitoring interface for notification queue system
 */
export const NotificationQueueDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Check if user is admin
  const isAdmin = useTracker(() => {
    return Roles.userIsInRole(Meteor.userId(), ['admin']);
  }, []);

  // Load queue statistics
  const loadStats = async () => {
    try {
      setLoading(true);
      const result = await new Promise((resolve, reject) => {
        Meteor.call('notifications.getQueueStats', (error, result) => {
          if (error) reject(error);
          else resolve(result);
        });
      });
      setStats(result);
    } catch (error) {
      console.error('Failed to load queue stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Manual queue processing
  const triggerProcessing = async () => {
    try {
      setProcessing(true);
      await new Promise((resolve, reject) => {
        Meteor.call('notifications.processQueue', (error, result) => {
          if (error) reject(error);
          else resolve(result);
        });
      });
      // Reload stats after processing
      setTimeout(loadStats, 1000);
    } catch (error) {
      console.error('Failed to trigger processing:', error);
      alert('Failed to trigger queue processing');
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadStats();
      // Auto-refresh every 30 seconds
      const interval = setInterval(loadStats, 30000);
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-gray-600">Loading notification queue statistics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Notification Queue Dashboard</h2>
        <div className="space-x-3">
          <button
            onClick={loadStats}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔄 Refresh
          </button>
          <button
            onClick={triggerProcessing}
            disabled={processing}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {processing ? '⏳ Processing...' : '▶️ Process Queue'}
          </button>
        </div>
      </div>

      {stats && (
        <>
          {/* Queue Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-yellow-800">Queued</h3>
              <p className="text-3xl font-bold text-yellow-900">{stats.queued || 0}</p>
              <p className="text-sm text-yellow-600">Ready for processing</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-800">Processing</h3>
              <p className="text-3xl font-bold text-blue-900">{stats.processing || 0}</p>
              <p className="text-sm text-blue-600">Currently being sent</p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-800">Sent</h3>
              <p className="text-3xl font-bold text-green-900">{stats.sent || 0}</p>
              <p className="text-sm text-green-600">Successfully delivered</p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-red-800">Failed</h3>
              <p className="text-3xl font-bold text-red-900">{stats.failed || 0}</p>
              <p className="text-sm text-red-600">Need attention</p>
            </div>
          </div>

          {/* Priority Breakdown */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Breakdown</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {stats.byPriority && Object.entries(stats.byPriority).map(([priority, count]) => (
                <div key={priority} className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                  <p className="text-sm text-gray-600 capitalize">{priority}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{stats.performance?.totalProcessed || 0}</p>
                <p className="text-sm text-gray-600">Total Processed</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">{stats.performance?.totalFailed || 0}</p>
                <p className="text-sm text-gray-600">Total Failed</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{stats.performance?.averageRetries || 0}</p>
                <p className="text-sm text-gray-600">Average Retries</p>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Queue Processing</span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  ✅ Active (every 30s)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Retry Mechanism</span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  ✅ Enabled (5 retries max)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Cleanup Service</span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  ✅ Daily at 2 AM
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => {
                  if (confirm('Send a test notification to yourself?')) {
                    Meteor.call('notifications.sendTest', {}, (error) => {
                      if (error) {
                        alert('Failed to send test notification: ' + error.message);
                      } else {
                        alert('Test notification queued successfully!');
                        setTimeout(loadStats, 1000);
                      }
                    });
                  }
                }}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                🧪 Send Test Notification
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationQueueDashboard;
