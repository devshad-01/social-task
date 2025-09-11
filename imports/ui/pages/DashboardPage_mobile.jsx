import React, { useState, useMemo, useContext } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { useNavigate } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import { TaskModal } from '../components/tasks/TaskModal';
import { TasksCollection } from '../../api/posts/PostsCollections';
import { Mongo } from 'meteor/mongo';
import { useRole } from '../hooks/useRole';
import { NavigationContext } from '../context/NavigationContext';
import { Icons } from '../components/Icons';

// Project Card Component for horizontal scrolling
const ProjectCard = ({ project, onClick }) => {
  const progressPercentage = (project.completed / project.total) * 100;
  
  return (
    <div 
      className="project-card-horizontal" 
      onClick={() => onClick(project)}
    >
      <div className="project-card-header">
        <div className="project-avatar">
          {project.icon || <Icons.briefcase className="w-6 h-6" />}
        </div>
        <div className="project-info">
          <h3 className="project-title">{project.title}</h3>
          <p className="project-date">{project.date}</p>
        </div>
      </div>
      
      <div className="progress-section">
        <div className="progress-bar-container">
          <div 
            className="progress-bar-fill"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
      
      <div className="project-footer">
        <div className="team-avatars">
          {project.team?.slice(0, 3).map((member, index) => (
            <div key={index} className="team-avatar">
              {member.avatar ? (
                <img src={member.avatar} alt={member.name} />
              ) : (
                <span>{member.name?.charAt(0) || '?'}</span>
              )}
            </div>
          ))}
          {project.team?.length > 3 && (
            <div className="team-avatar team-avatar-more">
              +{project.team.length - 3}
            </div>
          )}
        </div>
        <div className="progress-text">
          {project.completed}/{project.total} Finished
        </div>
      </div>
    </div>
  );
};

// Task Row Component for All Tasks section
const TaskRow = ({ task, onView, isExpanded, onToggle }) => {
  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return <Icons.alert className="w-4 h-4 text-red-500" />;
      case 'medium':
        return <Icons.clock className="w-4 h-4 text-amber-500" />;
      default:
        return <Icons.clipboard className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="task-row">
      <div className="task-row-main" onClick={() => onView(task)}>
        <div className="flex items-center space-x-3 flex-1">
          <div className="task-icon">
            {getPriorityIcon(task.priority)}
          </div>
          <div className="task-content flex-1">
            <div className="flex items-center justify-between">
              <h4 className="task-title text-sm font-medium text-gray-900">
                {task.title}
                {task.status === 'scheduled' && (
                  <span className="scheduled-indicator">📅</span>
                )}
              </h4>
              <span className={`text-xs px-2 py-1 rounded-full ${
                task.priority === 'high' ? 'bg-red-100 text-red-800' :
                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {task.priority}
              </span>
            </div>
            <p className="task-subtitle text-xs text-gray-600 mt-1 line-clamp-1">{task.description}</p>
            
            {/* User avatars and client info */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-2">
                {task.client && (
                  <div className="flex items-center space-x-1">
                    <div className="w-4 h-4 rounded bg-gray-200 flex items-center justify-center text-xs">
                      {task.client.name.charAt(0)}
                    </div>
                    <span className="text-xs text-gray-500">{task.client.name}</span>
                  </div>
                )}
                
                {task.assignees && task.assignees.length > 0 && (
                  <div className="flex items-center space-x-1">
                    <div className="flex -space-x-1">
                      {task.assignees.slice(0, 2).map((assignee) => (
                        <div 
                          key={assignee._id} 
                          className="w-6 h-6 rounded-full bg-gray-200 border border-white flex items-center justify-center text-xs font-medium text-gray-600 overflow-hidden"
                          title={assignee.profile?.firstName ? `${assignee.profile.firstName} ${assignee.profile.lastName}` : assignee.emails?.[0]?.address || 'Unknown User'}
                        >
                          {assignee.profile?.avatar ? (
                            <img 
                              src={assignee.profile.avatar} 
                              alt={assignee.profile?.firstName || 'User'} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>
                              {assignee.profile?.firstName?.charAt(0)?.toUpperCase() || 
                               assignee.emails?.[0]?.address?.charAt(0)?.toUpperCase() || '?'}
                            </span>
                          )}
                        </div>
                      ))}
                      {task.assignees.length > 2 && (
                        <div className="w-6 h-6 rounded-full bg-gray-100 border border-white flex items-center justify-center text-xs font-medium text-gray-500">
                          +{task.assignees.length - 2}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <span className="text-xs text-gray-500">
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        <button 
          className="task-arrow ml-2"
          onClick={(e) => {
            e.stopPropagation();
            onToggle(task._id);
          }}
        >
          <Icons.chevronDown 
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
          />
        </button>
      </div>
      
      {isExpanded && (
        <div className="task-row-expanded">
          <div className="task-details">
            <div className="task-detail-item">
              <span className="task-detail-label">Due Date:</span>
              <span className="task-detail-value">
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            </div>
            <div className="task-detail-item">
              <span className="task-detail-label">Status:</span>
              <span className={`task-status task-status-${task.status}`}>
                {task.status.replace('_', ' ')}
              </span>
            </div>
            <div className="task-detail-item">
              <span className="task-detail-label">Priority:</span>
              <span className={`task-priority task-priority-${task.priority}`}>
                {task.priority}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Floating Action Button Component
const FloatingActionButton = ({ onClick }) => (
  <button className="floating-action-button" onClick={onClick}>
    <Icons.plus className="w-6 h-6" />
  </button>
);

// Bottom Navigation Component
const BottomNavigation = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'dashboard', icon: Icons.home, label: 'Home' },
    { id: 'analytics', icon: Icons.chart, label: 'Charts' },
    { id: 'calendar', icon: Icons.calendar, label: 'Calendar' },
    { id: 'settings', icon: Icons.settings, label: 'Settings' }
  ];

  return (
    <div className="bottom-navigation">
      <div className="bottom-nav-container">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`bottom-nav-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <tab.icon className="bottom-nav-icon" />
            <span className="bottom-nav-label">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export const DashboardPage = () => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTasks, setExpandedTasks] = useState(new Set());
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();
  const { canCreateTasks, unreadCount } = useContext(NavigationContext);
  const { isAdmin, isTeamMember } = useRole();

  const { user, tasks, clients, users, loading, error } = useTracker(() => {
    const tasksHandle = Meteor.subscribe('tasks.all');
    const usersHandle = Meteor.subscribe('users.all');
    const clientsHandle = Meteor.subscribe('clients.all');
    
    const loading = !tasksHandle.ready() || !usersHandle.ready() || !clientsHandle.ready();
    
    return {
      user: Meteor.user(),
      tasks: TasksCollection.find({}, { sort: { createdAt: -1 } }).fetch(),
      clients: Mongo.Collection.get('clients')?.find({}).fetch() || [],
      users: Meteor.users.find({}).fetch(),
      loading,
      error: null
    };
  }, []);

  // Function to enhance tasks with user and client data
  const enhanceTasksWithUsers = (tasks) => {
    return tasks.map(task => {
      const enhancedTask = { ...task };
      
      // Add client data
      if (task.clientId) {
        enhancedTask.client = clients.find(client => client._id === task.clientId);
      }
      
      // Add assignee user data
      if (task.assigneeIds && task.assigneeIds.length > 0) {
        enhancedTask.assignees = task.assigneeIds
          .map(assigneeId => users.find(user => user._id === assigneeId))
          .filter(Boolean);
      }
      
      return enhancedTask;
    });
  };

  // Get enhanced tasks with user data
  const enhancedTasks = useMemo(() => {
    if (!tasks || !users || !clients) return [];
    return enhanceTasksWithUsers(tasks);
  }, [tasks, users, clients]);

  // Filter tasks based on role
  const roleFilteredTasks = useMemo(() => {
    if (!user || !enhancedTasks) return [];
    
    if (isAdmin) {
      // Admins can see all tasks
      return enhancedTasks;
    } else if (isTeamMember) {
      // Team members only see tasks assigned to them
      return enhancedTasks.filter(task => 
        task.assigneeIds && task.assigneeIds.includes(user._id)
      );
    }
    
    return [];
  }, [enhancedTasks, user, isAdmin, isTeamMember]);

  const filteredTasks = useMemo(() => {
    if (!searchQuery) return roleFilteredTasks;
    return roleFilteredTasks.filter(task => 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [roleFilteredTasks, searchQuery]);

  const stats = useMemo(() => {
    const completedTasks = roleFilteredTasks.filter(task => task.status === 'completed');
    const inProgressTasks = roleFilteredTasks.filter(task => task.status === 'in_progress');
    const pendingTasks = roleFilteredTasks.filter(task => task.status === 'pending');
    
    return {
      total: roleFilteredTasks.length,
      completed: completedTasks.length,
      inProgress: inProgressTasks.length,
      pending: pendingTasks.length
    };
  }, [roleFilteredTasks]);

  // Mock projects data - replace with real data from your API
  const projects = useMemo(() => [
    {
      id: 1,
      title: 'Website Redesign',
      date: 'Due Dec 20',
      completed: 9,
      total: 20,
      icon: <Icons.briefcase className="w-6 h-6" />,
      team: [
        { name: 'John', avatar: null },
        { name: 'Jane', avatar: null },
        { name: 'Bob', avatar: null },
        { name: 'Alice', avatar: null },
      ]
    },
    {
      id: 2,
      title: 'Mobile App',
      date: 'Due Jan 15',
      completed: 5,
      total: 12,
      icon: <Icons.heart className="w-6 h-6" />,
      team: [
        { name: 'Mike', avatar: null },
        { name: 'Sarah', avatar: null },
      ]
    },
    {
      id: 3,
      title: 'Marketing Campaign',
      date: 'Due Nov 30',
      completed: 3,
      total: 8,
      icon: <Icons.chart className="w-6 h-6" />,
      team: [
        { name: 'Tom', avatar: null },
        { name: 'Lisa', avatar: null },
        { name: 'David', avatar: null },
      ]
    }
  ], []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const userName = user?.profile?.firstName || user?.username || 'there';
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const handleTaskView = (task) => {
    navigate(`/tasks/${task._id}`);
  };

  const handleProjectClick = (project) => {
    // Navigate to project details or handle project click
    console.log('Project clicked:', project);
  };

  const handleTaskToggle = (taskId) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    switch (tabId) {
      case 'analytics':
        navigate('/analytics');
        break;
      case 'calendar':
        navigate('/calendar');
        break;
      case 'settings':
        navigate('/settings');
        break;
      default:
        // Stay on dashboard
        break;
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-content">
          <div className="dashboard-skeleton">
            <div className="mobile-skeleton mobile-skeleton-title"></div>
            <div className="mobile-skeleton mobile-skeleton-text"></div>
            <div className="mobile-skeleton mobile-skeleton-card"></div>
          </div>
        </div>
        <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-content">
          <div className="error-state">
            <Icons.alert className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Dashboard</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
        <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        {/* Header Section */}
        <div className="dashboard-header">
          <div className="welcome-section">
            <h1 className="welcome-title">
              {getGreeting()}, {userName}! 👋
            </h1>
            <p className="welcome-subtitle">
              You have {stats.total} task{stats.total !== 1 ? 's' : ''} today
            </p>
          </div>
          <button className="notification-button">
            <Icons.bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="search-filter-bar">
          <div className="search-input-wrapper">
            <Icons.search className="search-icon" />
            <input
              type="text"
              placeholder="Search tasks..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="filter-button">
            <Icons.menu className="w-5 h-5" />
          </button>
        </div>

        {/* Date Header */}
        <div className="date-header">
          <h2 className="date-title">Today</h2>
          <p className="date-text">{today}</p>
        </div>

        {/* Main Content Cards */}
        <div className="projects-section">
          <h3 className="section-title">Projects</h3>
          <div className="projects-scroll">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={handleProjectClick}
              />
            ))}
          </div>
        </div>

        {/* All Tasks Section */}
        <div className="tasks-section">
          <div className="section-header">
            <h3 className="section-title">All Tasks</h3>
            <button 
              className="see-all-link"
              onClick={() => navigate('/tasks')}
            >
              See All
            </button>
          </div>
          
          <div className="tasks-list">
            {filteredTasks.slice(0, 5).map((task) => (
              <TaskRow
                key={task._id}
                task={task}
                onView={handleTaskView}
                isExpanded={expandedTasks.has(task._id)}
                onToggle={handleTaskToggle}
              />
            ))}
            
            {filteredTasks.length === 0 && (
              <div className="empty-state">
                <Icons.clipboard className="w-12 h-12 text-neutral-400 mb-4" />
                <p className="text-neutral-600">No tasks found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      {canCreateTasks && (
        <FloatingActionButton onClick={() => navigate('/add-task')} />
      )}

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};
