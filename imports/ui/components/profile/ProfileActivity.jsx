import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { Badge } from '../common/Badge';
import { Icons } from '../Icons';

export const ProfileActivity = ({ activities }) => {
  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Icons.clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No recent activity</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'task_completed':
        return <Icons.checkCircle className="w-4 h-4 text-green-500" />;
      case 'task_created':
        return <Icons.plus className="w-4 h-4 text-blue-500" />;
      case 'client_added':
        return <Icons.users className="w-4 h-4 text-purple-500" />;
      case 'profile_updated':
        return <Icons.edit className="w-4 h-4 text-orange-500" />;
      default:
        return <Icons.clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'task_completed':
        return 'bg-green-50 border-green-200';
      case 'task_created':
        return 'bg-blue-50 border-blue-200';
      case 'client_added':
        return 'bg-purple-50 border-purple-200';
      case 'profile_updated':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div
              key={index}
              className={`flex items-start space-x-3 p-3 rounded-lg border ${getActivityColor(activity.type)}`}
            >
              <div className="flex-shrink-0 mt-1">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {activity.title}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {activity.description}
                </p>
                <div className="flex items-center mt-2 space-x-2">
                  <span className="text-xs text-gray-500">
                    {activity.timestamp}
                  </span>
                  {activity.badge && (
                    <Badge variant="secondary" size="sm">
                      {activity.badge}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
