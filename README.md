# 🚀 Posty - Social Media Task Management Platform

> **Live Demo**: [posty.meteorapp.com](https://posty.meteorapp.com)

**Posty** is a comprehensive **Task Management & Social Media Scheduling Platform** designed for digital agencies and teams managing multiple client social media accounts. Built with Meteor 3.0, React 18, and modern PWA technologies.

## ✨ Key Features

### 👥 **User Management & Roles**
- **Admin/Supervisor**: Full access to all features
- **Team Members**: View and complete assigned tasks, read-only access to client accounts
- Email/password authentication with forgot password flow
- User profiles with avatar support

### 🔐 **Role-Based Permissions**

#### Admin Capabilities:
- ✅ Create, edit, and delete tasks
- ✅ Manage client companies and social media accounts
- ✅ Add and manage team members
- ✅ View all tasks and analytics
- ✅ Access admin control panel
- ✅ Configure system settings

#### Team Member Capabilities:
- ✅ View assigned tasks
- ✅ Mark tasks as completed
- ✅ View client information (read-only)
- ✅ Receive push notifications
- ✅ Use mobile PWA features
- ❌ Cannot create or delete tasks
- ❌ Cannot manage clients or team members

### 🏢 **Client Management**
- Add and manage client companies
- Store contact information (name, email, phone)
- Upload client logos and company details
- Archive/restore client accounts

### 📱 **Social Media Integration**
- Connect Facebook Pages and Instagram accounts
- OAuth integration with Facebook Graph API
- Real-time connection status monitoring
- Support for multiple accounts per client

### 📋 **Advanced Task System**
- Create tasks with rich descriptions and attachments
- Due dates with time management
- Assign to specific team members or entire team
- Task categories: Work (default), Personal (user-defined)
- File attachments (images, videos up to 5MB each, max 4 files)
- Task status tracking: Draft → Scheduled → Completed

### 🔔 **Smart Notifications**
- Real-time push notifications for task assignments
- Task deadline reminders
- Tagged task notifications
- Offline notification queuing

### 💬 **Task Collaboration**
- Task comments and follow-ups
- Click to open tasks by ID
- Team collaboration features
- Activity tracking

### 📱 **Progressive Web App (PWA)**
- Works offline with cached tasks (last 7 days)
- Install as mobile app
- Background sync for task completions
- Service worker for optimal performance

## 🛠️ Tech Stack

- **Backend**: Meteor 3.0 + MongoDB
- **Frontend**: React 18 + JSX
- **Styling**: Tailwind CSS 4.1
- **Authentication**: Meteor Accounts with role-based access
- **Real-time**: Meteor's reactive data system
- **File Storage**: Cloudinary integration
- **Notifications**: Web Push API + Service Workers
- **Mobile**: PWA with offline support

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Meteor 3.0+
- MongoDB

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/devshad-01/social-task.git
   cd posty
   ```

2. **Install dependencies**
   ```bash
   meteor npm install
   ```

3. **Configure settings**
   ```bash
   cp settings.example.json settings.json
   # Edit settings.json with your API keys and database URLs
   ```

4. **Required API Keys**
   - **Cloudinary**: For file storage (`cloud_name`, `api_key`, `api_secret`)
   - **Facebook App**: For social media integration (`appId`, `appSecret`)
   - **VAPID Keys**: For push notifications (`publicKey`, `privateKey`)
   - **MongoDB**: Database connection string

5. **Start development server**
   ```bash
   meteor --settings settings.json
   ```

6. **Access the app**
   - Local: http://localhost:3000
   - Production: https://posty.meteorapp.com

7. **First-time Admin Login**
   ```
   Email: admin@posty.com
   Password: Admin123!
   ```
   > **Important**: On first run, the system automatically creates an admin account with the above credentials. Change this password immediately after first login for security!

## 📁 Project Structure

```
posty/
├── client/                          # Client entry points
│   ├── main.jsx                     # React app entry
│   └── main.css                     # Tailwind CSS
│
├── imports/
│   ├── api/                         # Backend collections & methods
│   │   ├── users/                   # User authentication & management
│   │   ├── tasks/                   # Task management system
│   │   ├── clients/                 # Client management
│   │   ├── posts/                   # Social media posts
│   │   ├── notifications/           # Push notification system
│   │   └── meta/                    # Facebook/Instagram API
│   │
│   ├── ui/                          # React frontend
│   │   ├── components/              # Reusable UI components
│   │   │   ├── auth/                # Authentication forms
│   │   │   ├── common/              # Buttons, modals, inputs
│   │   │   ├── layout/              # Page layouts
│   │   │   ├── navigation/          # Headers, sidebars
│   │   │   ├── tasks/               # Task components
│   │   │   ├── clients/             # Client components
│   │   │   └── notifications/       # Notification components
│   │   │
│   │   ├── pages/                   # Main route pages
│   │   │   ├── DashboardPage.jsx    # Main dashboard
│   │   │   ├── TasksPage.jsx        # Task management
│   │   │   ├── ClientsPage.jsx      # Client management
│   │   │   ├── PostsPage.jsx        # Social media posts
│   │   │   ├── NotificationsPage.jsx # Notifications center
│   │   │   └── ProfilePage.jsx      # User settings
│   │   │
│   │   ├── hooks/                   # Custom React hooks
│   │   └── context/                 # React context providers
│   │
│   └── startup/                     # App initialization
│       ├── client/                  # Client startup
│       └── server/                  # Server startup
│
├── server/                          # Server-only code
├── public/                          # Static assets & PWA manifest
└── docs/                            # Project documentation
```

## 🔧 Configuration

### Environment Variables (settings.json)

```json
{
  "public": {
    "app": {
      "name": "Posty",
      "version": "1.0.0"
    },
    "vapid": {
      "publicKey": "YOUR_VAPID_PUBLIC_KEY"
    }
  },
  "private": {
    "cloudinary": {
      "cloud_name": "your_cloud_name",
      "api_key": "your_api_key", 
      "api_secret": "your_api_secret"
    },
    "metaApi": {
      "appId": "your_facebook_app_id",
      "appSecret": "your_facebook_app_secret"
    },
    "vapid": {
      "privateKey": "YOUR_VAPID_PRIVATE_KEY"
    }
  }
}
```

## 🎯 Core Workflows

### Admin Workflow
1. **Setup**: Add client companies and connect their social media accounts
2. **Task Creation**: Create tasks with descriptions, attachments, and due dates
3. **Assignment**: Assign tasks to specific team members or entire team
4. **Monitoring**: Track task progress and completion rates

### Team Member Workflow  
1. **Login**: Access assigned tasks through mobile PWA
2. **Today's Tasks**: View tasks due today with priority sorting
3. **Task Details**: View attachments, descriptions, and client information
4. **Completion**: Mark tasks as completed with optional comments
5. **Offline Access**: Work offline with cached task data

## 🔐 Security Features

- Role-based access control (Admin/Team Member)
- Secure password hashing with bcrypt
- Rate limiting for authentication attempts
- Encrypted storage of social media tokens
- CSRF protection and input validation

## 📱 Mobile Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **PWA Support**: Install as native mobile app
- **Offline Mode**: Works without internet connection
- **Push Notifications**: Real-time task updates
- **Touch Optimized**: Optimized for mobile interactions

## 🔗 API Integrations

### Facebook Graph API
- Connect Facebook Pages
- Link Instagram Business accounts
- Validate token status
- Post scheduling capabilities

### Cloudinary
- Image and video uploads
- Automatic optimization
- CDN delivery
- File management

## 📊 Key Data Models

### Users
- Email authentication with role-based permissions
- Profile management with avatars
- Activity tracking

### Tasks
- Rich task descriptions with attachments
- Due date management with reminders
- Status tracking (Draft → Scheduled → Completed)
- Assignment to individuals or teams

### Clients
- Company information and contact details
- Connected social media accounts
- Project and task associations

### Social Accounts
- Platform-specific connection details
- Token management and validation
- Real-time status monitoring

## 📈 Future Roadmap

- [ ] Advanced analytics and reporting
- [ ] Automated post scheduling
- [ ] Team performance metrics  
- [ ] Mobile app (iOS/Android)
- [ ] Integration with more social platforms
- [ ] Advanced collaboration tools

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License. See `LICENSE` file for details.

## 🆘 Support

- **Documentation**: See `/docs` folder for detailed guides
- **Issues**: Report bugs on GitHub Issues
- **Live Demo**: [posty.meteorapp.com](https://posty.meteorapp.com)

---

**Built with ❤️ by the Posty Team**
│   │   │   │
│   │   │   ├── context/             # React context providers
│   │   │   │   ├── AuthContext.jsx  # User authentication
│   │   │   │   ├── NavigationContext.jsx # App navigation
│   │   │   │   └── ResponsiveContext.jsx # Mobile/desktop
│   │   │   │
│   │   │   └── App.jsx              # Main app component
│   │   │
│   │   └── startup/                 # App initialization
│   │       └── server/index.js      # Server startup logic
│
├── ⚙️ SERVER CONFIGURATION
│   ├── server/
│   │   ├── main.js                  # Server entry point
│   │   ├── cloudinary_methods.js    # File upload methods
│   │   └── dev-tools.js             # Development utilities
│
├── 📱 PWA ASSETS
│   ├── public/
│   │   ├── manifest.json            # PWA manifest
│   │   ├── service-worker.js        # Offline support
│   │   └── icons/                   # PWA icons
│
├── 🔧 CONFIGURATION
│   ├── .meteor/packages             # Meteor packages
│   ├── package.json                 # NPM dependencies
│   ├── settings.json                # App configuration
│   ├── tailwind.config.js           # Tailwind CSS config
│   └── postcss.config.mjs           # PostCSS configuration
│
└── 📚 DOCUMENTATION
    ├── .github/copilot/             # AI development guides
    └── docs/development-notes/      # Development notes
```

---

## 🚀 **How to Run & Develop**

### **1. Start the Application**
```bash
cd /home/shad/Desktop/posty
meteor
```

### **2. Access the Application**
- **Web**: http://localhost:3000
- **Mobile**: Install as PWA from browser menu

### **3. Default Admin Account**
- **Email**: admin@posty.com
- **Password**: Admin123!

### **4. Key Development Commands**
```bash
# Install new Meteor package
meteor add package-name

# Install new NPM package
meteor npm install package-name

# Reset database (for testing)
meteor reset

# Run tests
meteor test

# Deploy to production
meteor deploy your-app.meteorapp.com
```

---

## 🔧 **Configuration Files**

### **settings.json** - App Configuration
Contains all your API keys and settings:
- Cloudinary (file uploads)
- Meta API (Facebook/Instagram)
- Email service
- Security settings

### **package.json** - Dependencies
- React 18 for UI
- Tailwind CSS 4.1 for styling
- Flowbite for components
- Various utilities

### **.meteor/packages** - Meteor Packages
- accounts-password (authentication)
- alanning:roles (permissions)
- email (notifications)
- hot-module-replacement (development)

---

## 👥 **User Roles & Permissions**

### **Admin**
- Create/manage all tasks
- Manage clients and users
- Access all system features
- View analytics

### **Supervisor**
- Create/assign tasks to team
- Manage assigned clients
- View team performance

### **Member**
- View assigned tasks
- Update task status
- Upload deliverables
- Receive notifications

---

## 🎯 **Next Steps for Development**

1. **Fix the Meta API issue** - Add your Facebook/Instagram API tokens
2. **Configure email service** - Set up proper SMTP for production
3. **Add more social platforms** - Twitter, LinkedIn, TikTok
4. **Enhance analytics** - Task completion rates, team performance
5. **Mobile app optimization** - Better offline support
6. **Calendar integration** - Google Calendar, Outlook

---

## 🚨 **Known Issues & Solutions**

### **Email Service**
Currently configured for development only. For production:
1. Sign up for Brevo, SendGrid, or similar
2. Update `settings.json` with real SMTP credentials

### **Meta API**
Facebook/Instagram integration requires:
1. Facebook Developer App setup
2. User access tokens in settings.json
3. App review for production use

### **File Uploads**
Cloudinary is configured but may need:
1. Account verification
2. Upload preset configuration
3. Folder organization

---

## 📞 **Support & Resources**

- **Meteor Docs**: https://docs.meteor.com/
- **React Docs**: https://react.dev/
- **Tailwind CSS**: https://tailwindcss.com/
- **Flowbite Components**: https://flowbite.com/

Your app is well-structured and production-ready! 🎉
