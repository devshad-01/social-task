# 📋 Quick Reference & Cheat Sheet

## Essential GitHub Copilot Prompts

### 🚀 Quick Start Prompts
```
"Scaffold a new Meteor page component for task management with routing"
"Create a responsive dashboard using Tailwind and Flowbite components"
"Generate a mobile-first task creation form with validation"
"Build a social media account connection component with OAuth"
"Create a PWA service worker for offline task caching"
```

### 🎨 UI Component Prompts
```
"Design a modern task card with status badges and due date indicators"
"Create a floating action button for mobile task creation"
"Build a responsive navigation bar with user profile dropdown"
"Generate a file upload component with drag-and-drop for images/videos"
"Design a dashboard summary widget with client and task statistics"
```

### 🔐 Security & Auth Prompts
```
"Implement role-based route protection for admin and member users"
"Create user invitation system with email verification"
"Build secure password reset flow with token validation"
"Generate input sanitization utilities for XSS prevention"
"Implement rate limiting for API methods and subscriptions"
```

### 📱 Mobile & PWA Prompts
```
"Create install prompt for PWA with user-friendly onboarding"
"Build offline detection with sync indicators"
"Generate background sync for offline task updates"
"Create push notification setup for task assignments"
"Design mobile-optimized layouts with touch-friendly interactions"
```

## File Structure Reference

```
posty/
├── .github/copilot/           # 🤖 Copilot instructions
│   ├── instructions.md        # Main project guide
│   ├── schemas.md            # Database schemas & methods
│   ├── components.md         # UI component library
│   ├── auth-security.md      # Authentication patterns
│   ├── social-api.md         # Facebook/Instagram integration
│   ├── pwa-offline.md        # PWA & offline support
│   ├── workflows.md          # Development workflows
│   └── quick-reference.md    # This file
├── client/
│   ├── main.jsx              # React entry point
│   └── main.css              # Tailwind + @theme + Flowbite
├── imports/
│   ├── api/
│   │   ├── users/            # User management
│   │   ├── clients/          # Client management
│   │   ├── tasks/            # Task system
│   │   └── social/           # Facebook/Instagram APIs
│   ├── ui/
│   │   ├── components/       # Reusable components
│   │   ├── pages/            # Route components
│   │   ├── hooks/            # Custom React hooks
│   │   └── App.jsx           # Main app component
│   └── startup/              # App initialization
├── server/
│   └── main.js               # Meteor server entry
├── public/
│   ├── manifest.json         # PWA manifest
│   ├── sw.js                 # Service worker
│   └── icons/                # PWA icons
└── tests/                    # Test files
```

## Key Collections & Schemas

### User Schema
```javascript
{
  emails: [{address: String, verified: Boolean}],
  roles: ['admin', 'member'],
  profile: {name: String, avatarUrl: String},
  isActive: Boolean
}
```

### Client Schema
```javascript
{
  name: String,
  logo: String,
  contactEmail: String,
  socialAccounts: [{
    platform: 'facebook' | 'instagram',
    accountId: String,
    accessToken: String, // encrypted
    isConnected: Boolean
  }]
}
```

### Task Schema
```javascript
{
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
  status: 'draft' | 'scheduled' | 'completed'
}
```

## Essential Tailwind Classes

### Layout & Spacing
```css
/* Containers */
.container mx-auto px-4     /* Responsive container */
.min-h-screen              /* Full height */
.flex items-center justify-center  /* Center content */

/* Grid */
.grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  /* Responsive grid */
.space-y-4                 /* Vertical spacing */
.space-x-2                 /* Horizontal spacing */

/* Flexbox */
.flex flex-col sm:flex-row /* Responsive direction */
.flex-1                    /* Flex grow */
.flex-shrink-0             /* No shrink */
```

### Theme Colors (from @theme)
```css
/* Primary brand colors */
bg-primary-50              /* Light background */
bg-primary-500             /* Main brand color */
bg-primary-900             /* Dark accent */
text-primary-500           /* Main text */
border-primary-300         /* Borders */

/* Status colors */
bg-success-500 text-success-50    /* Success states */
bg-warning-500 text-warning-50    /* Warning states */
bg-error-500 text-error-50        /* Error states */
```

### Interactive Elements
```css
/* Buttons */
.btn-primary               /* Primary button style */
.btn-secondary             /* Secondary button style */
.btn-outline               /* Outline button style */

/* Forms */
.input-field               /* Standard input styling */
focus:ring-2 focus:ring-primary-500  /* Focus states */

/* Cards */
.card                      /* Standard card styling */
hover:shadow-md transition-shadow    /* Hover effects */
```

## Common Meteor Patterns

### Publications
```javascript
// Role-based data access
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

### Methods
```javascript
// Secure method pattern
Meteor.methods({
  'tasks.create'(taskData) {
    check(taskData, TaskSchema);
    
    if (!Roles.userIsInRole(this.userId, 'admin')) {
      throw new Meteor.Error('access-denied');
    }
    
    return Tasks.insert({
      ...taskData,
      createdAt: new Date(),
      createdBy: this.userId
    });
  }
});
```

### React Hooks
```javascript
// Reactive data with useTracker
const { tasks, loading } = useTracker(() => {
  const handle = Meteor.subscribe('tasks.assigned');
  return {
    tasks: Tasks.find({}, {sort: {dueAt: 1}}).fetch(),
    loading: !handle.ready()
  };
}, []);
```

## Social Media API Quick Reference

### Facebook Graph API
```javascript
// Get user pages
GET /me/accounts?access_token={token}

// Publish post
POST /{page-id}/feed
{
  message: "Content",
  access_token: "{token}"
}

// Upload photo
POST /{page-id}/photos
{
  url: "https://image-url.jpg",
  caption: "Caption",
  access_token: "{token}"
}
```

### Instagram Business API
```javascript
// Create media container
POST /{ig-user-id}/media
{
  image_url: "https://image-url.jpg",
  caption: "Caption",
  access_token: "{token}"
}

// Publish media
POST /{ig-user-id}/media_publish
{
  creation_id: "{container-id}",
  access_token: "{token}"
}
```

## PWA Essential Features

### Service Worker Strategies
```javascript
// Network first (for API calls)
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    return caches.match(request);
  }
}

// Cache first (for static assets)
async function cacheFirst(request) {
  const cached = await caches.match(request);
  return cached || fetch(request);
}
```

### Install Prompt
```javascript
// Listen for install prompt
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  showInstallButton();
});

// Trigger install
deferredPrompt.prompt();
const choice = await deferredPrompt.userChoice;
```

## Debugging & Development

### Console Commands
```javascript
// Meteor console helpers
meteor mongo                    // MongoDB shell
meteor reset                    // Reset database
meteor --settings settings.json // Use settings file

// Client debugging
Meteor.userId()                 // Current user ID
Meteor.user()                   // Current user object
Tasks.find().fetch()            // Get all tasks
```

### Browser DevTools
```javascript
// React DevTools
// Install: https://chrome.google.com/webstore/detail/react-developer-tools

// PWA DevTools
// Application > Service Workers
// Application > Manifest
// Lighthouse > PWA audit
```

## Performance Optimization

### Bundle Analysis
```javascript
// Analyze bundle size
meteor build --analyze

// Code splitting
const LazyComponent = lazy(() => import('./Component'));

// Image optimization
loading="lazy"              // Lazy load images
sizes="(max-width: 768px) 100vw, 50vw"  // Responsive images
```

### Database Optimization
```javascript
// Create indexes
Tasks.createIndex({assignees: 1, dueAt: 1});
Clients.createIndex({isActive: 1});

// Limit query results
Tasks.find({}, {limit: 20, sort: {dueAt: 1}})

// Use specific field selection
Tasks.find({}, {fields: {title: 1, dueAt: 1}})
```

## Testing Commands

```bash
# Run all tests
meteor test --driver-package meteortesting:mocha

# Run specific test file
meteor test --driver-package meteortesting:mocha --grep "Tasks"

# Client tests only
meteor test --driver-package meteortesting:mocha --client-only

# Server tests only
meteor test --driver-package meteortesting:mocha --server-only
```

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Bundle size < 500KB
- [ ] Lighthouse PWA score > 90
- [ ] Error boundaries implemented
- [ ] Security headers configured
- [ ] Environment variables set

### Production Commands
```bash
# Build for production
meteor build ../build --architecture os.linux.x86_64

# Deploy to Galaxy
DEPLOY_HOSTNAME=galaxy.meteor.com meteor deploy your-app.meteorapp.com --settings settings-production.json

# Deploy to custom server
cd ../build && tar -xf your-app.tar.gz
cd bundle && npm install
MONGO_URL=... ROOT_URL=... node main.js
```

---

## 💡 Pro Tips

1. **Always start mobile-first** - Use `sm:`, `md:`, `lg:` prefixes
2. **Use semantic HTML** - Screen readers and SEO benefit
3. **Implement error boundaries** - Graceful failure handling
4. **Cache strategically** - Network first for data, cache first for assets
5. **Validate inputs** - Client and server-side validation
6. **Test offline** - PWA should work without connection
7. **Monitor bundle size** - Keep under 500KB for good performance
8. **Use TypeScript** - Better developer experience and fewer bugs

Keep this reference handy for quick lookups during development!
