import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { NotificationQueue } from '../../../api/notifications/notificationQueue';
import { InAppNotifications } from '../../../api/notifications/InAppNotifications';
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Icons } from '../Icons';

export const NotificationHealthDashboard = () => {
  const [stats, setStats] = useState(null);
  const [retrying, setRetrying] = useState(false);
  const [cleaning, setCleaning] = useState(false);

  // Subscribe to notification data
  const { queueStats, loading } = useTracker(() => {
    const handle = Meteor.subscribe('notifications.queue');
    
    const now = new Date();
    const oneHourAgo = new Date(now - 60 * 60 * 1000);
    
    const queuedCount = NotificationQueue.find({ status: 'queued' }).count();
    const failedCount = NotificationQueue.find({ status: 'failed' }).count();
    const retryCount = NotificationQueue.find({ status: 'retry' }).count();
    const recentFailures = NotificationQueue.find({ 
      status: 'failed',
      updatedAt: { $gte: oneHourAgo }
    }).count();
    
    return {
      queueStats: {
        queued: queuedCount,
        failed: failedCount,
        retry: retryCount,
        recentFailures
      },
      loading: !handle.ready()
    };
  }, []);

  // Load additional stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        const [queueTotal, inAppCount] = await Promise.all([
          Meteor.callAsync('notifications.getQueueStats'),
          Meteor.callAsync('inAppNotifications.getTotalCount')
        ]);
        
        setStats({
          queueTotal: queueTotal || 0,
          inAppCount: inAppCount || 0
        });
      } catch (error) {
        console.error('Failed to load notification stats:', error);
      }
    };

    loadStats();
    const interval = setInterval(loadStats, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleRetryFailed = async () => {
    setRetrying(true);
    try {
      const result = await Meteor.callAsync('notifications.retryFailed');
      alert(`Retried ${result.processed} failed notifications`);
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setRetrying(false);
    }
  };

  const handleCleanupOld = async () => {
    setCleaning(true);
    try {
      const result = await Meteor.callAsync('notifications.cleanup');
      alert(`Cleaned up ${result.cleaned} old notifications`);
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setCleaning(false);
    }
  };

  const getHealthStatus = () => {
    if (!queueStats) return 'unknown';
    
    const { failed, recentFailures, queued } = queueStats;
    
    if (recentFailures > 10) return 'critical';
    if (failed > 50 || queued > 100) return 'warning';
    return 'healthy';
  };

  const getHealthBadge = () => {
    const status = getHealthStatus();
    const config = {
      healthy: { variant: 'success', text: 'Healthy', icon: Icons.checkCircle },
      warning: { variant: 'warning', text: 'Warning', icon: Icons.alertTriangle },
      critical: { variant: 'danger', text: 'Critical', icon: Icons.xCircle },
      unknown: { variant: 'secondary', text: 'Unknown', icon: Icons.helpCircle }
    };
    
    const { variant, text, icon: Icon } = config[status];
    
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {text}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Icons.loader className="w-5 h-5 animate-spin mr-2" />
          Loading notification stats...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Health Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icons.bell className="w-5 h-5" />
            Notification System Health
          </CardTitle>
          {getHealthBadge()}
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {queueStats?.queued || 0}
              </div>
              <div className="text-sm text-gray-600">Queued</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {queueStats?.retry || 0}
              </div>
              <div className="text-sm text-gray-600">Retrying</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {queueStats?.failed || 0}
              </div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {stats?.inAppCount || 0}
              </div>
              <div className="text-sm text-gray-600">In-App</div>
            </div>
          </div>
          
          {queueStats?.recentFailures > 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <Icons.alertTriangle className="w-4 h-4" />
                <span className="font-medium">
                  {queueStats.recentFailures} notifications failed in the last hour
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Actions</CardTitle>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={handleRetryFailed}
              disabled={retrying || !queueStats?.failed}
            >
              {retrying ? (
                <Icons.loader className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Icons.refreshCw className="w-4 h-4 mr-1" />
              )}
              Retry Failed ({queueStats?.failed || 0})
            </Button>
            
            <Button
              variant="outline"
              onClick={handleCleanupOld}
              disabled={cleaning}
            >
              {cleaning ? (
                <Icons.loader className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Icons.trash className="w-4 h-4 mr-1" />
              )}
              Cleanup Old
            </Button>
            
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
            >
              <Icons.refreshCw className="w-4 h-4 mr-1" />
              Refresh Stats
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Failures (if any) */}
      {queueStats?.recentFailures > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.alertTriangle className="w-5 h-5 text-red-500" />
              Recent Notification Issues
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">Common Issues:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Users haven't enabled push notifications</li>
                  <li>• Push service temporarily unavailable</li>
                  <li>• Invalid notification payload</li>
                  <li>• Network connectivity issues</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Automatic Fallbacks:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Failed push notifications are saved as in-app notifications</li>
                  <li>• Retry system attempts delivery up to 5 times</li>
                  <li>• Exponential backoff prevents system overload</li>
                  <li>• Old notifications are automatically cleaned up</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
