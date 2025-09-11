import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input, TextArea, Select, FileInput, Checkbox } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { Avatar } from '../components/common/Avatar';
import { Toast } from '../components/common/Toast';
import { NavigationContext } from '../context/NavigationContext';
import { Icons } from '../components/Icons';

export const AddTaskPage = () => {
  const navigate = useNavigate();
  const { canCreateTasks } = useContext(NavigationContext);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    scheduledAt: '',
    clientId: '',
    assigneeIds: [],
    assignedTo: [], // Add this for scheduled tasks
    socialAccountIds: [],
    attachments: [],
    status: 'draft',
    priority: 'medium',
    tags: []
  });
  
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Get clients and users data
  const { clients, users, usersLoading } = useTracker(() => {
    const usersHandle = Meteor.subscribe('users.all');
    const userData = Meteor.users.find({}, { 
      fields: { 
        emails: 1, 
        'profile.firstName': 1,
        'profile.lastName': 1,
        'profile.fullName': 1,
        'profile.role': 1,
        'profile.avatar': 1
      } 
    }).fetch();
    
    console.log('[AddTaskPage] Users data:', userData);
    console.log('[AddTaskPage] Users loading:', !usersHandle.ready());
    
    return {
      clients: [], // TODO: Add clients collection
      users: userData,
      usersLoading: !usersHandle.ready()
    };
  }, []);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleArrayChange = (name, item, isChecked) => {
    setFormData(prev => ({
      ...prev,
      [name]: isChecked 
        ? [...prev[name], item]
        : prev[name].filter(i => i !== item)
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

    const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      setErrors(prev => ({ ...prev, submit: 'Please fill in all required fields' }));
      return;
    }

    // For scheduled tasks, ensure scheduled time and assignees are set
    if (formData.status === 'scheduled') {
      if (!formData.scheduledAt) {
        setErrors(prev => ({ ...prev, submit: 'Scheduled execution time is required for scheduled tasks' }));
        return;
      }
      if (!formData.assigneeIds || formData.assigneeIds.length === 0) {
        setErrors(prev => ({ ...prev, submit: 'Assignees are required for scheduled tasks' }));
        return;
      }
    }

    setLoading(true);
    setErrors(prev => ({ ...prev, submit: '' }));

    const taskData = {
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      status: formData.status,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
      scheduledAt: formData.scheduledAt ? new Date(formData.scheduledAt) : null,
      clientId: formData.clientId,
      assigneeIds: formData.assigneeIds || [],
      socialAccountIds: formData.socialAccountIds || [],
      attachments: formData.attachments || [],
      tags: formData.tags || []
    };

    Meteor.call('tasks.insert', taskData, (error, result) => {
      setLoading(false);
      if (error) {
        setErrors(prev => ({ ...prev, submit: error.reason || 'Failed to create task' }));
      } else {
        // Success message based on task type
        if (formData.status === 'scheduled') {
          alert('📅 Scheduled task created! Assignees will be notified at the scheduled execution time.');
        } else {
          alert('Task created successfully!');
        }
        navigate('/tasks');
      }
    });
  };

  // Redirect if user can't create tasks
  if (!canCreateTasks) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <Icons.shield className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">You don't have permission to create tasks.</p>
            <Button onClick={() => navigate('/tasks')}>Back to Tasks</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Task</h1>
            <p className="text-gray-600">Add a new task to your project</p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/tasks')}
            className="flex items-center gap-2"
          >
            <Icons.arrowLeft className="w-4 h-4" />
            Back to Tasks
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Main Details */}
            <Card>
              <CardHeader>
                <CardTitle>Task Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Title"
                  name="title"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  error={errors.title}
                  placeholder="Enter task title"
                  required
                />
                
                <TextArea
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  error={errors.description}
                  placeholder="Describe the task details..."
                  rows={4}
                  required
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Priority"
                    name="priority"
                    value={formData.priority}
                    onChange={(e) => handleChange('priority', e.target.value)}
                    options={[
                      { value: 'low', label: 'Low' },
                      { value: 'medium', label: 'Medium' },
                      { value: 'high', label: 'High' }
                    ]}
                  />
                  
                  <Select
                    label="Status"
                    name="status"
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    options={[
                      { value: 'draft', label: 'Draft' },
                      { value: 'scheduled', label: '📅 Scheduled Task' },
                      { value: 'pending', label: 'Pending' },
                      { value: 'in-progress', label: 'In Progress' },
                      { value: 'completed', label: 'Completed' }
                    ]}
                  />
                </div>

                {formData.status === 'scheduled' && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">📅 Schedule Settings</h4>
                    <p className="text-sm text-blue-700 mb-3">
                      Set when this task should be activated and when it should be completed.
                    </p>
                    
                    <div className="space-y-3">
                      <Input
                        label="🕐 Execute At (When to start the task)"
                        name="scheduledAt"
                        type="datetime-local"
                        value={formData.scheduledAt}
                        onChange={(e) => handleChange('scheduledAt', e.target.value)}
                        error={errors.scheduledAt}
                        required={formData.status === 'scheduled'}
                        help="Assigned users will be notified at this time"
                      />
                    </div>
                    
                    <div className="text-xs text-blue-600 mt-2">
                      💡 Make sure to assign users for notifications to work.
                    </div>
                  </div>
                )}
                
                <Input
                  label={formData.status === 'scheduled' ? "🏁 Due Date (When task should be completed)" : "Due Date"}
                  name="dueDate"
                  type="datetime-local"
                  value={formData.dueDate}
                  onChange={(e) => handleChange('dueDate', e.target.value)}
                  error={errors.dueDate}
                  help={formData.status === 'scheduled' ? "Optional: Set a completion deadline" : undefined}
                  required={formData.status !== 'scheduled'}
                />
              </CardContent>
            </Card>

            {/* Assignment */}
            <Card>
              <CardHeader>
                <CardTitle>Assignment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Client Selection */}
                <Select
                  label="Client"
                  name="clientId"
                  value={formData.clientId}
                  onChange={(e) => handleChange('clientId', e.target.value)}
                  options={[
                    { value: '', label: 'Select a client' },
                    ...clients.map(client => ({
                      value: client._id,
                      label: client.name
                    }))
                  ]}
                />
                
                {/* Assignee Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assignees
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {users.map(user => (
                      <div key={user._id} className="flex items-center space-x-3">
                        <Checkbox
                          checked={formData.assigneeIds.includes(user._id)}
                          onChange={(e) => handleArrayChange('assigneeIds', user._id, e.target.checked)}
                        />
                        <Avatar
                          name={user.profile?.fullName || user.emails[0]?.address}
                          size="sm"
                        />
                        <span className="text-sm text-gray-700">
                          {user.profile?.fullName || 
                           `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim() ||
                           user.emails[0]?.address ||
                           'Unknown User'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="cursor-pointer">
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleArrayChange('tags', tag, false)}
                          className="ml-1 hover:text-red-500"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                    <Input
                      placeholder="Add tag..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const tag = e.target.value.trim();
                          if (tag && !formData.tags.includes(tag)) {
                            handleArrayChange('tags', tag, true);
                            e.target.value = '';
                          }
                        }
                      }}
                      className="w-24"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Attachments */}
          <Card>
            <CardHeader>
              <CardTitle>Attachments</CardTitle>
            </CardHeader>
            <CardContent>
              <FileInput
                label="Upload Files"
                name="attachments"
                multiple
                onChange={(files) => handleChange('attachments', files)}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
              />
              <p className="text-sm text-gray-500 mt-2">
                Supported formats: PDF, DOC, DOCX, JPG, JPEG, PNG, GIF
              </p>
            </CardContent>
          </Card>

          {/* Submit Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/tasks')}
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
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Icons.plus className="w-4 h-4" />
                  Create Task
                </>
              )}
            </Button>
          </div>
          
          {errors.submit && (
            <div className="text-red-600 text-sm mt-2">
              {errors.submit}
            </div>
          )}
        </form>
      </div>

      {/* Success Toast */}
      {showToast && (
        <Toast
          message="Task created successfully!"
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};
