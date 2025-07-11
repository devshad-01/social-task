import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input, TextArea, Select, FileInput } from '../common/Input';
import { Avatar } from '../common/Avatar';
import { Icons } from '../Icons';

export const ProfileEditModal = ({ isOpen, onClose, user, onSave }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || '',
    location: user?.location || '',
    bio: user?.bio || '',
    skills: user?.skills?.join(', ') || '',
    avatar: user?.avatar || null
  });

  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const updatedUser = {
        ...user,
        ...formData,
        skills: formData.skills.split(',').map(skill => skill.trim()).filter(Boolean)
      };
      
      await onSave(updatedUser);
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        setFormData(prev => ({
          ...prev,
          avatar: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Upload */}
        <div className="flex flex-col items-center space-y-4">
          <Avatar
            src={avatarPreview}
            alt={formData.name}
            size="xl"
            className="w-20 h-20"
          />
          <FileInput
            accept="image/*"
            onChange={handleAvatarChange}
            label="Change Avatar"
            variant="secondary"
            className="text-sm"
          />
        </div>

        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          <Input
            label="Phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange}
          />
          <Select
            label="Department"
            name="department"
            value={formData.department}
            onChange={handleInputChange}
          >
            <option value="">Select Department</option>
            <option value="Creative">Creative</option>
            <option value="Marketing">Marketing</option>
            <option value="Strategy">Strategy</option>
            <option value="Analytics">Analytics</option>
            <option value="Management">Management</option>
          </Select>
        </div>

        <Input
          label="Location"
          name="location"
          value={formData.location}
          onChange={handleInputChange}
          placeholder="e.g., San Francisco, CA"
        />

        <TextArea
          label="Bio"
          name="bio"
          value={formData.bio}
          onChange={handleInputChange}
          placeholder="Tell us about yourself..."
          rows={3}
        />

        <Input
          label="Skills"
          name="skills"
          value={formData.skills}
          onChange={handleInputChange}
          placeholder="e.g., Social Media, Content Creation, Analytics"
          helpText="Separate skills with commas"
        />

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Icons.loading className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
