import React from 'react';
import { Card, CardContent } from '../common/Card';
import { Badge } from '../common/Badge';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';

export const TaskCard = ({ 
  task, 
  onComplete, 
  onView, 
  onEdit, 
  onDelete, 
  showActions = true,
  compact = false 
}) => {
  const getStatusVariant = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'scheduled':
        return 'primary';
      case 'draft':
        return 'default';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

  return (
    <Card className={`hover:shadow-lg transition-shadow cursor-pointer ${isOverdue ? 'border-red-200 bg-red-50' : ''}`}>
      <CardContent padding="md">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h3 
                className={`text-lg font-semibold truncate ${
                  task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'
                }`}
                onClick={() => onView?.(task)}
              >
                {task.title}
              </h3>
              {isOverdue && (
                <Badge variant="error" size="sm">
                  Overdue
                </Badge>
              )}
            </div>
            
            {task.client && (
              <div className="flex items-center space-x-2 mb-2">
                <Avatar 
                  src={task.client.logoUrl} 
                  alt={task.client.name}
                  size="sm"
                  fallback={task.client.name.charAt(0)}
                />
                <span className="text-sm text-gray-600">{task.client.name}</span>
              </div>
            )}
            
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {task.description}
            </p>
            
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className={isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}>
                  {new Date(task.dueDate).toLocaleDateString()}
                </span>
              </div>
              
              {task.assignees && task.assignees.length > 0 && (
                <div className="flex items-center space-x-1">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-gray-600">
                    {task.assignees.length} assigned
                  </span>
                </div>
              )}
              
              {task.attachments && task.attachments.length > 0 && (
                <div className="flex items-center space-x-1">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  <span className="text-gray-600">
                    {task.attachments.length} files
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            <Badge variant={getStatusVariant(task.status)} size="sm">
              {task.status}
            </Badge>
          </div>
        </div>
        
        {showActions && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              {task.socialAccounts?.map((account) => (
                <Badge key={account.id} variant="info" size="sm">
                  {account.platform}
                </Badge>
              ))}
            </div>
            
            <div className="flex items-center space-x-2">
              {task.status === 'scheduled' && onComplete && (
                <Button 
                  size="sm" 
                  variant="success"
                  onClick={() => onComplete(task)}
                >
                  Mark Complete
                </Button>
              )}
              
              {onEdit && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onEdit(task)}
                >
                  Edit
                </Button>
              )}
              
              {onView && (
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => onView(task)}
                >
                  View
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
