import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card';
import { Badge } from '../common/Badge';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';
import { Icons } from '../Icons';

export const TaskCard = ({ 
  task, 
  onComplete, 
  onView, 
  onEdit, 
  onDelete, 
  onClick,
  showActions = true,
  compact = false 
}) => {
  const getStatusVariant = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'primary';
      case 'pending':
        return 'warning';
      case 'draft':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getPriorityVariant = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'secondary';
    }
  };

  const getPriorityBorderClass = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-4 border-l-red-500';
      case 'medium':
        return 'border-l-4 border-l-yellow-500';
      case 'low':
        return 'border-l-4 border-l-green-500';
      default:
        return '';
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

  return (
    <Card 
      className={`hover:shadow-lg transition-shadow cursor-pointer ${getPriorityBorderClass(task.priority)}`}
      onClick={() => onClick?.(task)}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div>
              <CardTitle className={`text-lg font-semibold ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                {task.title}
                {task.status === 'scheduled' && (
                  <span className="scheduled-indicator">📅</span>
                )}
              </CardTitle>
              {task.client && (
                <div className="flex items-center space-x-2 mt-1">
                  <Avatar 
                    src={task.client.logoUrl} 
                    alt={task.client.name}
                    size="sm"
                    className="w-5 h-5"
                    fallback={task.client.name.charAt(0)}
                  />
                  <p className="text-sm text-gray-600">{task.client.name}</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant={getPriorityVariant(task.priority)} size="sm">
              {task.priority}
            </Badge>
            {isOverdue && (
              <Badge variant="error" size="sm">
                Overdue
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {task.description && (
            <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}
          
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-1 text-gray-600">
                {React.createElement(Icons.calendar, { className: "h-4 w-4" })}
                <span className="font-medium">Due:</span>
                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
              </div>
              
              <Badge variant={getStatusVariant(task.status)} size="sm">
                {task.status.replace('_', ' ')}
              </Badge>
            </div>
            
            {task.assigneeIds && task.assigneeIds.length > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Assigned to:</span>
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-2">
                    {task.assignees?.slice(0, 3).map((assignee) => (
                      <div 
                        key={assignee._id} 
                        className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-sm font-medium text-gray-600 overflow-hidden"
                        title={assignee.profile?.firstName ? `${assignee.profile.firstName} ${assignee.profile.lastName}` : assignee.emails?.[0]?.address || 'Unknown User'}
                      >
                        {assignee.profile?.avatar ? (
                          <img 
                            src={assignee.profile.avatar} 
                            alt={assignee.profile?.firstName || 'User'} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs">
                            {assignee.profile?.firstName?.charAt(0)?.toUpperCase() || 
                             assignee.emails?.[0]?.address?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        )}
                      </div>
                    ))}
                    {task.assigneeIds.length > 3 && (
                      <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-500">
                        +{task.assigneeIds.length - 3}
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {task.assigneeIds.length === 1 ? '1 person' : `${task.assigneeIds.length} people`}
                  </span>
                </div>
              </div>
            )}
            
            {task.attachments && task.attachments.length > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Attachments:</span>
                <div className="flex items-center space-x-1 text-gray-500">
                  {React.createElement(Icons.paperclip, { className: "h-4 w-4" })}
                  <span className="text-sm">{task.attachments.length} files</span>
                </div>
              </div>
            )}
          </div>
          
          {task.socialAccounts && task.socialAccounts.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Platforms:</span>
              <div className="flex gap-1">
                {task.socialAccounts.map((account) => (
                  <Badge key={account.id} variant="outline" size="sm">
                    {account.platform}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {showActions && (
            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                {task.status !== 'completed' && onComplete && (
                  <Button 
                    size="sm" 
                    variant="success"
                    onClick={(e) => {
                      e.stopPropagation();
                      onComplete(task);
                    }}
                  >
                    {React.createElement(Icons.check, { className: "h-4 w-4 mr-1" })}
                    Complete
                  </Button>
                )}
                
                {onEdit && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(task);
                    }}
                  >
                    {React.createElement(Icons.edit, { className: "h-4 w-4 mr-1" })}
                    Edit
                  </Button>
                )}
              </div>
              
              {onView && (
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onView(task);
                  }}
                >
                  View Details
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

TaskCard.propTypes = {
  task: PropTypes.object.isRequired,
  onComplete: PropTypes.func,
  onView: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onClick: PropTypes.func,
  showActions: PropTypes.bool,
  compact: PropTypes.bool
};
