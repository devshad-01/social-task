# 🎨 Mobile Task Management Design System & Component Library

## Design System Overview

This is a mobile-first, productivity-focused design system with emphasis on clarity and intuitive navigation. The system prioritizes thumb-friendly interactions, consistent spacing, and clear visual hierarchy.

### Color Palette
```css
/* Primary Brand Colors */
--color-primary: #6366F1;     /* Main brand (Indigo) */
--color-primary-light: #8B5CF6; /* Light variant (Purple) */
--color-accent: #F59E0B;      /* Accent (Amber) */

/* Semantic Colors */
--color-success: #10B981;     /* Green */
--color-warning: #F59E0B;     /* Amber */
--color-error: #EF4444;       /* Red */
--color-info: #3B82F6;        /* Blue */

/* Usage Colors */
--color-background: #F9FAFB;  /* Light gray background */
--color-surface: #FFFFFF;     /* White surfaces */
--color-text-primary: #111827; /* Nearly black */
--color-text-secondary: #6B7280; /* Medium gray */
--color-text-tertiary: #9CA3AF; /* Light gray */
--color-border: #E5E7EB;      /* Light border */
```

### Typography Scale
```css
/* Typography Classes */
.h1 { font-size: 28px; font-weight: 700; line-height: 1.2; }
.h2 { font-size: 24px; font-weight: 600; line-height: 1.25; }
.h3 { font-size: 20px; font-weight: 600; line-height: 1.3; }
.h4 { font-size: 18px; font-weight: 600; line-height: 1.4; }
.body { font-size: 16px; font-weight: 400; line-height: 1.5; }
.body-small { font-size: 14px; font-weight: 400; line-height: 1.43; }
.caption { font-size: 12px; font-weight: 500; line-height: 1.33; }
.label { font-size: 14px; font-weight: 500; line-height: 1.43; }
```

### Spacing & Layout
```css
/* Design System Spacing */
--spacing-xs: 4px;   /* Micro spacing */
--spacing-sm: 8px;   /* Small spacing */
--spacing-md: 12px;  /* Medium spacing */
--spacing-lg: 16px;  /* Large spacing */
--spacing-xl: 20px;  /* Extra large */
--spacing-2xl: 24px; /* 2x extra large */
--spacing-3xl: 32px; /* Section spacing */
--spacing-4xl: 40px; /* Large section spacing */

/* Mobile Layout Classes */
.mobile-container { max-width: 100%; margin: 0 auto; padding: 0 20px; }
.mobile-section { margin-bottom: 32px; }
.mobile-card-grid { display: flex; flex-direction: column; gap: 16px; }
.mobile-stack { display: flex; flex-direction: column; gap: 24px; }
```

## Core Component Library

### Buttons
```javascript
// Primary Button Component
export function PrimaryButton({ children, onClick, disabled = false, className = "" }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn-primary ${className}`}
    >
      {children}
    </button>
  );
}

// Secondary Button Component  
export function SecondaryButton({ children, onClick, disabled = false, className = "" }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn-secondary ${className}`}
    >
      {children}
    </button>
  );
}
```

### Cards & Surfaces
```javascript
// Task Card Component
export function TaskCard({ task, onComplete, className = "" }) {
  const statusClass = {
    draft: 'status-draft',
    scheduled: 'status-scheduled',
    completed: 'status-completed',
    overdue: 'status-overdue'
  }[task.status] || 'status-draft';

  const categoryClass = {
    work: 'tag-work',
    business: 'tag-business', 
    personal: 'tag-personal'
  }[task.category] || 'tag-work';

  return (
    <div className={`task-card ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <h3 className="h4">{task.title}</h3>
        <span className={statusClass}>{task.status}</span>
      </div>
      
      <p className="body-small text-gray-600 mb-4">{task.content}</p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={categoryClass}>{task.category}</span>
          {task.socialAccounts?.map(account => (
            <span key={account.id} className={`platform-${account.platform}`}>
              {account.name}
            </span>
          ))}
        </div>
        
        <PrimaryButton onClick={() => onComplete(task._id)}>
          Complete
        </PrimaryButton>
      </div>
    </div>
  );
}

// Elevated Card for Important Content
export function ElevatedCard({ children, className = "" }) {
  return (
    <div className={`task-card-elevated ${className}`}>
      {children}
    </div>
  );
}
```

### Form Components
```javascript
// Base Input Component
export function Input({ 
  label, 
  value, 
  onChange, 
  type = "text", 
  placeholder = "", 
  error = "",
  disabled = false,
  className = ""
}) {
  return (
    <div className={`w-full ${className}`}>
      {label && <label className="label block mb-2">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`input-base ${error ? 'border-red-500' : ''}`}
      />
      {error && <p className="caption text-red-500 mt-1">{error}</p>}
    </div>
  );
}

// Textarea Component
export function TextArea({ 
  label, 
  value, 
  onChange, 
  placeholder = "", 
  error = "",
  rows = 4,
  maxLength = 2200, // MVP: Social media character limit
  className = ""
}) {
  const remaining = maxLength - (value?.length || 0);
  
  return (
    <div className={`w-full ${className}`}>
      {label && <label className="label block mb-2">{label}</label>}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className={`input-base resize-none ${error ? 'border-red-500' : ''}`}
      />
      <div className="flex justify-between items-center mt-1">
        {error && <p className="caption text-red-500">{error}</p>}
        <p className={`caption ml-auto ${remaining < 100 ? 'text-red-500' : 'text-gray-500'}`}>
          {remaining} characters remaining
        </p>
      </div>
    </div>
  );
}
```

#### AppLayout.jsx
```javascript
// imports/ui/components/layout/AppLayout.jsx
import React from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { MobileNavbar } from './MobileNavbar';

export function AppLayout({ children }) {
  const user = useTracker(() => Meteor.user());
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Layout */}
      <div className="hidden lg:flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
      
      {/* Mobile Layout */}
      <div className="lg:hidden">
        <MobileNavbar />
        <main className="pt-16 p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
```

#### Navbar.jsx
```javascript
// imports/ui/components/layout/Navbar.jsx
import React from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';

export function Navbar() {
  const user = useTracker(() => Meteor.user());
  
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">
          Social Task Manager
        </h1>
        
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <BellIcon className="h-6 w-6" />
          </button>
          
          {/* User Menu */}
          <div className="flex items-center space-x-2">
            <img
              src={user?.profile?.avatarUrl || '/default-avatar.png'}
              alt="Avatar"
              className="h-8 w-8 rounded-full"
            />
            <span className="text-sm font-medium text-gray-700">
              {user?.profile?.name || 'User'}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
```

### Form Components

#### TaskForm.jsx
```javascript
// imports/ui/components/forms/TaskForm.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTracker } from 'meteor/react-meteor-data';
import { Clients } from '/imports/api/clients/clients';
import { DateTimePicker } from './DateTimePicker';
import { FileUpload } from './FileUpload';
import { UserSelect } from './UserSelect';

export function TaskForm({ onSubmit, initialData = null }) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: initialData || {
      title: '',
      content: '',
      dueAt: new Date(),
      clientId: '',
      assignees: [],
      scheduledFor: null
    }
  });

  const [attachments, setAttachments] = useState(initialData?.attachments || []);
  const content = watch('content', '');
  
  const clients = useTracker(() => 
    Clients.find({ isActive: true }, { sort: { name: 1 } }).fetch()
  );

  const handleFormSubmit = (data) => {
    onSubmit({
      ...data,
      attachments
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Task Title *
        </label>
        <input
          {...register('title', { 
            required: 'Title is required',
            maxLength: { value: 100, message: 'Title must be under 100 characters' }
          })}
          className="input-field"
          placeholder="Enter task title..."
        />
        {errors.title && (
          <p className="text-error-500 text-sm mt-1">{errors.title.message}</p>
        )}
      </div>

      {/* Client Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Client *
        </label>
        <select
          {...register('clientId', { required: 'Please select a client' })}
          className="input-field"
        >
          <option value="">Select a client...</option>
          {clients.map(client => (
            <option key={client._id} value={client._id}>
              {client.name}
            </option>
          ))}
        </select>
        {errors.clientId && (
          <p className="text-error-500 text-sm mt-1">{errors.clientId.message}</p>
        )}
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Content *
        </label>
        <textarea
          {...register('content', { 
            required: 'Content is required',
            maxLength: { value: 2200, message: 'Content must be under 2200 characters' }
          })}
          className="input-field min-h-[120px] resize-none"
          placeholder="Write your social media content..."
        />
        <div className="flex justify-between items-center mt-1">
          {errors.content && (
            <p className="text-error-500 text-sm">{errors.content.message}</p>
          )}
          <span className={`text-sm ml-auto ${content.length > 2000 ? 'text-error-500' : 'text-gray-500'}`}>
            {content.length}/2200
          </span>
        </div>
      </div>

      {/* Due Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Due Date *
        </label>
        <DateTimePicker
          value={watch('dueAt')}
          onChange={(date) => setValue('dueAt', date)}
        />
      </div>

      {/* Assignees */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Assign To
        </label>
        <UserSelect
          value={watch('assignees')}
          onChange={(assignees) => setValue('assignees', assignees)}
        />
      </div>

      {/* File Attachments */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Attachments (Max 4)
        </label>
        <FileUpload
          attachments={attachments}
          onChange={setAttachments}
          maxFiles={4}
          acceptedTypes={['image/jpeg', 'image/png', 'video/mp4', 'video/mov']}
        />
      </div>

      {/* Schedule Option */}
      <div className="border-t pt-6">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="schedule-later"
            onChange={(e) => {
              if (e.target.checked) {
                setValue('scheduledFor', new Date());
              } else {
                setValue('scheduledFor', null);
              }
            }}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <label htmlFor="schedule-later" className="text-sm font-medium text-gray-700">
            Schedule for later
          </label>
        </div>
        
        {watch('scheduledFor') && (
          <div className="mt-3">
            <DateTimePicker
              value={watch('scheduledFor')}
              onChange={(date) => setValue('scheduledFor', date)}
              minDate={new Date()}
            />
          </div>
        )}
      </div>

      {/* Submit Buttons */}
      <div className="flex space-x-3 pt-6 border-t">
        <button
          type="submit"
          className="btn-primary flex-1 sm:flex-none"
        >
          {initialData ? 'Update Task' : 'Create Task'}
        </button>
        <button
          type="button"
          onClick={() => handleFormSubmit({ ...watch(), status: 'draft' })}
          className="btn-outline flex-1 sm:flex-none"
        >
          Save as Draft
        </button>
      </div>
    </form>
  );
}
```

### Display Components

#### TaskCard.jsx
```javascript
// imports/ui/components/tasks/TaskCard.jsx
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  ClockIcon, 
  UserGroupIcon, 
  PhotoIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';

export function TaskCard({ task, onComplete, onEdit, showActions = true }) {
  const isOverdue = new Date(task.dueAt) < new Date() && task.status !== 'completed';
  const dueText = formatDistanceToNow(new Date(task.dueAt), { addSuffix: true });

  const handleComplete = () => {
    if (onComplete) {
      onComplete(task._id);
    }
  };

  return (
    <div className={`card hover:shadow-md transition-shadow ${isOverdue ? 'border-l-4 border-l-error-500' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">
            {task.title}
          </h3>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center">
              <ClockIcon className="h-4 w-4 mr-1" />
              {isOverdue ? (
                <span className="text-error-600 font-medium">
                  Overdue {dueText}
                </span>
              ) : (
                <span>Due {dueText}</span>
              )}
            </span>
            
            {task.assignees.length > 0 && (
              <span className="flex items-center">
                <UserGroupIcon className="h-4 w-4 mr-1" />
                {task.assignees.includes('all') ? 'Everyone' : `${task.assignees.length} assigned`}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Status Badge */}
          <span className={`status-badge-${task.status}`}>
            {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Content Preview */}
      <p className="text-gray-700 text-sm mb-4 line-clamp-3">
        {task.content}
      </p>

      {/* Attachments Preview */}
      {task.attachments && task.attachments.length > 0 && (
        <div className="flex items-center space-x-2 mb-4">
          <PhotoIcon className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-500">
            {task.attachments.length} attachment{task.attachments.length > 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex space-x-2">
            {task.status !== 'completed' && (
              <button
                onClick={handleComplete}
                className="flex items-center space-x-1 text-sm text-success-600 hover:text-success-700"
              >
                <CheckCircleIcon className="h-4 w-4" />
                <span>Mark Complete</span>
              </button>
            )}
          </div>
          
          {onEdit && (
            <button
              onClick={() => onEdit(task)}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              Edit
            </button>
          )}
        </div>
      )}
    </div>
  );
}
```

#### DashboardSummary.jsx
```javascript
// imports/ui/components/dashboard/DashboardSummary.jsx
import React from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { 
  ClockIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UsersIcon 
} from '@heroicons/react/24/outline';

export function DashboardSummary() {
  const summaryData = useTracker(() => {
    return new Promise((resolve) => {
      Meteor.call('dashboard.getSummary', (error, result) => {
        if (!error) resolve(result);
      });
    });
  });

  const cards = [
    {
      title: 'Pending Tasks',
      value: summaryData?.pendingTasks || 0,
      icon: ClockIcon,
      color: 'primary',
      description: 'Tasks awaiting completion'
    },
    {
      title: 'Overdue',
      value: summaryData?.overdueTasks || 0,
      icon: ExclamationTriangleIcon,
      color: 'error',
      description: 'Tasks past due date'
    },
    {
      title: 'Completed Today',
      value: summaryData?.completedToday || 0,
      icon: CheckCircleIcon,
      color: 'success',
      description: 'Tasks finished today'
    },
    {
      title: 'Active Clients',
      value: summaryData?.activeClients || 0,
      icon: UsersIcon,
      color: 'secondary',
      description: 'Connected clients'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.title} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {card.title}
                </p>
                <p className={`text-2xl font-bold text-${card.color}-600`}>
                  {card.value}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {card.description}
                </p>
              </div>
              <div className={`p-3 bg-${card.color}-100 rounded-lg`}>
                <Icon className={`h-6 w-6 text-${card.color}-600`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

### Utility Components

#### LoadingSpinner.jsx
```javascript
// imports/ui/components/ui/LoadingSpinner.jsx
import React from 'react';

export function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-primary-600 ${sizeClasses[size]} ${className}`} />
  );
}
```

#### EmptyState.jsx
```javascript
// imports/ui/components/ui/EmptyState.jsx
import React from 'react';

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action = null,
  className = '' 
}) {
  return (
    <div className={`text-center py-12 ${className}`}>
      {Icon && (
        <Icon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      )}
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-500 mb-6 max-w-sm mx-auto">
        {description}
      </p>
      {action}
    </div>
  );
}
```

## Mobile-Optimized Components

### MobileTaskCard.jsx
```javascript
// imports/ui/components/mobile/MobileTaskCard.jsx
import React from 'react';
import { formatDistanceToNow } from 'date-fns';

export function MobileTaskCard({ task, onComplete, onEdit }) {
  const isOverdue = new Date(task.dueAt) < new Date() && task.status !== 'completed';
  
  return (
    <div className={`bg-white rounded-lg p-4 shadow-sm border ${isOverdue ? 'border-l-4 border-l-error-500' : 'border-gray-200'} mb-4`}>
      {/* Header - Touch-friendly */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">
            {task.title}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Due {formatDistanceToNow(new Date(task.dueAt), { addSuffix: true })}
          </p>
        </div>
        <span className={`status-badge-${task.status} ml-2 flex-shrink-0`}>
          {task.status}
        </span>
      </div>

      {/* Content - Truncated for mobile */}
      <p className="text-sm text-gray-700 line-clamp-2 mb-3">
        {task.content}
      </p>

      {/* Actions - Large touch targets */}
      <div className="flex space-x-2">
        {task.status !== 'completed' && (
          <button
            onClick={() => onComplete(task._id)}
            className="flex-1 bg-success-500 text-white text-sm font-medium py-2 px-3 rounded-md"
          >
            Complete
          </button>
        )}
        <button
          onClick={() => onEdit(task)}
          className="flex-1 bg-primary-500 text-white text-sm font-medium py-2 px-3 rounded-md"
        >
          View
        </button>
      </div>
    </div>
  );
}
```

### FloatingActionButton.jsx
```javascript
// imports/ui/components/mobile/FloatingActionButton.jsx
import React from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';

export function FloatingActionButton({ onClick, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-6 right-6 bg-primary-500 hover:bg-primary-600 text-white p-4 rounded-full shadow-lg transition-colors z-50 ${className}`}
    >
      <PlusIcon className="h-6 w-6" />
    </button>
  );
}
```

## Responsive Patterns

### Mobile-First Media Query Examples
```css
/* Base mobile styles */
.task-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Tablet and up */
@media (min-width: 768px) {
  .task-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .task-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }
}

/* Touch-friendly interactive elements */
.touch-target {
  min-height: 44px;
  min-width: 44px;
}

/* Safe area handling for mobile devices */
.mobile-safe-area {
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

This component library provides a complete foundation for building your Social Media & Task Management PWA with consistent styling, mobile-first approach, and reusable patterns.
