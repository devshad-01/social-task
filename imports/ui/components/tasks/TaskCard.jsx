import React from 'react';
import PropTypes from 'prop-types';
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
  onClick,
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

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

  return (
    <div 
      className={`task-card hover-lift ${isOverdue ? 'priority-high' : ''} ${task.priority === 'high' ? 'priority-high' : task.priority === 'medium' ? 'priority-medium' : task.priority === 'low' ? 'priority-low' : ''}`}
      onClick={() => onClick?.(task)}
    >
      <div className="task-content">
        <div className={`task-title ${task.status === 'completed' ? 'completed' : ''}`}>
          {task.title}
          {isOverdue && (
            <Badge variant="error" size="sm" style={{ marginLeft: '8px' }}>
              Overdue
            </Badge>
          )}
        </div>
        
        {task.client && (
          <div className="task-client">
            <Avatar 
              src={task.client.logoUrl} 
              alt={task.client.name}
              size="sm"
              fallback={task.client.name.charAt(0)}
            />
            <span>{task.client.name}</span>
          </div>
        )}
        
        <div className="task-description">
          {task.description}
        </div>
        
        <div className="task-meta">
          <div className={`task-due ${isOverdue ? 'overdue' : ''}`}>
            <svg className="meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          </div>
          
          {task.assignees && task.assignees.length > 0 && (
            <div className="task-assignee">
              <svg className="meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{task.assignees.length} assigned</span>
            </div>
          )}
          
          {task.attachments && task.attachments.length > 0 && (
            <div className="task-due">
              <svg className="meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              <span>{task.attachments.length} files</span>
            </div>
          )}
        </div>

        <div className={`task-status ${task.status === 'completed' ? 'status-completed' : task.status === 'scheduled' ? 'status-scheduled' : task.status === 'draft' ? 'status-draft' : 'status-pending'}`}>
          {task.status}
        </div>
      </div>
      
      {showActions && (
        <div className="task-actions">
          <div className="task-social-accounts">
            {task.socialAccounts?.map((account) => (
              <Badge key={account.id} variant="info" size="sm">
                {account.platform}
              </Badge>
            ))}
          </div>
          
          <div className="task-buttons">
            {task.status === 'scheduled' && onComplete && (
              <Button 
                size="sm" 
                variant="success"
                onClick={(e) => {
                  e.stopPropagation();
                  onComplete(task);
                }}
              >
                Mark Complete
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
                Edit
              </Button>
            )}
            
            {onView && (
              <Button 
                size="sm" 
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onView(task);
                }}
              >
                View
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
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
