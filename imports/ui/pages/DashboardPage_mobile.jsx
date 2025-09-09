import React, { useState, useMemo, useContext } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { useNavigate } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import { TaskModal } from '../components/tasks/TaskModal';
import { useTasks } from '../hooks/useTasks';
import { NavigationContext } from '../context/NavigationContext';
import { Icons } from '../components/Icons';

// Modern Mobile Task Card Component
const MobileTaskCard = ({ task, onComplete, onView }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'in_progress':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatDueDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDate = new Date(date);
    taskDate.setHours(0, 0, 0, 0);
    
    const diffTime = taskDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    return `${diffDays} days left`;
  };

  const isOverdue = new Date(task.dueDate) < new Date();

  return (
    <div className="mobile-list-item" onClick={() => onView(task)}>
      <div className="item-icon">
        <Icons.clipboard className="w-5 h-5" />
      </div>
      <div className="item-content">
        <div className="item-title">{task.title}</div>
        <div className="item-subtitle">{task.description}</div>
        <div className="flex gap-2 mt-2">
          <span className={`px-2 py-1 rounded-md text-xs font-semibold border ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
          <span className={`px-2 py-1 rounded-md text-xs font-semibold border ${getStatusColor(task.status)}`}>
            {task.status.replace('_', ' ')}
          </span>
        </div>
      </div>
      <div className="item-meta">
        <div className={`item-time ${isOverdue ? 'text-red-600 font-semibold' : ''}`}>
          {formatDueDate(task.dueDate)}
        </div>
        {task.status !== 'completed' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onComplete(task);
            }}
            className="mt-2 p-2 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
          >
            <Icons.check className="w-4 h-4 text-green-600" />
          </button>
        )}
      </div>
    </div>
  );
};

export const DashboardPage = () => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const navigate = useNavigate();
  const { canCreateTasks, unreadCount } = useContext(NavigationContext);

  const { user } = useTracker(() => ({
    user: Meteor.user()
  }), []);

  const isAdmin = user && Roles.userIsInRole(user._id, ['admin', 'supervisor']);

  const { 
    tasks,
    loading,
    error,
    updateStatus,
    getTaskStats 
  } = useTasks();

  const todaysTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return taskDate >= today && taskDate < tomorrow;
    }).sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });
  }, [tasks]);

  const overdueTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return taskDate < today && task.status !== 'completed';
    }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }, [tasks]);

  const highPriorityTasks = useMemo(() => {
    return tasks.filter(task => 
      task.priority === 'high' && task.status !== 'completed'
    ).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }, [tasks]);

  const recentTasks = useMemo(() => {
    return tasks
      .filter(task => task.status !== 'completed')
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5);
  }, [tasks]);

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
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  if (loading) {
    return (
      <div className="mobile-content-enhanced">
        <div className="space-y-4">
          <div className="mobile-skeleton mobile-skeleton-title"></div>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="mobile-card-modern">
                <div className="card-content">
                  <div className="mobile-skeleton mobile-skeleton-text"></div>
                  <div className="mobile-skeleton mobile-skeleton-text"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mobile-content-enhanced">
        <div className="mobile-card-modern">
          <div className="card-content text-center py-12">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icons.alert className="h-10 w-10 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Dashboard</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-content-enhanced">
      {/* Welcome Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 mb-1">
          {getGreeting()}, {userName}! 👋
        </h1>
        <p className="text-neutral-600">
          {isAdmin ? "Here's your team's overview" : "Here's what's on your plate"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="mobile-card-modern">
          <div className="card-content text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Icons.calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-600 mb-1">{stats.tasksToday}</div>
            <div className="text-sm text-neutral-600 font-medium">Today</div>
          </div>
        </div>
        
        <div className="mobile-card-modern">
          <div className="card-content text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Icons.clipboard className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-600 mb-1">{stats.inProgress}</div>
            <div className="text-sm text-neutral-600 font-medium">In Progress</div>
          </div>
        </div>
        
        <div className="mobile-card-modern">
          <div className="card-content text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Icons.check className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600 mb-1">{stats.completed}</div>
            <div className="text-sm text-neutral-600 font-medium">Completed</div>
          </div>
        </div>
        
        <div className="mobile-card-modern">
          <div className="card-content text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Icons.alert className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-red-600 mb-1">{stats.overdue}</div>
            <div className="text-sm text-neutral-600 font-medium">Overdue</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button 
          onClick={() => navigate('/tasks')}
          className="mobile-button-secondary"
        >
          <Icons.list className="h-5 w-5" />
          View All Tasks
        </button>
        {canCreateTasks && (
          <button 
            onClick={() => navigate('/add-task')}
            className="mobile-button-primary"
          >
            <Icons.plus className="h-5 w-5" />
            New Task
          </button>
        )}
      </div>

      {/* Overdue Tasks Section */}
      {overdueTasks.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-red-600 flex items-center gap-2">
              <Icons.alert className="w-5 h-5" />
              Overdue Tasks
            </h2>
            <span className="text-sm text-red-600 font-semibold">
              {overdueTasks.length} task{overdueTasks.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="space-y-3">
            {overdueTasks.slice(0, 3).map((task) => (
              <MobileTaskCard
                key={task._id}
                task={task}
                onComplete={handleTaskComplete}
                onView={handleTaskView}
              />
            ))}
            {overdueTasks.length > 3 && (
              <button 
                onClick={() => navigate('/tasks')}
                className="w-full p-3 text-red-600 bg-red-50 rounded-lg font-medium hover:bg-red-100 transition-colors"
              >
                View {overdueTasks.length - 3} more overdue task{overdueTasks.length - 3 !== 1 ? 's' : ''}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Today's Tasks Section */}
      {todaysTasks.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <Icons.calendar className="w-5 h-5" />
              Today's Tasks
            </h2>
            <span className="text-sm text-neutral-600 font-semibold">
              {todaysTasks.length} task{todaysTasks.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="space-y-3">
            {todaysTasks.slice(0, 3).map((task) => (
              <MobileTaskCard
                key={task._id}
                task={task}
                onComplete={handleTaskComplete}
                onView={handleTaskView}
              />
            ))}
            {todaysTasks.length > 3 && (
              <button 
                onClick={() => navigate('/tasks')}
                className="w-full p-3 text-primary-600 bg-primary-50 rounded-lg font-medium hover:bg-primary-100 transition-colors"
              >
                View {todaysTasks.length - 3} more task{todaysTasks.length - 3 !== 1 ? 's' : ''}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Recent Tasks Fallback */}
      {overdueTasks.length === 0 && todaysTasks.length === 0 && recentTasks.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <Icons.clock className="w-5 h-5" />
              Upcoming Tasks
            </h2>
          </div>
          <div className="space-y-3">
            {recentTasks.slice(0, 3).map((task) => (
              <MobileTaskCard
                key={task._id}
                task={task}
                onComplete={handleTaskComplete}
                onView={handleTaskView}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {tasks.length === 0 && (
        <div className="mobile-card-modern">
          <div className="card-content text-center py-12">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icons.clipboard className="h-10 w-10 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">No tasks yet</h3>
            <p className="text-neutral-600 mb-6">
              {canCreateTasks ? 'Create your first task to get started' : 'Tasks will appear here when assigned'}
            </p>
            {canCreateTasks && (
              <button 
                onClick={() => navigate('/add-task')}
                className="mobile-button-primary"
              >
                <Icons.plus className="h-5 w-5" />
                Create Task
              </button>
            )}
          </div>
        </div>
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
};
