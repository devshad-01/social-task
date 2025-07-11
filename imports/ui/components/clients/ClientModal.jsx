import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input, TextArea, FileInput } from '../common/Input';
import { Avatar } from '../common/Avatar';

export const ClientModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  client = null, 
  mode = 'view' // 'view', 'edit', 'create'
}) => {
  const [formData, setFormData] = useState({
    name: client?.name || '',
    logoUrl: client?.logoUrl || '',
    contact: {
      name: client?.contact?.name || '',
      email: client?.contact?.email || '',
      phone: client?.contact?.phone || ''
    }
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Company name is required';
    }
    
    if (!formData.contact.name.trim()) {
      newErrors['contact.name'] = 'Contact name is required';
    }
    
    if (!formData.contact.email.trim()) {
      newErrors['contact.email'] = 'Contact email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.contact.email)) {
      newErrors['contact.email'] = 'Please enter a valid email';
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

  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';
  const isCreateMode = mode === 'create';

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isCreateMode ? 'Add New Client' : isEditMode ? 'Edit Client' : 'Client Details'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {errors.submit}
          </div>
        )}
        
        <div className="text-center">
          <Avatar 
            src={formData.logoUrl} 
            alt={formData.name}
            size="2xl"
            fallback={formData.name.charAt(0)}
            className="mx-auto mb-4"
          />
          {!isViewMode && (
            <div className="space-y-2">
              <FileInput
                label="Company Logo"
                accept="image/*"
                helper="Upload a logo image (max 5MB)"
              />
              <Input
                placeholder="Or enter logo URL"
                value={formData.logoUrl}
                onChange={(e) => handleChange('logoUrl', e.target.value)}
                disabled={isViewMode}
              />
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <Input
            label="Company Name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={errors.name}
            placeholder="Enter company name"
            disabled={isViewMode}
            required
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Contact Person"
              value={formData.contact.name}
              onChange={(e) => handleChange('contact.name', e.target.value)}
              error={errors['contact.name']}
              placeholder="Enter contact name"
              disabled={isViewMode}
              required
            />
            
            <Input
              label="Contact Email"
              type="email"
              value={formData.contact.email}
              onChange={(e) => handleChange('contact.email', e.target.value)}
              error={errors['contact.email']}
              placeholder="Enter contact email"
              disabled={isViewMode}
              required
            />
          </div>
          
          <Input
            label="Contact Phone"
            type="tel"
            value={formData.contact.phone}
            onChange={(e) => handleChange('contact.phone', e.target.value)}
            error={errors['contact.phone']}
            placeholder="Enter contact phone (optional)"
            disabled={isViewMode}
          />
        </div>
        
        {client && client.socialAccounts && client.socialAccounts.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Connected Social Accounts</h4>
            <div className="space-y-2">
              {client.socialAccounts.map(account => (
                <div key={account.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${account.isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="font-medium">{account.platform}</span>
                    <span className="text-sm text-gray-600">{account.name}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    account.isConnected 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {account.isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          
          {!isViewMode && (
            <Button type="submit" loading={loading}>
              {isCreateMode ? 'Add Client' : 'Save Changes'}
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
};
