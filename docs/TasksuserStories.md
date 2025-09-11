- First run: Create admin account (if no users, allow sign-up as admin).
- Then admin adds clients, connects social accounts, adds team members.

## Daily Use
- Admin creates tasks (draft) then schedules them (scheduled).
- Team members log in (mobile PWA) and see their scheduled tasks for today.
- Team member clicks a task to view details (with attachments) and marks it completed.

## Admin/Supervisor Stories
- As admin, I need to add a client company so we can manage their accounts.
- As admin, I want to create a task with images for all team members to see.
- As admin, I need to assign specific tasks to Sarah for urgent posts.
- As admin, I want to set task priorities (high/medium/low) so urgent work is visible.
- As admin, I want to set deadlines and reminders for tasks so nothing is missed.
- As admin, I want to assign tasks to multiple team members or specific roles.
- As admin, I want to track the progress/status of all tasks (draft, scheduled, in progress, completed, overdue).
- As admin, I want to comment on tasks and mention team members for clarifications.
- As admin, I want to upload and attach files (briefs, assets, screenshots) to tasks.
- As admin, I want to filter and search tasks by client, assignee, status, or due date.
- As admin, I want to receive notifications when tasks are completed or overdue.
- As admin, I want to view analytics (e.g., tasks completed per week, overdue tasks, team workload).
- As admin, I want to duplicate or template common tasks for recurring work.

## Team Member Stories
- As a team member, I want to see my assigned tasks when I log in.
- As a team member, I need to view task details including attached images, files, and due dates.
- As a team member, I want to mark a scheduled post as completed.
- As a team member, I want to update the status of my tasks (e.g., in progress, blocked, completed).
- As a team member, I want to comment or ask questions on tasks.
- As a team member, I want to upload my deliverables or mark attachments as submitted.
- As a team member, I want to receive reminders for upcoming or overdue tasks.
- As a team member, I want to see which client/project a task belongs to.
- As a team member, I want to see all files and links related to a task.
- As a team member, I want to see task history and who made changes.

## Notifications
- As an admin, I want to receive notifications when:
  - A task is completed, overdue, or blocked
  - A team member comments or asks a question on a task
  - A file or deliverable is uploaded to a task
  - A new task is assigned to me (if admins can also be assignees)
- As a team member, I want to receive notifications when:
  - I am assigned a new task
  - My task is updated, commented on, or has new files attached
  - My task is due soon or overdue
  - My question or comment receives a reply
- As a user, I want to control which notifications I receive (email, in-app, push)
- As a user, I want to see a notification center or bell with unread counts
- As a user, I want to mark notifications as read or clear them
- As a user, I want to receive real-time notifications (websockets, push, or polling)

## General/Advanced
- Task dependencies: Some tasks can’t start until others are finished.
- Subtasks/checklists: Break big tasks into smaller steps.
- Time tracking: Log hours spent on each task.
- Role-based permissions: Only admins can assign/delete; team can only update their own.
- Mobile PWA support: Optimized for mobile task management.
- Activity feed: See recent actions on tasks (created, updated, commented, completed).
- Bulk actions: Mark multiple tasks as completed, assign, or delete in one go.
- Integrations: Link tasks to calendar, Slack, or email notifications.

---

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

