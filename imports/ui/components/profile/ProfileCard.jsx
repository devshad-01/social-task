import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Icons } from '../Icons';

export const ProfileCard = ({ user, onEdit }) => {
  return (
    <Card className="profile-card">
      <CardHeader className="text-center">
        <div className="flex flex-col items-center space-y-4">
          <Avatar
            src={user.avatar}
            alt={user.name}
            size="xl"
            className="w-24 h-24"
          />
          <div>
            <CardTitle className="text-2xl">{user.name}</CardTitle>
            <p className="text-gray-600 mt-1">{user.email}</p>
            <Badge variant="secondary" className="mt-2">
              {user.role}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Account Details</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Department</span>
                <span className="text-sm font-medium">{user.department || 'Not specified'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Location</span>
                <span className="text-sm font-medium">{user.location || 'Not specified'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Phone</span>
                <span className="text-sm font-medium">{user.phone || 'Not specified'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Joined</span>
                <span className="text-sm font-medium">{user.joinDate}</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Activity Stats</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tasks Completed</span>
                <span className="text-sm font-medium">{user.stats?.tasksCompleted || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Projects Delivered</span>
                <span className="text-sm font-medium">{user.stats?.projectsDelivered || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Hours Logged</span>
                <span className="text-sm font-medium">{user.stats?.hoursLogged || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Success Rate</span>
                <span className="text-sm font-medium">{user.stats?.successRate || '95%'}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={onEdit} className="flex-1">
              <Icons.edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
            <Button variant="outline" className="flex-1">
              <Icons.settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
