import React, { useState, useMemo, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import { TaskModal } from '../components/tasks/TaskModal';
import { useTasks } from '../hooks/useTasks';
import { NavigationContext } from '../context/NavigationContext';
import { Icons } from '../components/Icons';

// Reuse the MobileTaskCard from DashboardPage
const MobileTaskCard = ({ task, onComplete, onView, onEdit }) => {
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
        <div className="flex gap-1 mt-2">
          {task.status !== 'completed' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onComplete(task);
              }}
              className="p-1.5 bg-green-100 hover:bg-green-200 rounded-md transition-colors"
            >
              <Icons.check className="w-3.5 h-3.5 text-green-600" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className="p-1.5 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors"
          >
            <Icons.edit className="w-3.5 h-3.5 text-blue-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const TasksPage = () => {
  const navigate = useNavigate();
  const [selectedTask, setSelectedTask] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const { canCreateTasks } = useContext(NavigationContext);

  const { user } = useTracker(() => ({
    user: Meteor.user()
  }), []);

  const isAdmin = user && Roles.userIsInRole(user._id, ['admin', 'supervisor']);

  const { 
    tasks,
    loading,
    error,
    updateTask,
    updateStatus,
    getTaskStats 
  } = useTasks();

  const filteredTasks = useMemo(() => {
    let result = tasks;
    
    // Filter by status
    if (filter !== 'all') {
      result = result.filter(task => {
        switch (filter) {
          case 'pending':
            return task.status === 'pending';
          case 'in_progress':
            return task.status === 'in_progress';
          case 'completed':
            return task.status === 'completed';
          case 'overdue':
            return new Date(task.dueDate) < new Date() && task.status !== 'completed';
          case 'high_priority':
            return task.priority === 'high' && task.status !== 'completed';
          default:
            return true;
        }
      });
    }
    
    // Filter by search term
    if (searchTerm) {
      result = result.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sort by due date and priority
    result.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });
    
    return result;
  }, [tasks, filter, searchTerm]);

  const stats = useMemo(() => {
    const taskStats = getTaskStats();
    const overdue = tasks.filter(task => 
      new Date(task.dueDate) < new Date() && task.status !== 'completed'
    ).length;
    const highPriority = tasks.filter(task => 
      task.priority === 'high' && task.status !== 'completed'
    ).length;
    
    return {
      ...taskStats,
      overdue,
      high_priority: highPriority
    };
  }, [tasks, getTaskStats]);

  const filterOptions = [
    { value: 'all', label: 'All', count: stats.total },
    { value: 'pending', label: 'Pending', count: stats.pending },
    { value: 'in_progress', label: 'In Progress', count: stats.in_progress },
    { value: 'completed', label: 'Completed', count: stats.completed },
    { value: 'overdue', label: 'Overdue', count: stats.overdue },
    { value: 'high_priority', label: 'High Priority', count: stats.high_priority }
  ];

  const handleTaskComplete = async (task) => {
    try {
      await updateStatus(task._id, 'completed');
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const handleTaskView = (task) => {
    setSelectedTask(task);
    setEditMode(false);
    setIsTaskModalOpen(true);
  };

  const handleTaskEdit = (task) => {
    setSelectedTask(task);
    setEditMode(true);
    setIsTaskModalOpen(true);
  };

  const handleUpdateTask = async (taskData) => {
    try {
      await updateTask(selectedTask._id, taskData);
      setIsTaskModalOpen(false);
      setSelectedTask(null);
      setEditMode(false);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  if (loading) {
    return (
      <div className="mobile-content-enhanced">
        <div className="space-y-4">
          <div className="mobile-skeleton mobile-skeleton-title"></div>
          <div className="mobile-skeleton mobile-skeleton-text"></div>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="mobile-card-modern">
              <div className="card-content">
                <div className="mobile-skeleton mobile-skeleton-text"></div>
                <div className="mobile-skeleton mobile-skeleton-text w-3/4"></div>
              </div>
            </div>
          ))}
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
            <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Tasks</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-content-enhanced">
      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <div className="mobile-card-modern">
          <div className="card-content text-center py-3">
            <div className="text-lg font-bold text-blue-600 mb-1">{stats.total}</div>
            <div className="text-xs text-neutral-600 font-medium">Total</div>
          </div>
        </div>
        <div className="mobile-card-modern">
          <div className="card-content text-center py-3">
            <div className="text-lg font-bold text-purple-600 mb-1">{stats.in_progress}</div>
            <div className="text-xs text-neutral-600 font-medium">Active</div>
          </div>
        </div>
        <div className="mobile-card-modern">
          <div className="card-content text-center py-3">
            <div className="text-lg font-bold text-green-600 mb-1">{stats.completed}</div>
            <div className="text-xs text-neutral-600 font-medium">Done</div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Icons.search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-500" />
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mobile-search-bar pl-12"
        />
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value)}
            className={`px-3 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
              filter === option.value
                ? 'bg-primary-100 text-primary-700 border border-primary-200'
                : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
            }`}
          >
            {option.label} ({option.count})
          </button>
        ))}
      </div>

      {/* Add Task Button */}
      {canCreateTasks && (
        <button 
          onClick={() => navigate('/add-task')}
          className="mobile-button-primary mb-6"
        >
          <Icons.plus className="h-5 w-5" />
          Add New Task
        </button>
      )}

      {/* Tasks List */}
      {filteredTasks.length > 0 ? (
        <div className="space-y-3">
          {filteredTasks.map((task, index) => (
            <div 
              key={task._id} 
              className={`mobile-fade-in mobile-stagger-${(index % 4) + 1}`}
            >
              <MobileTaskCard
                task={task}
                onComplete={handleTaskComplete}
                onView={handleTaskView}
                onEdit={handleTaskEdit}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="mobile-card-modern">
          <div className="card-content text-center py-12">
            <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icons.clipboard className="h-10 w-10 text-neutral-500" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">No tasks found</h3>
            <p className="text-neutral-600 mb-6">
              {searchTerm ? 'Try adjusting your search terms' : 'No tasks match the current filter'}
            </p>
            {canCreateTasks && !searchTerm && (
              <button 
                onClick={() => navigate('/add-task')}
                className="mobile-button-secondary"
              >
                <Icons.plus className="h-5 w-5" />
                Create Task
              </button>
            )}
          </div>
        </div>
      )}

      {/* Task Modal */}
      {selectedTask && (
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false);
            setSelectedTask(null);
            setEditMode(false);
          }}
          task={selectedTask}
          onSave={editMode ? handleUpdateTask : undefined}
          readOnly={!editMode}
        />
      )}
    </div>
  );
};
