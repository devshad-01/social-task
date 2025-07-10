import React from 'react';
import { Icons } from './Icons';

export const DashboardPage = ({ activeTab }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const mockTasks = [
    {
      id: '1',
      title: 'Instagram Story - Summer Campaign',
      client: 'Fashion Brand Co.',
      dueTime: '2:00 PM',
      status: 'scheduled',
      priority: 'high',
      category: 'work'
    },
    {
      id: '2',
      title: 'Facebook Post - Product Launch',
      client: 'Tech Startup Inc.',
      dueTime: '4:30 PM',
      status: 'scheduled',
      priority: 'medium',
      category: 'work'
    },
    {
      id: '3',
      title: 'LinkedIn Article Review',
      client: 'Corporate Solutions',
      dueTime: '6:00 PM',
      status: 'draft',
      priority: 'low',
      category: 'business'
    }
  ];

  const getPageContent = () => {
    switch (activeTab) {
      case 'tasks':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-neutral-800">Tasks</h2>
              <button className="btn btn-primary">
                <Icons.tasks className="w-4 h-4 mr-2" />
                New Task
              </button>
            </div>
            
            <div className="grid gap-4">
              {mockTasks.map((task) => (
                <div key={task.id} className={`task-card task-priority-${task.priority}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-neutral-800 mb-1">{task.title}</h3>
                      <p className="text-sm text-neutral-600 mb-2">{task.client}</p>
                      <div className="flex items-center space-x-2">
                        <span className={`badge task-status-${task.status}`}>
                          {task.status}
                        </span>
                        <span className="text-xs text-neutral-500">Due: {task.dueTime}</span>
                      </div>
                    </div>
                    <div className={`task-category task-category-${task.category} px-3 py-1 rounded-lg`}>
                      <span className="text-xs font-medium">{task.category}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-neutral-800">Notifications</h2>
            <div className="card p-6 text-center">
              <Icons.bell className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-600">No new notifications</p>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-neutral-800">Profile</h2>
            <div className="card p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="avatar avatar-xl bg-primary-100 text-primary-600 font-medium">
                  JD
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-neutral-800">John Doe</h3>
                  <p className="text-neutral-600">john@example.com</p>
                  <span className="badge badge-primary mt-1">Admin</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Full Name</label>
                  <input type="text" className="input" defaultValue="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Email</label>
                  <input type="email" className="input" defaultValue="john@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Phone</label>
                  <input type="tel" className="input" placeholder="+1 (555) 000-0000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Role</label>
                  <select className="input">
                    <option>Admin</option>
                    <option>Team Member</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end mt-6 space-x-3">
                <button className="btn btn-secondary">Cancel</button>
                <button className="btn btn-primary">Save Changes</button>
              </div>
            </div>
          </div>
        );

      case 'clients':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-neutral-800">Clients</h2>
              <button className="btn btn-primary">
                <Icons.building className="w-4 h-4 mr-2" />
                Add Client
              </button>
            </div>
            <div className="card p-6 text-center">
              <Icons.building className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-600">No clients added yet</p>
            </div>
          </div>
        );

      case 'team':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-neutral-800">Team</h2>
              <button className="btn btn-primary">
                <Icons.users className="w-4 h-4 mr-2" />
                Add Member
              </button>
            </div>
            <div className="card p-6 text-center">
              <Icons.users className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-600">No team members yet</p>
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-neutral-800">Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Total Tasks</p>
                    <p className="text-2xl font-bold text-neutral-800">24</p>
                  </div>
                  <Icons.tasks className="w-8 h-8 text-primary-500" />
                </div>
              </div>
              <div className="card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Completed</p>
                    <p className="text-2xl font-bold text-green-600">18</p>
                  </div>
                  <Icons.chart className="w-8 h-8 text-green-500" />
                </div>
              </div>
              <div className="card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Active Clients</p>
                    <p className="text-2xl font-bold text-neutral-800">6</p>
                  </div>
                  <Icons.building className="w-8 h-8 text-secondary-500" />
                </div>
              </div>
              <div className="card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Team Members</p>
                    <p className="text-2xl font-bold text-neutral-800">3</p>
                  </div>
                  <Icons.users className="w-8 h-8 text-purple-500" />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            {/* Welcome Header */}
            <div className="bg-gradient-primary rounded-2xl p-6 text-white">
              <h1 className="text-2xl font-bold mb-2">
                {getGreeting()}, John! 👋
              </h1>
              <p className="opacity-90">
                You have {mockTasks.filter(t => t.status === 'scheduled').length} tasks scheduled for today
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <Icons.tasks className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Today's Tasks</p>
                    <p className="text-xl font-bold text-neutral-800">
                      {mockTasks.filter(t => t.status === 'scheduled').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Icons.chart className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Completed</p>
                    <p className="text-xl font-bold text-neutral-800">8</p>
                  </div>
                </div>
              </div>

              <div className="card p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center">
                    <Icons.building className="w-5 h-5 text-secondary-600" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Clients</p>
                    <p className="text-xl font-bold text-neutral-800">6</p>
                  </div>
                </div>
              </div>

              <div className="card p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Icons.users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Team</p>
                    <p className="text-xl font-bold text-neutral-800">3</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Today's Tasks */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-neutral-800">Today's Tasks</h2>
              
              {mockTasks.filter(t => t.status === 'scheduled').map((task) => (
                <div key={task.id} className={`task-card task-priority-${task.priority}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-neutral-800 mb-1">{task.title}</h3>
                      <p className="text-sm text-neutral-600 mb-2">{task.client}</p>
                      <div className="flex items-center space-x-2">
                        <span className={`badge task-status-${task.status}`}>
                          {task.status}
                        </span>
                        <span className="text-xs text-neutral-500">Due: {task.dueTime}</span>
                      </div>
                    </div>
                    <button className="btn btn-primary btn-sm">
                      Mark Complete
                    </button>
                  </div>
                </div>
              ))}

              {mockTasks.filter(t => t.status === 'scheduled').length === 0 && (
                <div className="card p-6 text-center">
                  <Icons.tasks className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                  <p className="text-neutral-600">No tasks scheduled for today</p>
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="animate-fade-in">
      {getPageContent()}
    </div>
  );
};
