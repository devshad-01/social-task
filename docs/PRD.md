### Revised MVP PRD with Every Detail
#### 1. **User Management**
   - **Roles**:
     - Admin (Supervisor): Full access.
     - Team Member: Can view and complete assigned tasks, view client accounts (read-only).
   - **Authentication**:
     - Email/Password sign-up and login (using `accounts-password`).
     - Forgot password flow (reset via email).
   - **User Profile**:
     - Fields: Full Name, Email, Profile Picture (optional in MVP, can be a placeholder avatar).
     - Admin can deactivate a user (soft delete, set `isActive: false`).
#### 2. **Client Company Management**
   - **Client Model**:
     - Fields: Company Name, Logo (URL - optional, can be a placeholder), Contact Person Name, Contact Email, Contact Phone (optional).
     - Admin can create, edit, and archive (set `isArchived: true`) clients.
   - **Client List**:
     - Admin view: Table of active clients with actions (edit, archive).
     - Archive view: List of archived clients (can restore).
#### 3. **Social Account Management**
   - **Supported Platforms**: Facebook Pages and Instagram accounts (connected via Facebook Graph API).
   - **Connection Flow**:
     1. Admin clicks "Connect Account" for a client.
     2. Redirect to Facebook OAuth (using `facebook-oauth` package).
     3. Request permissions: `pages_show_list`, `pages_read_engagement`, `pages_manage_posts`.
     4. After auth, fetch connected pages and associated Instagram accounts (if linked in Facebook).
     5. Admin selects which page(s) and Instagram account(s) to link to the client.
   - **Storage**:
     - Store access token (encrypted) and page/account details (page ID, name, Instagram account ID if available).
   - **Status Indicator**:
     - Show connected accounts per client with a green check (connected) or red cross (disconnected/error). Check token validity on load.
#### 4. **Task System**
   - **Task Model**:
     - Fields:
       - `title`: String (required, max 100 chars).
       - `description`: Text (required, max 2200 chars).
       - `dueDate`: Date and time (required).
       - `assignees`: Array of user IDs (if empty, then assigned to all active team members? Or we can have an `isAssignedToAll` flag).
       - `clientId`: Client ID (required).
       - `socialAccountIds`: Array of connected social account IDs (pages/IG accounts) for which this task is intended (optional).
       - `attachments`: Array of file references (max 4 files, each max 5MB).
       - `status`: String (one of: `draft`, `scheduled`, `completed`).
       - `createdBy`: User ID (admin who created).
       - `createdAt`: Date.
       - `updatedAt`: Date.
   - **Task Creation**:
     - Admin fills a form with:
       - Client (dropdown of active clients, required).
       - Social accounts (multi-select of the client's connected accounts, optional).
       - Title (required).
       - Description (required).
       - Due date and time (required, future date).
       - Assignees: Multi-select of active team members OR a checkbox for "Assign to all active team members".
       - Attachments: File input (images: jpg, png; videos: mp4, mov; max 5MB each, max 4).
     - On submit, task is saved as `draft`.
   - **Task Lifecycle**:
     - Admin can change status from `draft` to `scheduled` (which means it's active and assigned).
     - Team member can mark as `completed` (only when due date is today or past? Or anytime? Let's allow anytime after creation).
   - **Task Views**:
     - Admin: Can see all tasks (filter by status, client, assignee).
     - Team Member: Only tasks assigned to them (or all if assigned to all) and not archived.
     - Today's tasks: Dashboard default view shows tasks due today (and overdue) for the logged-in user (or all tasks for the team if assigned to all).
#### 5. **Dashboard (for Team Members)**
   - **Today's Tasks**:
     - List of tasks due today (and overdue) for the logged-in user (or all tasks assigned to the entire team if the user is part of an "all assigned" task?).
     - Sorted by due time (earliest first).
   - **Task Card**:
     - Title, client name, due time, description (truncated), status, and attachments (thumbnails).
     - Action: Mark as completed (if status is `scheduled`).
   - **Filters**:
     - By client (dropdown) and status (dropdown: scheduled, completed).
#### 6. **Admin Control Panel**
   - **Dashboard**:
     - Summary: Number of active clients, connected social accounts, tasks (by status).
   - **Sections**:
     - Clients: CRUD and archive.
     - Social Accounts: List per client with connection status and reconnect option.
     - Tasks: Full CRUD (admin can edit/delete tasks).
     - Team: List of users (admin can deactivate, but not delete).
#### 7. **PWA Features**
   - **Web App Manifest**:
     - Define `short_name`, `name`, `icons`, `start_url`, `display` (standalone).
   - **Service Worker**:
     - Precache static assets (app shell).
     - Offline: Cache tasks for the last 7 days (so team members can view tasks offline).
     - Background sync for task completion (if offline, queue and sync when online).
   - **Push Notifications**:
     - When a task is assigned to a team member, send a push notification (using browser capabilities).
     - When due date is approaching (1 hour before? Not MVP, phase 2).
#### 8. **Responsive Design**
   - Mobile-first approach using Tailwind CSS.
   - Breakpoints: 
     - Mobile: < 640px (default)
     - Tablet: 640px - 1024px
     - Desktop: > 1024px
   - Key mobile screens: Login, Dashboard (task list), Task detail, Admin views (simplified).
### Data Models (Collections)
1. **Users** (Meteor.users)
   - `emails: [{ address, verified }]`
   - `profile: { fullName, avatarUrl (optional) }`
   - `role: 'admin' | 'team-member'`
   - `isActive: boolean`
2. **Clients**
   - `name: string`
   - `logoUrl: string (optional)`
   - `contact: { name: string, email: string, phone: string (optional) }`
   - `isArchived: boolean`
   - `createdAt: Date`
   - `updatedAt: Date`
3. **SocialAccounts**
   - `clientId: string`
   - `platform: 'facebook' | 'instagram'`
   - `accountId: string` (page ID or IG account ID)
   - `accountName: string`
   - `accessToken: string` (encrypted)
   - `isConnected: boolean`
   - `lastChecked: Date` (last time token was validated)
4. **Tasks**
   - `title: string`
   - `description: string`
   - `dueDate: Date`
   - `assignees: string[]` (user IDs) - if empty, then it's for all? Or we can have a separate field `assignedToAll: boolean`
   - `clientId: string`
   - `socialAccountIds: string[]` (optional, array of SocialAccount _id)
   - `attachments: string[]` (array of file URLs or GridFS file IDs)
   - `status: 'draft' | 'scheduled' | 'completed'`
   - `createdBy: string` (user ID)
   - `createdAt: Date`
   - `updatedAt: Date`
5. **Files** (if using GridFS)
   - `_id: string`
   - `name: string`
   - `type: string`
   - `size: number`
   - `userId: string` (uploader)
   - `uploadedAt: Date`
### Security Rules (using Meteor methods and publications)
- Publications:
  - Admin: Can see everything.
  - Team Member: 
    - Only active clients (not archived).
    - Only tasks assigned to them (or assigned to all) and that are not draft (unless they are the creator? But only admin creates tasks? So maybe team members don't see draft tasks at all).
    - Only their own profile.
- Methods:
  - Client CRUD: Only admin.
  - Social Account CRUD: Only admin.
  - Task creation: Only admin.
  - Task update (status change): Only assigned team member (for completing) or admin (for any change).
### Workflows
1. **Admin Onboarding**:
   - First run: Create admin account (if no users, allow sign-up as admin).
   - Then admin adds clients, connects social accounts, adds team members.
2. **Daily Use**:
   - Admin creates tasks (draft) then schedules them (scheduled).
   - Team members log in (mobile PWA) and see their scheduled tasks for today.
   - Team member clicks a task to view details (with attachments) and marks it completed.

   Key User Stories
Admin (Supervisor)

"As admin, I need to add a client company so we can manage their accounts"

"As admin, I must connect FB/IG accounts to assign posting tasks"

"As admin, I want to create a task with images for all team members to see"

"As admin, I need to assign specific tasks to Sarah for urgent posts"

Team Member
5. "As a team member, I want to see my assigned tasks when I log in"
6. "As a team member, I need to view task details including attached images"
7. "As a team member, I want to mark a scheduled post as completed"
8. "As a team member, I need offline access to my task list in the field"

..also any routes...(i want clean home , navigation, (oh i forgot to tell you that we must have a notifications sth (that routes to any lest say tagged task for instance )))coz i dont wanna breakk things up) manage kepping in mind that we have meteor also)...infact i have the json theme here ...in tasks also, we could have like work(default on account),user can add another instances of tasks like (personal)..then we also have dates ...oh and for tasks ...there is that follow up like (sth to do with clicking then opens with that id)...then there can be follow up like with comments..posting comments....like that