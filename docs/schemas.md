# 🗂️ Collection Schemas & API Methods

## User Collection

### Schema Definition
```javascript
// imports/api/users/users.js
import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';

// Extend default user schema
Meteor.users.attachSchema(new SimpleSchema({
  emails: {
    type: Array,
    optional: true
  },
  'emails.$': {
    type: Object
  },
  'emails.$.address': {
    type: String,
    regEx: SimpleSchema.RegEx.Email
  },
  'emails.$.verified': {
    type: Boolean
  },
  roles: {
    type: Array,
    optional: true
  },
  'roles.$': {
    type: String,
    allowedValues: ['admin', 'member']
  },
  profile: {
    type: Object,
    optional: true
  },
  'profile.name': {
    type: String,
    max: 100
  },
  'profile.avatarUrl': {
    type: String,
    optional: true,
    regEx: SimpleSchema.RegEx.Url
  },
  isActive: {
    type: Boolean,
    defaultValue: true
  },
  createdAt: {
    type: Date,
    autoValue: function() {
      if (this.isInsert) return new Date();
    }
  }
}));
```

### Publications
```javascript
// imports/api/users/publications.js
Meteor.publish('users.all', function() {
  if (!Roles.userIsInRole(this.userId, 'admin')) {
    return this.ready();
  }
  
  return Meteor.users.find(
    { isActive: true },
    { 
      fields: { 
        emails: 1, 
        profile: 1, 
        roles: 1, 
        isActive: 1,
        createdAt: 1
      } 
    }
  );
});

Meteor.publish('users.current', function() {
  if (!this.userId) return this.ready();
  
  return Meteor.users.find(
    { _id: this.userId },
    { fields: { emails: 1, profile: 1, roles: 1 } }
  );
});
```

### Methods
```javascript
// imports/api/users/methods.js
Meteor.methods({
  'users.invite'(email, role = 'member') {
    check(email, String);
    check(role, Match.OneOf('admin', 'member'));
    
    if (!Roles.userIsInRole(this.userId, 'admin')) {
      throw new Meteor.Error('access-denied', 'Admin access required');
    }
    
    // Create user account
    const userId = Accounts.createUser({
      email: email,
      password: Random.id(8) // Temporary password
    });
    
    // Assign role
    Roles.addUsersToRoles(userId, [role]);
    
    // Send invitation email
    Accounts.sendEnrollmentEmail(userId);
    
    return userId;
  },
  
  'users.deactivate'(userId) {
    check(userId, String);
    
    if (!Roles.userIsInRole(this.userId, 'admin')) {
      throw new Meteor.Error('access-denied');
    }
    
    return Meteor.users.update(userId, {
      $set: { isActive: false }
    });
  },
  
  'users.updateProfile'(profileData) {
    check(profileData, {
      name: String,
      avatarUrl: Match.Optional(String)
    });
    
    return Meteor.users.update(this.userId, {
      $set: { 
        'profile.name': profileData.name,
        'profile.avatarUrl': profileData.avatarUrl 
      }
    });
  }
});
```

## Client Collection

### Schema Definition
```javascript
// imports/api/clients/clients.js
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const Clients = new Mongo.Collection('clients');

const SocialAccountSchema = new SimpleSchema({
  platform: {
    type: String,
    allowedValues: ['facebook', 'instagram']
  },
  accountId: {
    type: String // Facebook Page ID or Instagram Business Account ID
  },
  accessToken: {
    type: String // Encrypted token
  },
  isConnected: {
    type: Boolean,
    defaultValue: false
  },
  lastChecked: {
    type: Date,
    optional: true
  }
});

Clients.attachSchema(new SimpleSchema({
  name: {
    type: String,
    max: 100
  },
  logo: {
    type: String,
    optional: true,
    regEx: SimpleSchema.RegEx.Url
  },
  contactEmail: {
    type: String,
    regEx: SimpleSchema.RegEx.Email
  },
  socialAccounts: {
    type: Array,
    optional: true,
    maxCount: 10
  },
  'socialAccounts.$': SocialAccountSchema,
  isActive: {
    type: Boolean,
    defaultValue: true
  },
  createdAt: {
    type: Date,
    autoValue: function() {
      if (this.isInsert) return new Date();
    }
  },
  createdBy: {
    type: String,
    autoValue: function() {
      if (this.isInsert) return this.userId;
    }
  }
}));
```

### Publications
```javascript
// imports/api/clients/publications.js
Meteor.publish('clients.active', function() {
  if (!this.userId) return this.ready();
  
  return Clients.find(
    { isActive: true },
    { sort: { name: 1 } }
  );
});

Meteor.publish('clients.detail', function(clientId) {
  check(clientId, String);
  
  if (!this.userId) return this.ready();
  
  return Clients.find({ _id: clientId, isActive: true });
});
```

### Methods
```javascript
// imports/api/clients/methods.js
Meteor.methods({
  'clients.create'(clientData) {
    check(clientData, {
      name: String,
      contactEmail: String,
      logo: Match.Optional(String)
    });
    
    if (!Roles.userIsInRole(this.userId, 'admin')) {
      throw new Meteor.Error('access-denied');
    }
    
    return Clients.insert({
      name: clientData.name,
      contactEmail: clientData.contactEmail,
      logo: clientData.logo,
      socialAccounts: []
    });
  },
  
  'clients.connectSocial'(clientId, socialData) {
    check(clientId, String);
    check(socialData, {
      platform: String,
      accountId: String,
      accessToken: String
    });
    
    if (!Roles.userIsInRole(this.userId, 'admin')) {
      throw new Meteor.Error('access-denied');
    }
    
    // Encrypt token before storing
    const encryptedToken = CryptoJS.AES.encrypt(
      socialData.accessToken, 
      Meteor.settings.private.encryptionKey
    ).toString();
    
    return Clients.update(clientId, {
      $push: {
        socialAccounts: {
          platform: socialData.platform,
          accountId: socialData.accountId,
          accessToken: encryptedToken,
          isConnected: true,
          lastChecked: new Date()
        }
      }
    });
  },
  
  'clients.testConnection'(clientId, accountIndex) {
    check(clientId, String);
    check(accountIndex, Number);
    
    const client = Clients.findOne(clientId);
    if (!client) throw new Meteor.Error('not-found');
    
    const account = client.socialAccounts[accountIndex];
    if (!account) throw new Meteor.Error('account-not-found');
    
    // Test API connection
    // Implementation depends on platform
    
    return Clients.update(
      { _id: clientId },
      { 
        $set: { 
          [`socialAccounts.${accountIndex}.lastChecked`]: new Date(),
          [`socialAccounts.${accountIndex}.isConnected`]: true 
        } 
      }
    );
  }
});
```

## Task Collection

### Schema Definition
```javascript
// imports/api/tasks/tasks.js
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const Tasks = new Mongo.Collection('tasks');

const AttachmentSchema = new SimpleSchema({
  type: {
    type: String,
    allowedValues: ['image', 'video']
  },
  url: {
    type: String,
    regEx: SimpleSchema.RegEx.Url
  },
  thumbnail: {
    type: String,
    optional: true,
    regEx: SimpleSchema.RegEx.Url
  },
  size: {
    type: Number, // bytes
    max: 5242880 // 5MB
  },
  filename: {
    type: String
  }
});

Tasks.attachSchema(new SimpleSchema({
  title: {
    type: String,
    max: 100,
    min: 1
  },
  content: {
    type: String,
    max: 2200,
    min: 1
  },
  dueAt: {
    type: Date
  },
  clientId: {
    type: String
  },
  targetAccounts: {
    type: Array,
    optional: true
  },
  'targetAccounts.$': {
    type: String // Social account IDs
  },
  assignees: {
    type: Array,
    defaultValue: []
  },
  'assignees.$': {
    type: String // User IDs or "all"
  },
  attachments: {
    type: Array,
    optional: true,
    maxCount: 4
  },
  'attachments.$': AttachmentSchema,
  status: {
    type: String,
    allowedValues: ['draft', 'scheduled', 'completed', 'failed'],
    defaultValue: 'draft'
  },
  notes: {
    type: String,
    optional: true,
    max: 500
  },
  completedAt: {
    type: Date,
    optional: true
  },
  completedBy: {
    type: String,
    optional: true
  },
  scheduledFor: {
    type: Date,
    optional: true
  },
  createdAt: {
    type: Date,
    autoValue: function() {
      if (this.isInsert) return new Date();
    }
  },
  createdBy: {
    type: String,
    autoValue: function() {
      if (this.isInsert) return this.userId;
    }
  },
  updatedAt: {
    type: Date,
    autoValue: function() {
      return new Date();
    }
  }
}));
```

### Publications
```javascript
// imports/api/tasks/publications.js
Meteor.publish('tasks.assigned', function(filters = {}) {
  check(filters, Object);
  
  if (!this.userId) return this.ready();
  
  let query = {};
  
  // Admin sees all tasks, members see only assigned
  if (!Roles.userIsInRole(this.userId, 'admin')) {
    query.$or = [
      { assignees: this.userId },
      { assignees: "all" }
    ];
  }
  
  // Apply filters
  if (filters.status) {
    query.status = filters.status;
  }
  
  if (filters.clientId) {
    query.clientId = filters.clientId;
  }
  
  if (filters.dueAfter) {
    query.dueAt = { $gte: filters.dueAfter };
  }
  
  if (filters.dueBefore) {
    query.dueAt = { ...query.dueAt, $lte: filters.dueBefore };
  }
  
  return Tasks.find(query, {
    sort: { dueAt: 1, createdAt: -1 },
    limit: 50
  });
});

Meteor.publish('tasks.dashboard', function() {
  if (!this.userId) return this.ready();
  
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  
  let query = {
    dueAt: { $lte: tomorrow },
    status: { $in: ['draft', 'scheduled'] }
  };
  
  // Members only see assigned tasks
  if (!Roles.userIsInRole(this.userId, 'admin')) {
    query.$or = [
      { assignees: this.userId },
      { assignees: "all" }
    ];
  }
  
  return Tasks.find(query, {
    sort: { dueAt: 1 },
    limit: 10
  });
});
```

### Methods
```javascript
// imports/api/tasks/methods.js
Meteor.methods({
  'tasks.create'(taskData) {
    check(taskData, {
      title: String,
      content: String,
      dueAt: Date,
      clientId: String,
      assignees: [String],
      targetAccounts: Match.Optional([String]),
      scheduledFor: Match.Optional(Date)
    });
    
    if (!Roles.userIsInRole(this.userId, 'admin')) {
      throw new Meteor.Error('access-denied');
    }
    
    // Validate client exists
    const client = Clients.findOne(taskData.clientId);
    if (!client) {
      throw new Meteor.Error('invalid-client');
    }
    
    // Validate assignees exist
    if (taskData.assignees.some(id => id !== "all")) {
      const validUsers = Meteor.users.find({
        _id: { $in: taskData.assignees.filter(id => id !== "all") },
        isActive: true
      }).count();
      
      if (validUsers !== taskData.assignees.filter(id => id !== "all").length) {
        throw new Meteor.Error('invalid-assignees');
      }
    }
    
    return Tasks.insert({
      ...taskData,
      status: taskData.scheduledFor ? 'scheduled' : 'draft',
      attachments: []
    });
  },
  
  'tasks.update'(taskId, updates) {
    check(taskId, String);
    check(updates, Object);
    
    const task = Tasks.findOne(taskId);
    if (!task) throw new Meteor.Error('not-found');
    
    // Only admin or creator can update
    if (!Roles.userIsInRole(this.userId, 'admin') && task.createdBy !== this.userId) {
      throw new Meteor.Error('access-denied');
    }
    
    // Don't allow updating completed tasks
    if (task.status === 'completed') {
      throw new Meteor.Error('task-completed');
    }
    
    return Tasks.update(taskId, { $set: updates });
  },
  
  'tasks.complete'(taskId, notes) {
    check(taskId, String);
    check(notes, Match.Optional(String));
    
    const task = Tasks.findOne(taskId);
    if (!task) throw new Meteor.Error('not-found');
    
    // Check if user is assigned to this task
    if (!Roles.userIsInRole(this.userId, 'admin') && 
        !task.assignees.includes(this.userId) && 
        !task.assignees.includes("all")) {
      throw new Meteor.Error('not-assigned');
    }
    
    return Tasks.update(taskId, {
      $set: {
        status: 'completed',
        completedAt: new Date(),
        completedBy: this.userId,
        notes: notes
      }
    });
  },
  
  'tasks.addAttachment'(taskId, attachmentData) {
    check(taskId, String);
    check(attachmentData, {
      type: String,
      url: String,
      size: Number,
      filename: String,
      thumbnail: Match.Optional(String)
    });
    
    const task = Tasks.findOne(taskId);
    if (!task) throw new Meteor.Error('not-found');
    
    if (!Roles.userIsInRole(this.userId, 'admin') && task.createdBy !== this.userId) {
      throw new Meteor.Error('access-denied');
    }
    
    if (task.attachments && task.attachments.length >= 4) {
      throw new Meteor.Error('max-attachments');
    }
    
    return Tasks.update(taskId, {
      $push: { attachments: attachmentData }
    });
  }
});
```

## Dashboard Aggregations

### Summary Data Methods
```javascript
// imports/api/dashboard/methods.js
Meteor.methods({
  'dashboard.getSummary'() {
    if (!this.userId) throw new Meteor.Error('not-logged-in');
    
    const now = new Date();
    const isAdmin = Roles.userIsInRole(this.userId, 'admin');
    
    let taskQuery = {};
    if (!isAdmin) {
      taskQuery.$or = [
        { assignees: this.userId },
        { assignees: "all" }
      ];
    }
    
    const summary = {
      pendingTasks: Tasks.find({
        ...taskQuery,
        status: { $in: ['draft', 'scheduled'] },
        dueAt: { $gte: now }
      }).count(),
      
      overdueTasks: Tasks.find({
        ...taskQuery,
        status: { $in: ['draft', 'scheduled'] },
        dueAt: { $lt: now }
      }).count(),
      
      completedToday: Tasks.find({
        ...taskQuery,
        status: 'completed',
        completedAt: { 
          $gte: new Date(now.setHours(0, 0, 0, 0)) 
        }
      }).count()
    };
    
    if (isAdmin) {
      summary.activeClients = Clients.find({ isActive: true }).count();
      summary.totalMembers = Meteor.users.find({ 
        isActive: true,
        roles: 'member' 
      }).count();
    }
    
    return summary;
  },
  
  'dashboard.getUpcomingTasks'(limit = 5) {
    check(limit, Number);
    
    if (!this.userId) throw new Meteor.Error('not-logged-in');
    
    let query = {
      status: { $in: ['draft', 'scheduled'] }
    };
    
    if (!Roles.userIsInRole(this.userId, 'admin')) {
      query.$or = [
        { assignees: this.userId },
        { assignees: "all" }
      ];
    }
    
    return Tasks.find(query, {
      sort: { dueAt: 1 },
      limit: limit
    }).fetch();
  }
});
```
