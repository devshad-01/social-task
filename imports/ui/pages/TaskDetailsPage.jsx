import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import { Tasks } from '../../api/tasks/TasksCollection';

export const TaskDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);

  const { user } = useTracker(() => ({
    user: Meteor.user()
  }), []);

  const isAdmin = user && Roles.userIsInRole(user._id, ['admin', 'supervisor']);

  // Track the specific task
  const { task, loading } = useTracker(() => {
    const handle = Meteor.subscribe('tasks.byId', id);
    const task = Tasks.findOne(id);
    
    return {
      task,
      loading: !handle.ready()
    };
  }, [id]);

  if (loading) {
    return (
      <div className="page-container">
        <div>Loading...</div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Task Not Found</h1>
          <p className="text-gray-600">The task you're looking for doesn't exist or you don't have permission to view it.</p>
          <button 
            onClick={() => navigate('/tasks')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Tasks
          </button>
        </div>
      </div>
    );
  }

  const handleDelete = () => {
    Meteor.call('tasks.remove', task._id, (error) => {
      if (error) {
        console.error('Error deleting task:', error);
      } else {
        navigate('/tasks');
      }
    });
    setShowDeleteConfirm(false);
  };

  const handleComplete = () => {
    Meteor.call('tasks.update', task._id, {
      ...task,
      status: 'completed',
      completedAt: new Date()
    }, (error) => {
      if (error) {
        console.error('Error completing task:', error);
      }
    });
    setShowCompleteConfirm(false);
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

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <button 
            onClick={() => navigate('/tasks')}
            className="mb-4 px-3 py-1 text-blue-600 hover:bg-gray-100 rounded"
          >
            ← Back to Tasks
          </button>
          <h1 className="page-title">{task.title}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
              {task.status.replace('_', ' ').toUpperCase()}
            </span>
            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
              {task.priority.toUpperCase()} Priority
            </span>
          </div>
        </div>
        
        <div className="flex gap-2">
          {isAdmin && (
            <>
              <button
                onClick={() => setShowEditModal(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Edit
              </button>
              
              {task.status !== 'completed' && (
                <button
                  onClick={() => setShowCompleteConfirm(true)}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Complete
                </button>
              )}
              
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Task Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">
              {task.description || 'No description provided.'}
            </p>
          </div>

          {/* Activity placeholder */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Activity</h3>
            <p className="text-gray-500 text-center py-8">
              Activity log coming soon...
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Task Info */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Task Information</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="mt-1">
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                    {task.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Priority</label>
                <div className="mt-1">
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                    {task.priority.toUpperCase()}
                  </span>
                </div>
              </div>

              {task.dueDate && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Due Date</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDate(task.dueDate)}
                  </p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-500">Created</label>
                <p className="mt-1 text-sm text-gray-900">
                  {formatDate(task.createdAt)}
                </p>
              </div>

              {task.completedAt && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Completed</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDate(task.completedAt)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Simple modals using basic styling */}
      {showCompleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Complete Task</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to mark "{task.title}" as completed?
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setShowCompleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleComplete}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Complete Task
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Task</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete "{task.title}" ? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
