import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input, TextArea, Select, FileInput, Checkbox } from '../common/Input';
import { Badge } from '../common/Badge';
import { Avatar } from '../common/Avatar';

export const TaskModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  onDelete,
  task = null, 
  clients = [], 
  users = [],
  mode = 'view', // 'view', 'edit', 'create'
  canDelete = false
}) => {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : '',
    clientId: task?.clientId || '',
    assigneeIds: task?.assigneeIds || [],
    socialAccountIds: task?.socialAccountIds || [],
    attachments: task?.attachments || [],
    status: task?.status || 'draft',
    priority: task?.priority || 'medium',
    tags: task?.tags || []
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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

  const handleDeleteTask = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await onDelete();
        onClose();
      } catch (error) {
        setErrors({ submit: error.message });
      }
    }
  };

  const handleCompleteTask = () => {
    if (window.confirm('Are you sure you want to mark this task as complete?')) {
      onSave({ 
        status: 'completed',
        completedAt: new Date()
      });
    }
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
    
    if (!formData.clientId) {
      newErrors.clientId = 'Client is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  const selectedClient = clients.find(c => c.id === formData.clientId);

  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';
  const isCreateMode = mode === 'create';

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isCreateMode ? 'Create New Task' : isEditMode ? 'Edit Task' : 'Task Details'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {errors.submit}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <Input
              label="Task Title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              error={errors.title}
              placeholder="Enter task title"
              disabled={isViewMode}
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <TextArea
              label="Description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              error={errors.description}
              placeholder="Describe the task..."
              rows={4}
              disabled={isViewMode}
              required
            />
          </div>
          
          <div>
            <Input
              label="Due Date & Time"
              type="datetime-local"
              value={formData.dueDate}
              onChange={(e) => handleChange('dueDate', e.target.value)}
              error={errors.dueDate}
              disabled={isViewMode}
              required
            />
          </div>
          
          <div>
            <Select
              label="Client"
              value={formData.clientId}
              onChange={(e) => handleChange('clientId', e.target.value)}
              error={errors.clientId}
              disabled={isViewMode}
              required
              options={clients.map(client => ({
                value: client.id,
                label: client.name
              }))}
            />
          </div>
          
          <div>
            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              disabled={isViewMode}
              options={[
                { value: 'draft', label: 'Draft' },
                { value: 'scheduled', label: 'Scheduled' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'completed', label: 'Completed' },
                { value: 'blocked', label: 'Blocked' }
              ]}
            />
          </div>
          
          <div>
            <Select
              label="Priority"
              value={formData.priority}
              onChange={(e) => handleChange('priority', e.target.value)}
              disabled={isViewMode}
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' }
              ]}
            />
          </div>
        </div>
        
        {!isViewMode && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign to Team Members
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {users.map(user => (
                <Checkbox
                  key={user.id}
                  label={
                    <div className="flex items-center space-x-2">
                      <Avatar 
                        src={user.avatar} 
                        alt={user.fullName}
                        size="sm"
                        fallback={user.fullName?.charAt(0) || '?'}
                      />
                      <span>{user.fullName}</span>
                      <Badge variant="outline" size="sm">{user.role}</Badge>
                    </div>
                  }
                  checked={formData.assigneeIds.includes(user.id)}
                  onChange={(e) => handleArrayChange('assigneeIds', user.id, e.target.checked)}
                />
              ))}
            </div>
          </div>
        )}
        
        {selectedClient?.socialAccounts && selectedClient.socialAccounts.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Social Media Accounts
            </label>
            <div className="space-y-2">
              {selectedClient.socialAccounts.map(account => (
                <Checkbox
                  key={account.id}
                  label={
                    <div className="flex items-center space-x-2">
                      <Badge variant="info" size="sm">{account.platform}</Badge>
                      <span>{account.name}</span>
                    </div>
                  }
                  checked={formData.socialAccountIds.includes(account.id)}
                  onChange={(e) => handleArrayChange('socialAccountIds', account.id, e.target.checked)}
                  disabled={isViewMode}
                />
              ))}
            </div>
          </div>
        )}
        
        {!isViewMode && (
          <div>
            <FileInput
              label="Attachments"
              accept="image/*,video/*,.pdf,.doc,.docx"
              multiple
              helper="Upload images, videos, or documents (max 5MB each)"
            />
          </div>
        )}
        
        {task?.attachments && task.attachments.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Attachments
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {task.attachments.map((attachment, index) => (
                <div key={index} className="relative">
                  <img 
                    src={attachment.url} 
                    alt={attachment.name}
                    className="w-full h-20 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Button size="sm" variant="ghost" className="text-white">
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex justify-between pt-4 border-t">
          <div>
            {canDelete && isEditMode && (
              <Button 
                type="button" 
                variant="danger" 
                onClick={handleDeleteTask}
              >
                Delete Task
              </Button>
            )}
          </div>
          
          <div className="flex space-x-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {!isViewMode && (
              <Button type="submit" variant="primary" loading={loading}>
                {isCreateMode ? 'Create Task' : 'Save Changes'}
              </Button>
            )}
            {isViewMode && task?.status !== 'completed' && (
              <Button 
                type="button" 
                variant="success"
                onClick={handleCompleteTask}
              >
                Mark as Complete
              </Button>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
};
