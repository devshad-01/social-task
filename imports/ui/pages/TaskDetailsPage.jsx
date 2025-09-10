import React, { useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { useParams, useNavigate } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { Tasks } from '../../api/tasks/TasksCollection';
import { useResponsive } from '../hooks/useResponsive';
import { useRole } from '../hooks/useRole';
import { MobileLoader } from '../components/common/MobileLoader';
import { Icons } from '../components/Icons';

export const TaskDetailsPage = () => {
  console.log('[TaskDetailsPage] Component mounting');
  const { id } = useParams();
  console.log('[TaskDetailsPage] Task ID from params:', id);
  
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  const { hasRole } = useRole();
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);

  const { task, loading, assignees } = useTracker(() => {
    console.log('[TaskDetailsPage] useTracker called with id:', id);
    const sub = Meteor.subscribe('tasks.single', id);
    const usersSub = Meteor.subscribe('users.all');
    
    const taskData = Tasks.findOne(id);
    const assigneeIds = taskData?.assigneeIds || [];
    const assigneeUsers = Meteor.users.find({ 
      _id: { $in: assigneeIds } 
    }).fetch();

    // Debug logging
    console.log('[TaskDetailsPage] Subscription ready:', sub.ready(), usersSub.ready());
    console.log('[TaskDetailsPage] Task data:', taskData);
    console.log('[TaskDetailsPage] Task ID:', id);
    console.log('[TaskDetailsPage] Current user:', Meteor.userId());
    console.log('[TaskDetailsPage] All tasks in collection:', Tasks.find().fetch());

    return {
      task: taskData,
      loading: !sub.ready() || !usersSub.ready(),
      assignees: assigneeUsers
    };
  }, [id]);

  const isAdmin = hasRole(['admin', 'supervisor']);

  const handleComplete = () => {
    Meteor.call('tasks.update', task._id, {
      status: 'completed',
      completedAt: new Date()
    }, (error) => {
      if (error) {
        console.error('Error completing task:', error);
      }
    });
    setShowCompleteConfirm(false);
  };

  const handleDelete = () => {
    Meteor.call('tasks.delete', task._id, (error) => {
      if (error) {
        console.error('Error deleting task:', error);
      } else {
        navigate('/tasks');
      }
    });
    setShowDeleteConfirm(false);
  };

  const handleArchive = () => {
    Meteor.call('tasks.update', task._id, {
      archived: true,
      archivedAt: new Date()
    }, (error) => {
      if (error) {
        console.error('Error archiving task:', error);
      }
    });
    setShowArchiveConfirm(false);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'priority-urgent';
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'priority-medium';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'status-completed';
      case 'in_progress': return 'status-progress';
      case 'pending': return 'status-pending';
      default: return 'status-pending';
    }
  };

  if (loading) {
    console.log('[TaskDetailsPage] Showing loading state');
    return (
      <div className="task-details-page loading">
        {isMobile ? (
          <MobileLoader 
            type="spinner" 
            message="Loading task details..." 
            size="medium"
          />
        ) : (
          <div className="loading-spinner">
            <Icons.loader className="w-8 h-8 animate-spin" />
            <p>Loading task details...</p>
          </div>
        )}
      </div>
    );
  }

  if (!task) {
    console.log('[TaskDetailsPage] No task found, showing error state');
    return (
      <div className="task-details-page error">
        <div className="error-state">
          <Icons.alertTriangle className="w-12 h-12 text-red-500 mb-4" />
          <h2>Task Not Found</h2>
          <p>The task you're looking for doesn't exist or you don't have permission to view it.</p>
          <p>Task ID: {id}</p>
          <button onClick={() => navigate('/tasks')} className="btn-primary mt-4">
            <Icons.arrowLeft className="w-4 h-4 mr-2" />
            Back to Tasks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="task-details-page">
      {/* Header */}
      <div className="task-details-header">
        <div className="header-nav">
          <button 
            onClick={() => navigate('/tasks')}
            className="back-button"
          >
            <Icons.arrowLeft className="w-5 h-5 mr-2" />
            Back to Tasks
          </button>
        </div>

        <div className="task-header-content">
          <div className="task-header-info">
            <h1 className="task-title">{task.title}</h1>
            <div className="task-meta">
              <span className={`task-status ${getStatusColor(task.status)}`}>
                {task.status.replace('_', ' ').toUpperCase()}
              </span>
              <span className={`task-priority ${getPriorityColor(task.priority)}`}>
                <Icons.flag className="w-4 h-4 mr-1" />
                {task.priority.toUpperCase()} PRIORITY
              </span>
            </div>
          </div>

          {/* Admin Actions */}
          {isAdmin && (
            <div className="admin-actions">
              <button 
                onClick={() => navigate(`/tasks/${task._id}/edit`)}
                className="btn-primary"
              >
                <Icons.edit className="w-4 h-4 mr-2" />
                Edit Task
              </button>
              
              {task.status !== 'completed' && (
                <button 
                  onClick={() => setShowCompleteConfirm(true)}
                  className="btn-success"
                >
                  <Icons.check className="w-4 h-4 mr-2" />
                  Mark Complete
                </button>
              )}
              
              <button 
                onClick={() => setShowArchiveConfirm(true)}
                className="btn-warning"
              >
                <Icons.archive className="w-4 h-4 mr-2" />
                Archive
              </button>
              
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="btn-danger"
              >
                <Icons.trash className="w-4 h-4 mr-2" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="task-details-content">
        {/* Description Section */}
        <div className="task-section">
          <h2 className="section-title">
            <Icons.fileText className="w-5 h-5 mr-2" />
            Description
          </h2>
          <div className="task-description">
            {task.description || <em className="text-gray-500">No description provided</em>}
          </div>
        </div>

        {/* Assignees Section */}
        {assignees.length > 0 && (
          <div className="task-section">
            <h2 className="section-title">
              <Icons.users className="w-5 h-5 mr-2" />
              Assigned to ({assignees.length})
            </h2>
            <div className="assignees-grid">
              {assignees.map((assignee) => (
                <div key={assignee._id} className="assignee-card">
                  <div className="assignee-avatar">
                    {assignee.profile?.avatar ? (
                      <img src={assignee.profile.avatar} alt={assignee.profile.firstName || assignee.username} />
                    ) : (
                      <span>{(assignee.profile?.firstName || assignee.username || 'U').charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="assignee-info">
                    <h4 className="assignee-name">
                      {assignee.profile?.firstName} {assignee.profile?.lastName || assignee.username}
                    </h4>
                    <p className="assignee-email">{assignee.emails?.[0]?.address}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Task Details Grid */}
        <div className="task-details-grid">
          <div className="task-detail-card">
            <h3 className="detail-title">
              <Icons.calendar className="w-5 h-5 mr-2" />
              Due Date
            </h3>
            <p className="detail-value">
              {task.dueDate ? formatDate(task.dueDate) : 'No due date set'}
            </p>
          </div>

          <div className="task-detail-card">
            <h3 className="detail-title">
              <Icons.clock className="w-5 h-5 mr-2" />
              Created
            </h3>
            <p className="detail-value">
              {formatDate(task.createdAt)}
            </p>
          </div>

          {task.completedAt && (
            <div className="task-detail-card">
              <h3 className="detail-title">
                <Icons.check className="w-5 h-5 mr-2" />
                Completed
              </h3>
              <p className="detail-value">
                {formatDate(task.completedAt)}
              </p>
            </div>
          )}

          <div className="task-detail-card">
            <h3 className="detail-title">
              <Icons.tag className="w-5 h-5 mr-2" />
              Category
            </h3>
            <p className="detail-value">
              {task.category || 'General'}
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation Modals */}
      {showCompleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Complete Task</h3>
              <button onClick={() => setShowCompleteConfirm(false)} className="modal-close">
                <Icons.x className="w-5 h-5" />
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to mark "<strong>{task.title}</strong>" as completed?</p>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowCompleteConfirm(false)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleComplete} className="btn-success">
                <Icons.check className="w-4 h-4 mr-2" />
                Complete Task
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Delete Task</h3>
              <button onClick={() => setShowDeleteConfirm(false)} className="modal-close">
                <Icons.x className="w-5 h-5" />
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete "<strong>{task.title}</strong>"? This action cannot be undone.</p>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowDeleteConfirm(false)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleDelete} className="btn-danger">
                <Icons.trash className="w-4 h-4 mr-2" />
                Delete Task
              </button>
            </div>
          </div>
        </div>
      )}

      {showArchiveConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Archive Task</h3>
              <button onClick={() => setShowArchiveConfirm(false)} className="modal-close">
                <Icons.x className="w-5 h-5" />
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to archive "<strong>{task.title}</strong>"? You can restore it later.</p>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowArchiveConfirm(false)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleArchive} className="btn-warning">
                <Icons.archive className="w-4 h-4 mr-2" />
                Archive Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
