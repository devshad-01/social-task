# Posty

**Live Demo**: [posty.meteorapp.com](https://posty.meteorapp.com)

A task management and social media scheduling platform for digital agencies and teams managing multiple client social media accounts.

## Features

- **Role-based Access Control**: Admin and team member roles with appropriate permissions
- **Client Management**: Organize work by clients with contact information and social media accounts
- **Task Management**: Create, assign, and track tasks with due dates, attachments, and collaboration
- **Social Media Integration**: Connect Facebook Pages and Instagram accounts via OAuth
- **Real-time Notifications**: Push notifications for task updates and deadlines
- **Progressive Web App**: Offline support, mobile installation, background sync
- **File Upload**: Image and video attachments via Cloudinary

## Tech Stack

- **Backend**: Meteor 3.0, MongoDB, Node.js
- **Frontend**: React 18, Tailwind CSS
- **Authentication**: Meteor Accounts with role-based access
- **File Storage**: Cloudinary
- **Notifications**: Web Push API, Service Workers

## Quick Start

### Prerequisites
- Node.js 18+
- Meteor 3.0+
- MongoDB

### Installation

1. **Clone repository**
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
   # Edit settings.json with your API keys
   ```

4. **Start development server**
   ```bash
   meteor --settings settings.json
   ```

5. **Access application**
   - Local: http://localhost:3000
   - Production: https://posty.meteorapp.com

### Default Admin Login

On first run, a default admin account is created:
- **Email**: `admin@posty.com`
- **Password**: `Admin123!`

**Important**: Change these credentials immediately after first login.

## User Roles

### Admin
- Create, edit, and delete tasks
- Manage clients and social media accounts
- Add and manage team members
- Access all system features

### Team Member
- View assigned tasks
- Mark tasks as completed
- View client information (read-only)
- Receive notifications
- Cannot create tasks or manage clients

## Configuration

### Required API Keys

Create accounts and obtain API keys for:

- **Cloudinary**: File storage (`cloud_name`, `api_key`, `api_secret`)
- **Facebook App**: Social media integration (`appId`, `appSecret`)
- **VAPID Keys**: Push notifications (`publicKey`, `privateKey`)

### Environment Setup

Edit `settings.json` with your configuration:

```json
{
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
      "publicKey": "your_vapid_public_key",
      "privateKey": "your_vapid_private_key"
    }
  }
}
```

## Project Structure

```
posty/
├── client/                    # Client entry points
├── imports/
│   ├── api/                   # Backend collections & methods
│   │   ├── users/            # User management
│   │   ├── tasks/            # Task system
│   │   ├── clients/          # Client management
│   │   ├── notifications/    # Push notifications
│   │   └── meta/             # Social media API
│   └── ui/                   # React frontend
│       ├── components/       # Reusable components
│       ├── pages/           # Route pages
│       ├── hooks/           # Custom hooks
│       └── context/         # React context
├── server/                   # Server-only code
├── public/                   # Static assets
└── docs/                     # Documentation
```

## Core Workflows

### Admin Workflow
1. Add client companies
2. Connect social media accounts
3. Create and assign tasks
4. Monitor team progress

### Team Member Workflow
1. Login via mobile PWA
2. View assigned tasks
3. Complete tasks with comments
4. Work offline when needed

## Security

- Role-based access control
- Secure password hashing (bcrypt)
- Rate limiting for authentication
- Encrypted social media tokens
- Input validation and CSRF protection

## Development

### Commands
```bash
# Start development
meteor --settings settings.json

# Reset database
meteor reset

# Deploy to production
meteor deploy your-app.meteorapp.com --settings settings.json
```

### Key Files
- `settings.json` - Configuration (not tracked in git)
- `settings.example.json` - Configuration template
- `server/main.js` - Server initialization
- `client/main.jsx` - Client entry point

## License

MIT License - see LICENSE file for details.

## Support

- **Documentation**: `/docs` folder
- **Issues**: GitHub Issues
- **Demo**: [posty.meteorapp.com](https://posty.meteorapp.com)