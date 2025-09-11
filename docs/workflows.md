# 🚀 Meteor 3.0 Social Media & Task Management PWA - Development Workflow

## Project Overview - MVP Scope
This is a **mobile-first PWA** for agencies to manage social media tasks across Facebook/Instagram accounts with team collaboration.

### Core MVP Features
- **User Management**: Admin (supervisor) + Team Member roles
- **Client Management**: Add/edit client companies with social account connections
- **Task System**: Create, assign, and complete social media posting tasks
- **PWA**: Offline viewing, push notifications, mobile installation
- **Social Integration**: Facebook Pages & Instagram Business accounts only

## Quick Start Commands

### Development Setup (Meteor 3.0)
```bash
# Install dependencies
meteor npm install

# Start development server with settings
meteor --settings settings-development.json

# Run tests with async support
meteor test --driver-package meteortesting:mocha

# Build for production
meteor build ../build --architecture os.linux.x86_64

# Deploy to Galaxy
DEPLOY_HOSTNAME=galaxy.meteor.com meteor deploy your-app.meteorapp.com --settings settings-production.json
```

### Git Workflow
```bash
# Feature development
git checkout -b feature/task-creation-form
git add .
git commit -m "feat: add task creation form with validation"
git push origin feature/task-creation-form

# Create PR, merge, cleanup
git checkout main
git pull origin main
git branch -d feature/task-creation-form
```

## GitHub Copilot Prompts for MVP Development

### 🎯 Mobile-First Component Prompts (Design System Compliant)

**Core MVP Components:**
- `"Create a mobile-first task creation form using our design system with 45-second completion target and consistent spacing"`
- `"Generate a team dashboard showing today's tasks with priority sorting using .task-card and .mobile-card-grid classes"`
- `"Build a client company card component with Facebook/Instagram connection status using .task-card-elevated and platform indicators"`
- `"Create a task card optimized for mobile with attachment previews using our .tag-work/.tag-business category system"`

**Advanced MVP Components:**
- `"Create a social account connection flow for Facebook Pages using .btn-primary and .input-base from our design system"`
- `"Generate a PWA install prompt using .btn-primary and consistent mobile-container layout"`
- `"Build an offline task viewer with cached data using .mobile-stack and .progress-circular components"`
- `"Create push notification setup using our design system's color palette and spacing scale"`

### 🔐 Meteor 3.0 Authentication Prompts

- `"Create async login flow with role-based redirects using .btn-primary and .input-base styling for Admin vs Team Member users"`
- `"Generate user invitation system using Meteor 3.0 async methods with .mobile-container layout and consistent form styling"`
- `"Build role-based route protection using alanning:roles with async user checks and .status-* indicator classes"`

### 📱 PWA & Mobile-First Prompts (Design System)

- `"Create service worker for offline task caching with 2-second load target using .progress-linear feedback"`
- `"Generate mobile navigation using .bottom-nav and .nav-item classes optimized for thumb reach and one-handed use"`
- `"Build responsive task assignment flow with max 3 taps using .btn-primary and .mobile-card-grid layout"`
- `"Create PWA manifest for agency task management using our primary color (#6366F1) and proper spacing"`

### 🔗 Social Media API Prompts (MVP Focus)

- `"Create async Meteor method for Facebook Page connection using Graph API v18 with .platform-facebook status indicators"`
- `"Generate Instagram Business account integration with .platform-instagram styling and .status-error handling for expired tokens"`
- `"Build Facebook token refresh system using async/await patterns with .progress-circular loading states"`
- `"Create social account status checker using .tag-* components and consistent error messaging"`

### 📊 MVP Data & Performance Prompts

- `"Create optimized Meteor publications for mobile dashboard with role-based filtering using .mobile-container layout"`
- `"Generate async task creation methods with GridFS file upload using .btn-primary and .progress-linear feedback"`
- `"Build client management system with archive functionality using .task-card components and .status-* indicators"`
- `"Create dashboard aggregations for task counts using .h2/.h3 typography and .mobile-section spacing"`

## Meteor 3.0 Code Quality Standards

### Async Method Structure (Meteor 3.0 Pattern)
```javascript
// ✅ Good: Meteor 3.0 async method with proper error handling
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Roles } from 'meteor/alanning:roles';

Meteor.methods({
  async 'tasks.create'(taskData) {
    // 1. Validate inputs
    check(taskData, TaskCreateSchema);
    
    // 2. Check authentication
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'Must be logged in');
    }
    
    // 3. Check permissions (MVP: only admins create tasks)
    if (!Roles.userIsInRole(this.userId, 'admin')) {
      throw new Meteor.Error('access-denied', 'Admin role required');
    }
    
    // 4. Sanitize data for security
    taskData.content = sanitizeInput.html(taskData.content);
    
    // 5. Async business logic
    try {
      const taskId = await Tasks.insertAsync({
        ...taskData,
        createdAt: new Date(),
        createdBy: this.userId,
        status: 'draft'
      });
      
      // 6. Send notifications to assignees (MVP requirement)
      if (taskData.assignees.length > 0) {
        await Meteor.callAsync('notifications.sendTaskAssignment', taskId);
      }
      
      return taskId;
    } catch (error) {
      throw new Meteor.Error('task-creation-failed', error.message);
    }
  }
});
```

### Mobile-First Component Structure (Design System)
```javascript
// ✅ Good: Mobile-optimized component using design system
import React, { useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Tasks } from '/imports/api/tasks/tasks';

export function MobileTaskList({ userId }) {
  const [isLoading, setIsLoading] = useState(false);
  
  const { tasks, loading } = useTracker(() => {
    // MVP: Optimized subscription for mobile performance
    const handle = Meteor.subscribe('tasks.assignedToday', {
      userId: userId,
      limit: 20 // Performance: limit for mobile
    });
    
    return {
      tasks: Tasks.find(
        {}, 
        { 
          sort: { dueAt: 1 }, // Priority sorting requirement
          limit: 20 
        }
      ).fetch(),
      loading: !handle.ready()
    };
  }, [userId]);

  // MVP: 2-second load requirement
  if (loading) return <div className="progress-circular mx-auto" />;

  return (
    <div className="mobile-container">
      <div className="mobile-section">
        <h2 className="h2 mb-6">Today's Tasks</h2>
        <div className="mobile-card-grid">
          {tasks.map(task => (
            <MobileTaskCard 
              key={task._id} 
              task={task}
              className="task-card focus-ring"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Design System CSS Standards
```css
/* ✅ Good: Use design system classes and custom properties */
.custom-task-priority {
  background: var(--color-primary-500);
  color: var(--color-white);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-lg);
  font-size: 14px;
  font-weight: 500;
  transition: all var(--duration-fast) var(--easing-out);
}

.custom-status-indicator {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  font-size: 12px;
  font-weight: 500;
}

/* ✅ Use predefined design system classes */
.task-container {
  @apply mobile-container mobile-section;
}

.task-card-custom {
  @apply task-card hover:shadow-lg;
}

.primary-button {
  @apply btn-primary;
}

/* ❌ Avoid: Don't create inconsistent spacing/colors */
.bad-spacing {
  padding: 15px; /* Use design system spacing instead */
  background: #blue; /* Use design system colors */
}
```

### Component Props & Styling Pattern
```javascript
// ✅ Good: Component with design system integration
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
        
        <button 
          onClick={() => onComplete(task._id)}
          className="btn-primary"
        >
          Complete
        </button>
      </div>
    </div>
  );
}
```

## MVP Testing Patterns

### Async Method Tests (Meteor 3.0)
```javascript
// tests/api/tasks.tests.js
import { assert } from 'chai';
import { Tasks } from '/imports/api/tasks/tasks';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import '/imports/api/tasks/methods';

describe('MVP Task Methods', function() {
  beforeEach(async function() {
    await resetDatabase();
  });

  it('should create task with valid data (Admin only)', async function() {
    // MVP: Test admin-only task creation
    const userId = await Accounts.createUserAsync({
      email: 'admin@test.com',
      password: 'password123'
    });
    
    Roles.addUsersToRoles(userId, ['admin']);
    
    const taskData = {
      title: 'Test Social Post',
      content: 'Test content for Facebook post',
      dueAt: new Date(),
      clientId: 'test-client-id',
      assignees: ['user1'],
      socialAccounts: ['facebook-page-123']
    };

    // Test async method
    const taskId = await Meteor.callAsync('tasks.create', taskData);
    assert.isString(taskId);
    
    const task = await Tasks.findOneAsync(taskId);
    assert.equal(task.title, taskData.title);
    assert.equal(task.status, 'draft'); // MVP default status
  });

  it('should reject task creation for team members', async function() {
    const userId = await Accounts.createUserAsync({
      email: 'member@test.com',
      password: 'password123'
    });
    
    Roles.addUsersToRoles(userId, ['member']);
    
    try {
      await Meteor.callAsync('tasks.create', {
        title: 'Unauthorized task',
        content: 'Should fail'
      });
      assert.fail('Should have thrown access denied error');
    } catch (error) {
      assert.equal(error.error, 'access-denied');
    }
  });

  it('should validate content length (MVP: 2200 char limit)', async function() {
    const longContent = 'a'.repeat(2201); // Over limit
    
    try {
      await Meteor.callAsync('tasks.create', {
        title: 'Test',
        content: longContent
      });
      assert.fail('Should have thrown validation error');
    } catch (error) {
      assert.include(error.message, 'content too long');
    }
  });
});
```

### Mobile Component Tests
```javascript
// tests/ui/MobileTaskCard.tests.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MobileTaskCard } from '/imports/ui/components/tasks/MobileTaskCard';

describe('MVP Mobile Task Card', function() {
  const mockTask = {
    _id: 'test-id',
    title: 'Test Social Media Post',
    content: 'Post to Facebook page about product launch',
    dueAt: new Date(),
    status: 'draft',
    assignees: ['user123'],
    socialAccounts: ['facebook-page-123'],
    attachments: [
      { type: 'image', url: '/test-image.jpg' }
    ]
  };

  it('renders task with touch-friendly design', function() {
    render(<MobileTaskCard task={mockTask} />);
    
    const card = screen.getByRole('button');
    // MVP: Touch target minimum 44px height
    expect(card).toHaveStyle('min-height: 44px');
    
    expect(screen.getByText('Test Social Media Post')).toBeInTheDocument();
    expect(screen.getByText(/Facebook/)).toBeInTheDocument();
  });

  it('shows attachment count for mobile', function() {
    render(<MobileTaskCard task={mockTask} />);
    expect(screen.getByText('1 attachment')).toBeInTheDocument();
  });

  it('handles task completion tap (MVP: max 3 taps)', function() {
    const onComplete = jest.fn();
    render(<MobileTaskCard task={mockTask} onComplete={onComplete} />);
    
    // MVP requirement: Easy task completion
    const completeButton = screen.getByText('Mark Complete');
    fireEvent.click(completeButton);
    
    expect(onComplete).toHaveBeenCalledWith(mockTask._id);
  });

  it('shows overdue status prominently on mobile', function() {
    const overdueTask = {
      ...mockTask,
      dueAt: new Date(Date.now() - 86400000) // Yesterday
    };
    
    render(<MobileTaskCard task={overdueTask} />);
    
    // MVP: Clear visual indicators for mobile users
    const overdueIndicator = screen.getByText(/overdue/i);
    expect(overdueIndicator).toHaveClass('text-red-600'); // Prominent color
  });
});
```

## Performance Optimization

### Code Splitting
```javascript
// imports/ui/pages/TasksPage.jsx
import { lazy, Suspense } from 'react';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

// Lazy load heavy components
const TaskForm = lazy(() => import('../components/forms/TaskForm'));
const TaskAnalytics = lazy(() => import('../components/analytics/TaskAnalytics'));

export function TasksPage() {
  return (
    <div>
      <Suspense fallback={<LoadingSpinner />}>
        <TaskForm />
      </Suspense>
      
      <Suspense fallback={<LoadingSpinner />}>
        <TaskAnalytics />
      </Suspense>
    </div>
  );
}
```

### Optimized Subscriptions
```javascript
// Use specific subscriptions instead of broad ones
const { tasks } = useTracker(() => {
  // ❌ Bad: Subscribe to all tasks
  // const handle = Meteor.subscribe('tasks.all');
  
  // ✅ Good: Subscribe to specific data needed
  const handle = Meteor.subscribe('tasks.dashboard', {
    limit: 10,
    status: ['draft', 'scheduled']
  });
  
  return {
    tasks: Tasks.find({}, { 
      sort: { dueAt: 1 },
      limit: 10 
    }).fetch(),
    loading: !handle.ready()
  };
});
```

### Image Optimization
```javascript
// imports/ui/components/media/OptimizedImage.jsx
import React, { useState } from 'react';

export function OptimizedImage({ src, alt, className, sizes }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={`relative ${className}`}>
      {!isLoaded && !error && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
      
      <img
        src={src}
        alt={alt}
        className={`transition-opacity duration-200 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={() => setError(true)}
        sizes={sizes}
      />
      
      {error && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center rounded">
          <span className="text-gray-400 text-sm">Failed to load</span>
        </div>
      )}
    </div>
  );
}
```

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Bundle size under 500KB
- [ ] Lighthouse PWA score > 90
- [ ] Security headers configured
- [ ] Environment variables set
- [ ] Database indexes created
- [ ] Error monitoring configured

### Production Settings
```javascript
// settings-production.json
{
  "public": {
    "facebookAppId": "your-production-fb-app-id",
    "vapid": {
      "publicKey": "your-vapid-public-key"
    }
  },
  "private": {
    "facebookAppSecret": "your-fb-app-secret",
    "encryptionKey": "your-32-char-encryption-key",
    "vapid": {
      "privateKey": "your-vapid-private-key"
    }
  }
}
```

### Monitoring & Analytics
```javascript
// client/lib/analytics.js
export const trackEvent = (eventName, properties = {}) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', eventName, properties);
  }
  
  // Also track in console for development
  if (Meteor.isDevelopment) {
    console.log('Event:', eventName, properties);
  }
};

// Usage in components
trackEvent('task_created', {
  clientId: task.clientId,
  hasAttachments: task.attachments.length > 0
});
```

## Error Handling Patterns

### Global Error Boundary
```javascript
// imports/ui/components/ErrorBoundary.jsx
import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Send to error reporting service
    if (Meteor.isProduction) {
      // Sentry, LogRocket, etc.
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Something went wrong
            </h2>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Async Error Handling
```javascript
// imports/ui/hooks/useAsyncOperation.js
import { useState } from 'react';

export function useAsyncOperation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async (operation) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await operation();
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  return { loading, error, execute };
}

// Usage
const { loading, error, execute } = useAsyncOperation();

const handleSubmit = async (data) => {
  try {
    await execute(() => 
      new Promise((resolve, reject) => {
        Meteor.call('tasks.create', data, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        });
      })
    );
    // Success handling
  } catch (error) {
    // Error is already set in state
  }
};
```

This workflow guide provides everything needed for efficient development, quality assurance, and successful deployment of your Social Media & Task Management PWA.
