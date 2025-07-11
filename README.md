# 🚀 Meteor + JSX + Tailwind CSS 4.1 + Flowbite

This project is a modern full-stack starter template built with:

- ⚙️ [Meteor](https://www.meteor.com/) – JavaScript full-stack platform
- ⚛️ JSX support for React-style UI components
- 🎨 [Tailwind CSS 4.1](https://tailwindcss.com/) – Utility-first styling with native `@theme` support
- 💧 [Flowbite](https://flowbite.com/) – Beautiful components built on Tailwind

---

## ✅ Features

- Tailwind 4.1 with custom `@theme` color and font variables
- Flowbite plugin integration for styled UI components
- Clean folder structure with JSX files and Tailwind classes
- PostCSS config using new Tailwind plugin system
- Ready to extend with layout, grid, buttons, navbar, and animations
https://github.com/devshad-01/Meteor-JSX-Flowbit-Tailwind.git
---

## 📁 Project Structure

project/
├── .meteor/ # Meteor config
├── client/
│ ├── main.jsx # Main React/JSX entry point
│ └── main.css # Tailwind + Custom Theme + Flowbite
├── imports/ # Optional logic and components
├── public/ # Static assets
├── tailwind.config.js # Tailwind content settings
├── postcss.config.mjs # PostCSS plugins
├── package.json
└── README.md

## 🧪 Getting Started

### 1. Clone the Project

```bash
git clone https://github.com/Fidel-Kisevu/Meteor-JSX-Flowbit-Tailwind.git
cd Meteor-JSX-Flowbit-Tailwind

meteor npm install

📍 http://localhost:3000


ailwind Theme Setup
We use CSS variables inside @theme in client/main.css:


@theme {
  --color-primary-50: #eff6ff;
  --color-primary-500: #3b82f6;
  --color-primary-900: #1e3a8a;

  --font-sans: 'Inter', sans-serif;
  --font-body: 'Inter', sans-serif;
  --font-mono: 'SFMono-Regular', monospace;
}
You can now use these like:


<div class="bg-primary-500 text-primary-50 font-sans">
  Hello from Tailwind 4.1!
</div>
💧 Flowbite Integration
Flowbite is installed via NPM and configured in your CSS:


npm install flowbite
Inside client/main.css:


@import "tailwindcss";
@plugin "flowbite/plugin";
@source "../node_modules/flowbite";
Now you can use Flowbite components like:

html
Copy
Edit
<button class="btn-primary">Click Me</button>
or copy components directly from Flowbite Docs.

🧰 Example UI Elements
html


<!-- Button -->
<button class="bg-primary-600 hover:bg-primary-700 text-white font-sans px-4 py-2 rounded">
  Primary Button
</button>

<!-- Input -->
<input class="border border-primary-300 focus:ring-primary-500 px-3 py-2 rounded" />

<!-- Navbar -->
<nav class="bg-primary-800 text-primary-50 p-4">
  <a class="hover:text-primary-300" href="#">Home</a>
</nav>
🔗 Resources
Tailwind v4 Theming Docs

Flowbite Components

Meteor Docs

📦 Deployment
You can deploy this app using:

🌩 Meteor Cloud

🌐 Static frontends (if separated) via Vercel or Render

🧾 License
MIT © Fidel Kisevu

## Task Management User Stories & Features

This project supports a robust, agency-grade task management system for IT companies and digital teams. Key user stories and features include:

### Admin/Supervisor
- Add client companies and manage their accounts
- Create tasks (with images/files), assign to team members or roles
- Set task priorities (high/medium/low), deadlines, and reminders
- Track task status: draft, scheduled, in progress, completed, overdue
- Comment on tasks, mention team members, upload/attach files
- Filter/search tasks by client, assignee, status, or due date
- Receive notifications for completed/overdue tasks
- View analytics (tasks per week, overdue, team workload)
- Duplicate/template common tasks for recurring work

### Team Members
- See assigned tasks in dashboard/calendar view
- View task details, attachments, due dates, and client/project info
- Update task status (in progress, blocked, completed)
- Comment, ask questions, upload deliverables
- Receive reminders for upcoming/overdue tasks
- See task history and recent changes

### General/Advanced
- Task dependencies (blockers)
- Subtasks/checklists
- Time tracking
- Role-based permissions
- Mobile PWA support
- Activity feed (recent actions)
- Bulk actions (complete, assign, delete)
- Integrations (calendar, Slack, email)

See `.github/copilot/TasksuserStories.md` for the full list of user stories and details.

## Recommended Implementation Phases

**Phase 1: Core PWA Setup & Task Basics**
- Set up PWA manifest, service worker, and offline support
- Implement user authentication (admin/team)
- Build basic task CRUD (create, view, update, delete)
- Assign tasks to users
- Show assigned tasks on dashboard (mobile-first)

**Phase 2: Notifications (MVP)**
- In-app notification bell with unread count
- Send notification when a task is assigned or completed
- Show notification list/center
- Mark notifications as read

**Phase 3: Task Details & Collaboration**
- Task details view (attachments, comments, status updates)
- Mark task as completed/in progress/blocked
- Upload files to tasks
- Comment and @mention on tasks

**Phase 4: Advanced PWA & Notification Features**
- Push notifications (web/mobile)
- Notification preferences (email, push, in-app)
- Real-time updates (websockets or polling)
- Reminders for due/overdue tasks

**Phase 5: Analytics, Bulk Actions, and Integrations**
- Task analytics and activity feed
- Bulk actions (complete, assign, delete)
- Integrate with calendar, Slack, or email

_See `.github/copilot/TasksuserStories.md` for full user stories and features._