import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Tasks } from '../../api/tasks/TasksCollection';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input, TextArea, Select, FileInput, Checkbox } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { Avatar } from '../components/common/Avatar';
import { Toast } from '../components/common/Toast';
import { MobileLoader } from '../components/common/MobileLoader';
import { NavigationContext } from '../context/NavigationContext';
import { useResponsive } from '../hooks/useResponsive';
import { useRole } from '../hooks/useRole';
import { Icons } from '../components/Icons';

export const EditTaskPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isMobile } = useResponsive();
  const { isAdmin } = useRole();
  const { canCreateTasks } = useContext(NavigationContext);
  
  console.log('[EditTaskPage] Rendering, task ID:', id);
  console.log('[EditTaskPage] User is admin:', isAdmin);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    clientId: '',
    assigneeIds: [],
    socialAccountIds: [],
    attachments: [],
    status: 'draft',
    priority: 'medium',
    tags: []
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Get task and users data
  const { task, users, dataLoading } = useTracker(() => {
    const taskHandle = Meteor.subscribe('tasks.single', id);
    const usersHandle = Meteor.subscribe('users.all');
    
    const taskReady = taskHandle.ready();
    const usersReady = usersHandle.ready();
    const taskData = Tasks.findOne(id);
    
    console.log('[EditTaskPage] Subscription status:', { taskReady, usersReady, taskFound: !!taskData });
    
    return {
      task: taskData,
      users: Meteor.users.find({}, { 
        fields: { 
          emails: 1, 
          'profile.firstName': 1,
          'profile.lastName': 1,
          'profile.fullName': 1,
          'profile.role': 1,
          'profile.avatar': 1
        } 
      }).fetch(),
      dataLoading: !taskReady || !usersReady
    };
  }, [id]);

  // Initialize form with task data
  useEffect(() => {
    if (task && !initialized) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        clientId: task.clientId || '',
        assigneeIds: task.assigneeIds || [],
        socialAccountIds: task.socialAccountIds || [],
        attachments: task.attachments || [],
        status: task.status || 'draft',
        priority: task.priority || 'medium',
        tags: task.tags || []
      });
      setInitialized(true);
    }
  }, [task, initialized]);

  // Check permissions
  if (!isAdmin) {
    return (
      <div className="task-edit-page">
        <div className="unauthorized">
          <Icons.lock className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-red-900 mb-2">Unauthorized</h2>
          <p className="text-red-600">You don't have permission to edit tasks.</p>
          <Button onClick={() => navigate('/tasks')} className="mt-4">
            Back to Tasks
          </Button>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAssigneeChange = (userId) => {
    setFormData(prev => ({
      ...prev,
      assigneeIds: prev.assigneeIds.includes(userId)
        ? prev.assigneeIds.filter(id => id !== userId)
        : [...prev.assigneeIds, userId]
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Create clean update data - only include fields we want to update
      const updateData = {
        title: formData.title,
        description: formData.description,
        dueDate: new Date(formData.dueDate),
        clientId: formData.clientId,
        assigneeIds: formData.assigneeIds,
        socialAccountIds: formData.socialAccountIds,
        attachments: formData.attachments,
        status: formData.status,
        priority: formData.priority,
        tags: formData.tags
      };
      
      console.log('[EditTaskPage] Updating task with data:', updateData);
      await Meteor.callAsync('tasks.update', id, updateData);
      
      setShowToast(true);
      setTimeout(() => {
        navigate(`/tasks/${id}`);
      }, 1500);
      
    } catch (error) {
      console.error('Error updating task:', error);
      setErrors({ submit: error.reason || 'Failed to update task' });
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <div className="task-edit-page">
        {isMobile ? (
          <MobileLoader type="spinner" message="Loading task..." />
        ) : (
          <div className="loading-spinner">
            <Icons.loader className="w-8 h-8 animate-spin" />
            <p>Loading task...</p>
          </div>
        )}
      </div>
    );
  }

  if (!task) {
    return (
      <div className="task-edit-page">
        <div className="error-state">
          <Icons.alert className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-red-900 mb-2">Task Not Found</h2>
          <p className="text-red-600">The task you're trying to edit doesn't exist.</p>
          <Button onClick={() => navigate('/tasks')} className="mt-4">
            Back to Tasks
          </Button>
        </div>
      </div>
    );
  }

  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'blocked', label: 'Blocked' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
  ];

  return (
    <div className="task-edit-page">
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-title-section">
            <button 
              onClick={() => navigate(`/tasks/${id}`)}
              className="back-button"
            >
              <Icons.arrowLeft className="w-5 h-5" />
              Back
            </button>
            <h1 className="page-title">
              <Icons.edit className="w-6 h-6 mr-3" />
              Edit Task
            </h1>
          </div>
        </div>
      </div>

      <div className="page-content">
        <Card className="task-form-card">
          <CardHeader>
            <CardTitle>Task Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="task-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="title">Task Title *</label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter task title"
                    error={errors.title}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="priority">Priority</label>
                  <Select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    options={priorityOptions}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <Select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    options={statusOptions}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="dueDate">Due Date *</label>
                  <Input
                    id="dueDate"
                    name="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    error={errors.dueDate}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <TextArea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter task description"
                  rows={4}
                  error={errors.description}
                  required
                />
              </div>

              <div className="form-group">
                <label>Assign To</label>
                <div className="assignee-list">
                  {users.map(user => (
                    <div key={user._id} className="assignee-item">
                      <Checkbox
                        id={`assignee-${user._id}`}
                        checked={formData.assigneeIds.includes(user._id)}
                        onChange={() => handleAssigneeChange(user._id)}
                      />
                      <label htmlFor={`assignee-${user._id}`} className="assignee-label">
                        <Avatar
                          src={user.profile?.avatar}
                          alt={user.profile?.firstName || user.emails?.[0]?.address}
                          size="sm"
                          fallback={user.profile?.firstName?.charAt(0) || user.emails?.[0]?.address?.charAt(0)}
                        />
                        <span className="assignee-name">
                          {user.profile?.firstName 
                            ? `${user.profile.firstName} ${user.profile.lastName || ''}`
                            : user.emails?.[0]?.address || 'Unknown User'}
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {errors.submit && (
                <div className="error-message">
                  {errors.submit}
                </div>
              )}

              <div className="form-actions">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/tasks/${id}`)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Icons.loader className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Icons.save className="w-4 h-4 mr-2" />
                      Update Task
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {showToast && (
        <Toast
          message="Task updated successfully!"
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};
