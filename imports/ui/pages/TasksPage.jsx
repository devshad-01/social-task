import React, { useState, useMemo } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskModal } from '../components/tasks/TaskModal';
import { TaskFilters } from '../components/tasks/TaskFilters';
import { useTasks } from '../hooks/useTasks';
import { Icons } from '../components/Icons';

export const TasksPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [advancedFilters, setAdvancedFilters] = useState({});

  const { user } = useTracker(() => ({
    user: Meteor.user()
  }), []);

  const isAdmin = user && Roles.userIsInRole(user._id, ['admin', 'supervisor']);

  const { 
    tasks,
    loading,
    error,
    createTask, 
    updateTask,
    deleteTask,
    updateStatus,
    filterTasks, 
    getTaskStats 
  } = useTasks();

  const filteredTasks = useMemo(() => {
    let result = filterTasks(filter, searchTerm);
    
    // Apply advanced filters
    if (advancedFilters.assigneeId) {
      result = result.filter(task => task.assigneeIds.includes(advancedFilters.assigneeId));
    }
    if (advancedFilters.clientId) {
      result = result.filter(task => task.clientId === advancedFilters.clientId);
    }
    if (advancedFilters.priority) {
      result = result.filter(task => task.priority === advancedFilters.priority);
    }
    if (advancedFilters.dueDate) {
      const filterDate = new Date(advancedFilters.dueDate);
      result = result.filter(task => {
        const taskDate = new Date(task.dueDate);
        return taskDate.toDateString() === filterDate.toDateString();
      });
    }
    
    return result;
  }, [filterTasks, filter, searchTerm, advancedFilters]);

  const stats = useMemo(() => {
    return getTaskStats();
  }, [getTaskStats]);

  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  const handleCreateTask = async (taskData) => {
    try {
      await createTask(taskData);
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };

  const handleUpdateTask = async (taskData) => {
    try {
      await updateTask(selectedTask._id, taskData);
      setSelectedTask(null);
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  const handleCompleteTask = async (task) => {
    try {
      await updateStatus(task._id, 'completed');
    } catch (err) {
      console.error('Error completing task:', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!isAdmin) {
      alert('Only admins and supervisors can delete tasks');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId);
        setSelectedTask(null);
      } catch (err) {
        console.error('Error deleting task:', err);
      }
    }
  };

  const handleFiltersChange = (newFilters) => {
    setAdvancedFilters(newFilters);
  };

  const filterOptions = [
    { value: 'all', label: 'All Tasks', count: stats.total },
    { value: 'draft', label: 'Draft', count: stats.draft || 0 },
    { value: 'scheduled', label: 'Scheduled', count: stats.scheduled || 0 },
    { value: 'in_progress', label: 'In Progress', count: stats.in_progress },
    { value: 'completed', label: 'Completed', count: stats.completed },
    { value: 'blocked', label: 'Blocked', count: stats.blocked || 0 }
  ];

  if (loading) {
    return <div className="p-6 text-center">Loading tasks...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">Error loading tasks: {error}</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
            <p className="text-gray-600">
              {isAdmin ? 'Manage all tasks and assignments' : 'View your assigned tasks'}
            </p>
          </div>
          {isAdmin && (
            <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
              {React.createElement(Icons.plus, { className: "h-4 w-4" })}
              New Task
            </Button>
          )}
        </div>
      </div>

      {/* Advanced Filters for Admins */}
      {isAdmin && (
        <div className="mb-6">
          <TaskFilters
            onFiltersChange={handleFiltersChange}
            clients={[]} // TODO: Add clients data
            users={[]} // TODO: Add users data
            initialFilters={advancedFilters}
          />
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-500">Total</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{stats.draft || 0}</div>
            <div className="text-sm text-gray-500">Draft</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.scheduled || 0}</div>
            <div className="text-sm text-gray-500">Scheduled</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.in_progress}</div>
            <div className="text-sm text-gray-500">In Progress</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.overdue || 0}</div>
            <div className="text-sm text-gray-500">Overdue</div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            {React.createElement(Icons.search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" })}
            <Input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <Button
                key={option.value}
                variant={filter === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(option.value)}
                className="flex items-center gap-2"
              >
                {option.label}
                <Badge variant="secondary" size="sm">
                  {option.count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>
        
        {isAdmin && (
          <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
            {React.createElement(Icons.plus, { className: "h-4 w-4" })}
            New Task
          </Button>
        )}
      </div>

      {/* Tasks Grid */}
      {filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onClick={() => handleTaskClick(task)}
              onComplete={handleCompleteTask}
              onEdit={() => setSelectedTask(task)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          illustration={React.createElement(Icons.clipboard, { className: "mx-auto h-12 w-12 text-gray-400" })}
          title="No tasks found"
          description={searchTerm ? 'Try adjusting your search terms' : isAdmin ? 'Create your first task to get started' : 'No tasks have been assigned to you yet'}
          action={
            isAdmin && (
              <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
                {React.createElement(Icons.plus, { className: "h-4 w-4" })}
                Create Task
              </Button>
            )
          }
        />
      )}

      {/* Create Task Modal */}
      {isAdmin && (
        <TaskModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={handleCreateTask}
          mode="create"
        />
      )}

      {/* Task Details Modal */}
      {selectedTask && (
        <TaskModal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onSave={handleUpdateTask}
          onDelete={() => handleDeleteTask(selectedTask._id)}
          task={selectedTask}
          mode={isAdmin || selectedTask.assigneeIds.includes(user?._id) ? "edit" : "view"}
          canDelete={isAdmin}
        />
      )}
    </div>
  );
};
