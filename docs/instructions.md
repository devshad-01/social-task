# 🤖 GitHub Copilot Instructions for Social Media & Task Management PWA

## 🎯 Project Context
This is a **MeteorJS Social Media & Task Management PWA** built on a Meteor + JSX + Tailwind CSS 4.1 + Flowbite boilerplate.

### Core Tech Stack
- **Backend**: Meteor 3.0 with MongoDB
- **Frontend**: React 18 + JSX
- **Styling**: Tailwind CSS 4.1 with `@theme` variables + Flowbite components
- **State**: Meteor's reactive data system
- **Auth**: accounts-password + alanning:roles
- **PWA**: Meteor PWA package
- **File Uploads**: ostrio:files

## 🏗️ Architecture Patterns

### 1. Project Structure
```
posty/
├── .meteor/                 # Meteor configuration
├── client/
│   ├── main.jsx            # React entry point
│   └── main.css            # Tailwind + @theme + Flowbite
├── imports/
│   ├── api/                # Collections & Methods
│   │   ├── users/          # User management
│   │   ├── clients/        # Client management  
│   │   └── tasks/          # Task system
│   ├── ui/                 # React components
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Route components
│   │   └── App.jsx         # Main app component
│   └── startup/            # App initialization
├── server/
│   └── main.js             # Meteor server entry
├── public/                 # Static assets
├── tests/                  # Test files
└── package.json            # Dependencies
```

### 2. User Roles & Permissions
- **Admin**: Full CRUD on users, clients, tasks. Can invite members, assign tasks
- **Member**: View assigned tasks, edit own profile, mark tasks complete

### 3. Core Schemas

#### User Schema
```javascript
{
  _id: String,
  emails: [{address: String, verified: Boolean}],
  roles: ['admin', 'member'],
  profile: {
    name: String,
    avatarUrl: String
  },
  isActive: Boolean,
  createdAt: Date
}
```

#### Client Schema  
```javascript
{
  _id: String,
  name: String,
  logo: String,
  contactEmail: String,
  socialAccounts: [{
    platform: 'facebook' | 'instagram',
    accountId: String,
    accessToken: String, // encrypted
    isConnected: Boolean
  }],
  createdAt: Date,
  createdBy: String
}
```

#### Task Schema
```javascript
{
  _id: String,
  title: String, // max 100 chars
  content: String, // max 2200 chars
  dueAt: Date,
  clientId: String,
  assignees: [String], // user IDs or "all"
  attachments: [{
    type: 'image' | 'video',
    url: String,
    thumbnail: String
  }], // max 4 items
  status: 'draft' | 'scheduled' | 'completed',
  createdAt: Date,
  createdBy: String
}
```

## 🎨 UI Guidelines

### Tailwind Theme Variables (use these consistently)
```css
/* Primary colors */
bg-primary-50   /* Light backgrounds */
bg-primary-500  /* Main brand color */
bg-primary-900  /* Dark accents */
text-primary-50 /* Light text */
text-primary-500 /* Main text */
text-primary-900 /* Dark text */

/* Fonts */
font-sans       /* Inter font family */
font-body       /* Body text */
font-mono       /* Code/monospace */
```

### Flowbite Components (prefer these over custom)
- Use `btn-primary`, `btn-secondary` for buttons
- Use Flowbite form components for inputs
- Use Flowbite modals, dropdowns, cards
- Reference: https://flowbite.com/docs/components/

### Mobile-First Design
- Always start with mobile layout (`w-full`, `flex-col`)
- Use responsive prefixes: `sm:`, `md:`, `lg:`
- Touch-friendly buttons: minimum 44px height
- Consider thumb reach on mobile

## 🔄 Meteor Patterns

### Collections & Publications
```javascript
// Always define collections in imports/api/
import { Mongo } from 'meteor/mongo';
export const Tasks = new Mongo.Collection('tasks');

// Publications should filter by user role
Meteor.publish('tasks.assigned', function() {
  if (!this.userId) return this.ready();
  
  if (Roles.userIsInRole(this.userId, 'admin')) {
    return Tasks.find();
  } else {
    return Tasks.find({
      $or: [
        {assignees: this.userId},
        {assignees: "all"}
      ]
    });
  }
});
```

### Methods (use for mutations)
```javascript
Meteor.methods({
  'tasks.create'(taskData) {
    check(taskData, TaskSchema);
    
    if (!Roles.userIsInRole(this.userId, 'admin')) {
      throw new Meteor.Error('unauthorized');
    }
    
    return Tasks.insert({
      ...taskData,
      createdAt: new Date(),
      createdBy: this.userId
    });
  }
});
```

### React Hooks (use Meteor's useTracker)
```javascript
import { useTracker } from 'meteor/react-meteor-data';

export function TaskList() {
  const { tasks, loading } = useTracker(() => {
    const handle = Meteor.subscribe('tasks.assigned');
    return {
      tasks: Tasks.find({}, {sort: {dueAt: 1}}).fetch(),
      loading: !handle.ready()
    };
  }, []);
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div className="space-y-4">
      {tasks.map(task => <TaskCard key={task._id} task={task} />)}
    </div>
  );
}
```

## 📱 PWA Requirements

### Service Worker Strategy
- Cache static assets (CSS, JS, images)
- Cache API calls for offline viewing
- Background sync for task updates
- Push notifications for assignments

### Performance Targets
- Time to Interactive: < 3s on 3G
- Bundle size: < 500KB
- Lighthouse PWA score: > 90

## 🔐 Security Guidelines

### Authentication Flow
```javascript
// Always check user roles
if (!Roles.userIsInRole(Meteor.userId(), 'admin')) {
  throw new Meteor.Error('access-denied');
}

// Validate inputs
import SimpleSchema from 'simpl-schema';
check(data, new SimpleSchema({
  title: {type: String, max: 100},
  content: {type: String, max: 2200}
}));
```

### File Upload Security
- Validate file types: JPG, PNG, MP4, MOV only
- Max size: 5MB per file
- Scan for malware (if possible)
- Store in secure location (S3/GridFS)

## 🧪 Testing Patterns

### Unit Tests (use Mocha)
```javascript
import { assert } from 'chai';
import { Tasks } from './tasks.js';

describe('Tasks', function() {
  it('should validate required fields', function() {
    assert.throws(() => {
      Tasks.insert({});
    }, /title is required/);
  });
});
```

### Integration Tests
- Test complete user flows
- Mock Facebook API calls
- Test offline scenarios
- Validate role-based access

## 🚀 Development Workflow

### 1. Feature Development
1. Create branch: `feature/task-creation`
2. Write failing tests first
3. Implement feature using patterns above
4. Ensure mobile responsiveness
5. Test offline functionality
6. Create PR with description

### 2. Code Review Checklist
- [ ] Follows Meteor patterns
- [ ] Uses Tailwind theme variables
- [ ] Mobile-responsive design
- [ ] Role-based security implemented
- [ ] Tests passing
- [ ] PWA requirements met

### 3. Deployment
- [ ] All tests pass
- [ ] Bundle size under limit
- [ ] Lighthouse score > 90
- [ ] Works offline
- [ ] Facebook integration tested

## 🔧 Common Tasks

### Adding New Page
```javascript
// 1. Create component in imports/ui/pages/
export function NewPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-sans text-primary-900 mb-6">
        New Page
      </h1>
    </div>
  );
}

// 2. Add route in App.jsx
import { Routes, Route } from 'react-router-dom';
<Route path="/new" element={<NewPage />} />
```

### Creating Form Component
```javascript
import { useForm } from 'react-hook-form';

export function TaskForm({ onSubmit }) {
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-sans text-primary-700 mb-2">
          Title
        </label>
        <input
          {...register('title', { required: true, maxLength: 100 })}
          className="w-full border border-primary-300 focus:ring-primary-500 px-3 py-2 rounded"
        />
        {errors.title && (
          <span className="text-red-500 text-sm">Title is required</span>
        )}
      </div>
      
      <button
        type="submit"
        className="btn-primary w-full sm:w-auto"
      >
        Create Task
      </button>
    </form>
  );
}
```

## 📚 Key Dependencies Reference

### Essential Meteor Packages
```bash
meteor add accounts-password    # User authentication
meteor add alanning:roles      # Role-based permissions  
meteor add ostrio:files        # File uploads
meteor add pwa                 # Progressive Web App
```

### NPM Packages
```bash
npm install react-router-dom   # Client routing
npm install react-hook-form    # Form handling
npm install @heroicons/react   # Icons
npm install flowbite          # UI components
```

## 🎯 MVP Priorities

### Phase 1 (Week 1-2): Foundation
1. User authentication & roles
2. Basic task CRUD operations
3. Mobile-first UI skeleton
4. Client management basics

### Phase 2 (Week 3-4): Core Features  
1. Facebook API integration
2. File upload system
3. Task assignment workflow
4. PWA configuration

### Phase 3 (Week 5): Polish
1. Offline support
2. Push notifications  
3. Performance optimization
4. Error handling & validation

---

## 💡 Copilot Prompts for Common Tasks

Use these prompts to quickly generate code:

**"Create a Meteor method for task creation with validation"**
**"Generate a mobile-responsive task card component using Flowbite"** 
**"Write a React hook for Facebook API token management"**
**"Create a PWA service worker for offline task caching"**
**"Generate role-based route protection for admin pages"**

Remember: This project prioritizes mobile experience, role-based security, and offline capability. Always consider these factors in your implementations!
