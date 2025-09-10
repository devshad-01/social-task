import React, { useState, useMemo, useContext } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { useNavigate } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { MobileLoader } from '../components/common/MobileLoader';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskModal } from '../components/tasks/TaskModal';
import { useTasks } from '../hooks/useTasks';
import { NavigationContext } from '../context/NavigationContext';
import { ResponsiveContext } from '../context/ResponsiveContext';
import { Icons } from '../components/Icons';
import { ClientsCollection } from '../../api/clients/ClientsCollection';
import { Tasks } from '../../api/tasks/TasksCollection';

// Mobile-specific components
const MobileTaskCard = ({ taskCard, onClick }) => {
  const progressPercentage = taskCard.total > 0 ? (taskCard.completed / taskCard.total) * 100 : 0;
  
  const getUrgencyIndicator = (urgency) => {
    switch (urgency) {
      case 'critical':
        return <div className="urgency-indicator urgency-critical"></div>;
      case 'high':
        return <div className="urgency-indicator urgency-high"></div>;
      case 'medium':
        return <div className="urgency-indicator urgency-medium"></div>;
      default:
        return null;
    }
  };
  
  return (
    <div 
      className={`task-card-swipe task-card-${taskCard.color}`}
      onClick={() => onClick(taskCard)}
    >
      {getUrgencyIndicator(taskCard.urgency)}
      
      <div className="task-card-content">
        <div className="task-header-section">
          <div className="task-icon-wrapper">
            {taskCard.icon}
          </div>
          <div className="task-text-info">
            <h3 className="task-card-title">{taskCard.title}</h3>
            <p className="task-card-subtitle">{taskCard.subtitle}</p>
          </div>
          <div className="task-status-badge">
            <span className="status-text">{taskCard.dueInfo}</span>
          </div>
        </div>
        
        <div className="progress-section-enhanced">
          <div className="progress-stats">
            <span className="progress-label">Progress</span>
            <span className="progress-percentage">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="progress-bar-enhanced">
            <div 
              className="progress-fill-enhanced"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="task-count-info">
            <span className="tasks-completed">{taskCard.completed} of {taskCard.total} completed</span>
          </div>
        </div>

        {/* User Avatars Section */}
        <div className="task-users-section">
          <div className="task-users-avatars">
            {taskCard.users?.slice(0, 3).map((user, index) => (
              <div key={user.id || index} className="task-user-avatar">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} />
                ) : (
                  <span>{user.name?.charAt(0)?.toUpperCase() || '?'}</span>
                )}
              </div>
            ))}
            {taskCard.users?.length > 3 && (
              <div className="task-user-avatar task-user-more">
                +{taskCard.users.length - 3}
              </div>
            )}
          </div>
          {taskCard.tasks?.length > 0 && (
            <div className="recent-task-preview">
              <span className="recent-task-label">Latest:</span>
              <span className="recent-task-title">
                {taskCard.tasks[0]?.title || 'No tasks'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

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
        <div className="task-icon">
          {getPriorityIcon(task.priority)}
        </div>
        
        <div className="task-content">
          <div className="task-main-info">
            <h4 className="task-title">{task.title}</h4>
            <span className={`task-priority-mini task-priority-${task.priority}`}>
              {task.priority}
            </span>
          </div>
          
          <p className="task-subtitle">{task.description}</p>
          
          <div className="task-bottom-info">
            <div className="task-people-section">
              {task.client && (
                <div className="task-client-mini">
                  <div className="task-client-avatar-mini">
                    {task.client.name.charAt(0)}
                  </div>
                  <span className="task-client-name-mini">{task.client.name}</span>
                </div>
              )}
              
              {task.assignees && task.assignees.length > 0 && (
                <div className="task-assignees-mini">
                  {task.assignees.slice(0, 3).map((assignee) => (
                    <div 
                      key={assignee._id} 
                      className="task-assignee-avatar-mini"
                      title={assignee.profile?.firstName ? `${assignee.profile.firstName} ${assignee.profile.lastName}` : assignee.emails?.[0]?.address || 'Unknown User'}
                    >
                      {assignee.profile?.avatar ? (
                        <img 
                          src={assignee.profile.avatar} 
                          alt={assignee.profile?.firstName || 'User'} 
                        />
                      ) : (
                        <span>
                          {assignee.profile?.firstName?.charAt(0)?.toUpperCase() || 
                           assignee.emails?.[0]?.address?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      )}
                    </div>
                  ))}
                  {task.assignees.length > 3 && (
                    <div className="task-assignee-avatar-mini">
                      +{task.assignees.length - 3}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <span className="task-date-mini">
              {new Date(task.dueDate).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>
        
        <button 
          className="task-arrow"
          onClick={(e) => {
            e.stopPropagation();
            onToggle(task._id);
          }}
        >
          <Icons.chevronDown 
            className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
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
            {task.assignees && task.assignees.length > 0 && (
              <div className="task-detail-item">
                <span className="task-detail-label">Assigned to:</span>
                <div className="task-assignees-list">
                  {task.assignees.map((assignee) => (
                    <span key={assignee._id} className="task-assignee-name">
                      {assignee.profile?.firstName 
                        ? `${assignee.profile.firstName} ${assignee.profile.lastName || ''}`
                        : assignee.emails?.[0]?.address || 'Unknown User'}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const FloatingActionButton = ({ onClick }) => (
  <button className="floating-action-button" onClick={onClick}>
    <Icons.plus className="w-6 h-6" />
  </button>
);

export const DashboardPage = ({ activeTab }) => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTasks, setExpandedTasks] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();
  const { canCreateTasks, unreadCount } = useContext(NavigationContext);
  const { isMobileOrTablet } = useContext(ResponsiveContext);

  const { user } = useTracker(() => ({
    user: Meteor.user()
  }), []);

  // Track clients and tasks for projects
  const { clients, clientTasks, users } = useTracker(() => {
    const clientsHandler = Meteor.subscribe('clients');
    const tasksHandler = Meteor.subscribe('tasks.all');
    const usersHandler = Meteor.subscribe('users.all');
    
    return {
      clients: clientsHandler.ready() ? ClientsCollection.find({}).fetch() : [],
      clientTasks: tasksHandler.ready() ? Tasks.find({}).fetch() : [],
      users: usersHandler.ready() ? Meteor.users.find({}).fetch() : []
    };
  }, []);

  const isAdmin = user && Roles.userIsInRole(user._id, ['admin', 'supervisor']);

  const { 
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    updateStatus,
    getTaskStats 
  } = useTasks();

  // Helper function to enhance tasks with user data
  const enhanceTasksWithUsers = (tasksList) => {
    return tasksList.map(task => ({
      ...task,
      assignees: task.assigneeIds?.map(userId => 
        users.find(user => user._id === userId)
      ).filter(Boolean) || []
    }));
  };

  const todaysTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const filteredTasks = tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      const isToday = taskDate >= today && taskDate < tomorrow;
      
      // If admin, show all today's tasks
      if (isAdmin) {
        return isToday;
      }
      
      // If team member, show only assigned tasks
      const userId = Meteor.userId();
      return isToday && (task.assigneeIds?.includes(userId) || task.createdBy === userId);
    }).sort((a, b) => {
      // Sort by priority (high first) then by due date
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });
    
    return enhanceTasksWithUsers(filteredTasks);
  }, [tasks, isAdmin, users]);

  const overdueTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const filteredTasks = tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      const isOverdue = taskDate < today && task.status !== 'completed';
      
      // If admin, show all overdue tasks
      if (isAdmin) {
        return isOverdue;
      }
      
      // If team member, show only assigned overdue tasks
      const userId = Meteor.userId();
      return isOverdue && (task.assigneeIds?.includes(userId) || task.createdBy === userId);
    }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    
    return enhanceTasksWithUsers(filteredTasks);
  }, [tasks, isAdmin, users]);

  const highPriorityTasks = useMemo(() => {
    const filteredTasks = tasks.filter(task => {
      const isHighPriority = task.priority === 'high' && task.status !== 'completed';
      
      // If admin, show all high priority tasks
      if (isAdmin) {
        return isHighPriority;
      }
      
      // If team member, show only assigned high priority tasks
      const userId = Meteor.userId();
      return isHighPriority && (task.assigneeIds?.includes(userId) || task.createdBy === userId);
    }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    
    return enhanceTasksWithUsers(filteredTasks);
  }, [tasks, isAdmin, users]);

  const stats = useMemo(() => {
    const taskStats = getTaskStats();
    return {
      tasksToday: todaysTasks.length,
      overdue: overdueTasks.length,
      highPriority: highPriorityTasks.length,
      completed: taskStats.completed,
      inProgress: taskStats.in_progress
    };
  }, [todaysTasks, overdueTasks, highPriorityTasks, getTaskStats]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const userName = user?.profile?.firstName || user?.username || 'there';

  const handleTaskComplete = async (task) => {
    try {
      await updateStatus(task._id, 'completed');
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const handleTaskView = (task) => {
    // Navigate to task details page instead of modal
    navigate(`/tasks/${task._id}`);
  };

  const handleCreateTask = async (taskData) => {
    try {
      await createTask(taskData);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleUpdateTask = async (taskData) => {
    try {
      await updateTask(selectedTask._id, taskData);
      setIsTaskModalOpen(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  // Smart task cards with priority-based logic
  // Smart task cards algorithm with minimum 2 cards guarantee and real API data
  const taskCards = useMemo(() => {
    const now = new Date();
    const allTaskCards = [];

    // Helper function to get user avatars for tasks
    const getUsersForTasks = (tasks) => {
      const assignedUserIds = [...new Set(tasks.flatMap(task => task.assigneeIds || []))];
      return assignedUserIds.slice(0, 4).map(userId => {
        const user = Meteor.users.findOne(userId);
        return {
          id: userId,
          name: user?.profile?.firstName || user?.username || 'User',
          avatar: user?.profile?.avatar || null
        };
      });
    };

    if (clientTasks.length > 0) {
      // 1. CRITICAL: Overdue Tasks (highest priority)
      const overdueTasks = clientTasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        return taskDate < now && task.status !== 'completed';
      });
      
      if (overdueTasks.length > 0) {
        allTaskCards.push({
          id: 'overdue-tasks',
          title: 'Overdue Tasks',
          subtitle: `${overdueTasks.length} past due`,
          completed: 0,
          total: overdueTasks.length,
          priority: 'overdue',
          urgency: 'critical',
          icon: <Icons.alert className="w-6 h-6" />,
          dueInfo: 'Overdue',
          color: 'red',
          tasks: overdueTasks.slice(0, 3),
          users: getUsersForTasks(overdueTasks)
        });
      }

      // 2. URGENT: High Priority Tasks due soon
      const highPriorityTasks = clientTasks.filter(task => 
        task.priority === 'high' && task.status !== 'completed'
      );
      
      if (highPriorityTasks.length > 0) {
        const urgent = highPriorityTasks.filter(task => {
          const dueDate = new Date(task.dueDate);
          const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
          return diffDays <= 3; // Due within 3 days
        });
        
        allTaskCards.push({
          id: 'urgent-tasks',
          title: urgent.length > 0 ? 'Urgent Tasks' : 'High Priority',
          subtitle: urgent.length > 0 ? `${urgent.length} due soon` : `${highPriorityTasks.length} high priority`,
          completed: highPriorityTasks.filter(t => t.status === 'completed').length,
          total: highPriorityTasks.length,
          priority: 'high',
          urgency: urgent.length > 0 ? 'critical' : 'high',
          icon: urgent.length > 0 ? <Icons.zap className="w-6 h-6" /> : <Icons.star className="w-6 h-6" />,
          dueInfo: urgent.length > 0 ? 'Critical' : 'High Priority',
          color: urgent.length > 0 ? 'orange' : 'yellow',
          tasks: highPriorityTasks.slice(0, 3),
          users: getUsersForTasks(highPriorityTasks)
        });
      }

      // 3. TODAY: Today's Tasks
      const todayTasks = clientTasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return taskDate >= today && taskDate < tomorrow;
      });
      
      if (todayTasks.length > 0) {
        allTaskCards.push({
          id: 'today-tasks',
          title: "Today's Focus",
          subtitle: `${todayTasks.length} tasks due today`,
          completed: todayTasks.filter(t => t.status === 'completed').length,
          total: todayTasks.length,
          priority: 'today',
          urgency: 'medium',
          icon: <Icons.calendar className="w-6 h-6" />,
          dueInfo: 'Today',
          color: 'blue',
          tasks: todayTasks.slice(0, 3),
          users: getUsersForTasks(todayTasks)
        });
      }

      // 4. IN PROGRESS: Active Work
      const inProgressTasks = clientTasks.filter(task => task.status === 'in_progress');
      if (inProgressTasks.length > 0) {
        allTaskCards.push({
          id: 'in-progress',
          title: 'Active Work',
          subtitle: `${inProgressTasks.length} yet to complete`,
          completed: 0,
          total: inProgressTasks.length,
          priority: 'active',
          urgency: 'medium',
          icon: <Icons.play className="w-6 h-6" />,
          dueInfo: 'In Progress',
          color: 'green',
          tasks: inProgressTasks.slice(0, 3),
          users: getUsersForTasks(inProgressTasks)
        });
      }

      // 5. PENDING: Draft or Scheduled Tasks
      const pendingTasks = clientTasks.filter(task => 
        task.status === 'draft' || task.status === 'scheduled'
      );
      
      if (pendingTasks.length > 0) {
        allTaskCards.push({
          id: 'pending-tasks',
          title: 'Pending Tasks',
          subtitle: `${pendingTasks.length} yet to start`,
          completed: 0,
          total: pendingTasks.length,
          priority: 'pending',
          urgency: 'low',
          icon: <Icons.clock className="w-6 h-6" />,
          dueInfo: 'Pending',
          color: 'purple',
          tasks: pendingTasks.slice(0, 3),
          users: getUsersForTasks(pendingTasks)
        });
      }

      // 6. COMPLETED: Recently Completed (for motivation)
      const recentlyCompleted = clientTasks.filter(task => {
        if (task.status !== 'completed') return false;
        const completedDate = new Date(task.completedAt || task.updatedAt);
        const daysSinceCompleted = Math.ceil((now - completedDate) / (1000 * 60 * 60 * 24));
        return daysSinceCompleted <= 7; // Completed within last 7 days
      });
      
      if (recentlyCompleted.length > 0 && allTaskCards.length < 6) {
        allTaskCards.push({
          id: 'completed-recent',
          title: 'Recently Completed',
          subtitle: `${recentlyCompleted.length} completed this week`,
          completed: recentlyCompleted.length,
          total: recentlyCompleted.length,
          priority: 'completed',
          urgency: 'low',
          icon: <Icons.check className="w-6 h-6" />,
          dueInfo: 'Completed',
          color: 'green',
          tasks: recentlyCompleted.slice(0, 3),
          users: getUsersForTasks(recentlyCompleted)
        });
      }
    }

      // GUARANTEE MINIMUM 2 CARDS: Create fallback cards with real data if needed
      if (allTaskCards.length < 2) {
        // Get any available tasks to create meaningful cards
        const allAvailableTasks = clientTasks.length > 0 ? clientTasks : tasks;
        
        if (allAvailableTasks.length > 0) {
          // Add "All Tasks" overview card with detailed info
          const totalTasks = allAvailableTasks.length;
          const completedTasks = allAvailableTasks.filter(t => t.status === 'completed').length;
          const pendingTasks = totalTasks - completedTasks;
          
          allTaskCards.push({
            id: 'all-tasks',
            title: 'All Tasks',
            subtitle: `${pendingTasks} yet to complete`,
            completed: completedTasks,
            total: totalTasks,
            priority: 'overview',
            urgency: 'low',
            icon: <Icons.list className="w-6 h-6" />,
            dueInfo: 'Overview',
            color: 'blue',
            tasks: allAvailableTasks.slice(0, 5), // More tasks for detailed view
            users: getUsersForTasks(allAvailableTasks)
          });

          // Add "Team Tasks" card if multiple users are involved
          const teamTasks = allAvailableTasks.filter(task => task.assigneeIds && task.assigneeIds.length > 0);
          if (teamTasks.length > 0 && allTaskCards.length < 2) {
            const teamCompletedTasks = teamTasks.filter(t => t.status === 'completed').length;
            const teamPendingTasks = teamTasks.length - teamCompletedTasks;
            
            allTaskCards.push({
              id: 'team-tasks',
              title: 'Team Tasks',
              subtitle: `${teamPendingTasks} yet to complete`,
              completed: teamCompletedTasks,
              total: teamTasks.length,
              priority: 'team',
              urgency: 'medium',
              icon: <Icons.users className="w-6 h-6" />,
              dueInfo: 'Team Work',
              color: 'purple',
              tasks: teamTasks.slice(0, 5),
              users: getUsersForTasks(teamTasks)
            });
          }
        } else {
          // No tasks exist - create motivational cards
          allTaskCards.push({
            id: 'create-first-task',
            title: 'Create Your First Task',
            subtitle: 'Start organizing your work',
            completed: 0,
            total: 0,
            priority: 'start',
            urgency: 'low',
            icon: <Icons.plus className="w-6 h-6" />,
            dueInfo: 'Get Started',
            color: 'blue',
            tasks: [],
            users: [{
              id: 'current-user',
              name: userName,
              avatar: user?.profile?.avatar || null
            }]
          });

          allTaskCards.push({
            id: 'task-management',
            title: 'Task Management',
            subtitle: 'Organize and track your work efficiently',
            completed: 0,
            total: 0,
            priority: 'info',
            urgency: 'low',
            icon: <Icons.target className="w-6 h-6" />,
            dueInfo: 'Learn More',
            color: 'gray',
            tasks: [],
            users: [{
              id: 'current-user',
              name: userName,
              avatar: user?.profile?.avatar || null
            }]
          });
        }
      }    // Sort by priority: overdue -> high -> today -> active -> pending -> completed -> others
    const priorityOrder = {
      'overdue': 1,
      'high': 2,
      'today': 3,
      'active': 4,
      'pending': 5,
      'completed': 6,
      'upcoming': 7,
      'overview': 8,
      'start': 9,
      'info': 10
    };

    return allTaskCards
      .sort((a, b) => {
        const aPriority = priorityOrder[a.priority] || 10;
        const bPriority = priorityOrder[b.priority] || 10;
        if (aPriority !== bPriority) return aPriority - bPriority;
        return b.total - a.total; // Then by task count
      })
      .slice(0, 6); // Show max 6 cards for optimal mobile scrolling
  }, [clientTasks, tasks, user, userName]);

  const filteredTasks = useMemo(() => {
    let filtered = tasks;
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }
    
    return filtered;
  }, [tasks, searchQuery, statusFilter]);

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const handleTaskCardClick = (taskCard) => {
    // If it's a specific task type, navigate to the tasks page with filter
    if (taskCard.id === 'urgent-tasks' || taskCard.id === 'overdue-tasks' || 
        taskCard.id === 'today-tasks' || taskCard.id === 'in-progress' || 
        taskCard.id === 'recent-tasks') {
      navigate('/tasks');
    } else if (taskCard.tasks && taskCard.tasks.length > 0) {
      // If there's a specific task, navigate to that task's details
      navigate(`/task/${taskCard.tasks[0]._id}`);
    } else {
      // Default to tasks page
      navigate('/tasks');
    }
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

  if (loading) {
    if (isMobileOrTablet) {
      return (
        <div className="dashboard-container">
          <MobileLoader 
            type="skeleton" 
            message="Loading dashboard..." 
            showMessage={false}
          />
        </div>
      );
    }
    return <div className="p-6 text-center">Loading dashboard...</div>;
  }

  if (error) {
    if (isMobileOrTablet) {
      return (
        <div className="dashboard-container">
          <div className="mobile-loader-container">
            <div className="mobile-loader-content">
              <Icons.alert className="w-12 h-12 text-red-500" />
              <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Dashboard</h3>
              <p className="text-red-600 text-center">{error}</p>
            </div>
          </div>
        </div>
      );
    }
    return <div className="p-6 text-center text-red-600">Error loading dashboard: {error}</div>;
  }

  // Mobile-specific rendering
  if (isMobileOrTablet) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-content">
          {/* Search and Filter Bar */}
          <div className="search-filter-bar">
            <div className="search-input-wrapper">
              <Icons.searchCustom className="search-icon-custom" />
              <input
                type="text"
                placeholder="Search tasks..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="filter-wrapper">
              <button 
                className="filter-button-theme"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Icons.filter className="w-5 h-5" />
              </button>
              
              {showFilters && (
                <div className="filter-dropdown">
                  <div className="filter-option">
                    <label>Status:</label>
                    <select 
                      value={statusFilter} 
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="filter-select"
                    >
                      <option value="all">All Tasks</option>
                      <option value="draft">Draft</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="blocked">Blocked</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Smart Task Cards Section - Dynamic content */}
          {taskCards.length > 0 && (
            <div className="tasks-section-enhanced">
              <div className="tasks-header">
                <div className="tasks-title-section">
                  <h3 className="dynamic-section-title">
                    {taskCards.some(c => c.urgency === 'critical') ? 'Priority Tasks' : 
                     taskCards.some(c => c.priority === 'today') ? 'Today\'s Tasks' : 'Active Tasks'}
                  </h3>
                  <p className="tasks-subtitle">
                    {taskCards.filter(c => c.urgency === 'critical').length > 0 && 
                      `${taskCards.filter(c => c.urgency === 'critical').length} urgent • `}
                    {taskCards.reduce((sum, card) => sum + card.total, 0)} total tasks
                  </p>
                </div>
                <button 
                  className="view-all-tasks"
                  onClick={() => navigate('/tasks')}
                >
                  View All
                </button>
              </div>
              
              <div className="tasks-scroll-enhanced">
                {taskCards.map((taskCard) => (
                  <MobileTaskCard
                    key={taskCard.id}
                    taskCard={taskCard}
                    onClick={handleTaskCardClick}
                  />
                ))}
              </div>
            </div>
          )}

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

        {/* Task Details Modal */}
        {selectedTask && (
          <TaskModal
            isOpen={isTaskModalOpen}
            onClose={() => {
              setIsTaskModalOpen(false);
              setSelectedTask(null);
            }}
            task={selectedTask}
            readOnly={true}
          />
        )}
      </div>
    );
  }

  // Desktop rendering (original layout)
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{getGreeting()}, {userName}</h1>
          <p className="text-gray-600">
            {isAdmin ? "Here's your team's task overview" : "Here's what's on your plate today"}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/notifications')}
            className="relative"
          >
            {React.createElement(Icons.bell, { className: "h-4 w-4 mr-2" })}
            Notifications
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-5 h-5 flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Button>
          <Button variant="outline" size="sm">
            {React.createElement(Icons.download, { className: "h-4 w-4 mr-2" })}
            Export
          </Button>
          {canCreateTasks && (
            <Button variant="primary" size="sm" onClick={() => navigate('/add-task')}>
              {React.createElement(Icons.plus, { className: "h-4 w-4 mr-2" })}
              New Task
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardContent padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Tasks</p>
                <p className="text-2xl font-bold text-blue-600">{stats.tasksToday}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                {React.createElement(Icons.calendar, { className: "h-6 w-6 text-blue-600" })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-purple-600">{stats.inProgress}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                {React.createElement(Icons.clipboard, { className: "h-6 w-6 text-purple-600" })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                {React.createElement(Icons.check, { className: "h-6 w-6 text-green-600" })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-orange-600">{stats.highPriority}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                {React.createElement(Icons.bell, { className: "h-6 w-6 text-orange-600" })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                {React.createElement(Icons.bell, { className: "h-6 w-6 text-red-600" })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Priority Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue Tasks */}
        {overdueTasks.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-red-600">⚠️ Overdue Tasks</CardTitle>
                <Badge variant="error">{overdueTasks.length} overdue</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {overdueTasks.slice(0, 3).map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onComplete={handleTaskComplete}
                    onView={handleTaskView}
                    compact={true}
                  />
                ))}
                {overdueTasks.length > 3 && (
                  <div className="text-center pt-2">
                    <Button variant="outline" size="sm">
                      View All {overdueTasks.length} Overdue Tasks
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Today's Tasks */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>📅 Today's Tasks</CardTitle>
              <Badge variant="primary">{todaysTasks.length} tasks</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {todaysTasks.length === 0 ? (
              <EmptyState
                illustration={React.createElement(Icons.calendar, { className: "mx-auto h-12 w-12 text-gray-400" })}
                title="No tasks for today"
                description="You're all caught up! No tasks are scheduled for today."
              />
            ) : (
              <div className="space-y-3">
                {todaysTasks.slice(0, 3).map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onComplete={handleTaskComplete}
                    onView={handleTaskView}
                    compact={true}
                  />
                ))}
                {todaysTasks.length > 3 && (
                  <div className="text-center pt-2">
                    <Button variant="outline" size="sm">
                      View All {todaysTasks.length} Today's Tasks
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* High Priority Tasks */}
      {highPriorityTasks.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-orange-600">🔥 High Priority Tasks</CardTitle>
              <Badge variant="warning">{highPriorityTasks.length} high priority</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {highPriorityTasks.slice(0, 6).map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onComplete={handleTaskComplete}
                  onView={handleTaskView}
                  compact={true}
                />
              ))}
            </div>
            {highPriorityTasks.length > 6 && (
              <div className="text-center pt-4">
                <Button variant="outline" size="sm">
                  View All {highPriorityTasks.length} High Priority Tasks
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Task Modal */}
      {/* Task Details Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleUpdateTask}
        task={selectedTask}
        mode="view"
      />
    </div>
  );
};
