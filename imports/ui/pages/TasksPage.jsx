import React, { useState, useMemo } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskModal } from '../components/tasks/TaskModal';
import { useTasks } from '../hooks/useTasks';
import { Icons } from '../components/Icons';

export const TasksPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { 
    createTask, 
    updateTask, 
    completeTask, 
    filterTasks, 
    getTaskStats 
  } = useTasks();

  const filteredTasks = useMemo(() => {
    return filterTasks(filter, searchTerm);
  }, [filterTasks, filter, searchTerm]);

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
      await updateTask(selectedTask.id, taskData);
      setSelectedTask(null);
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  const handleCompleteTask = async (task) => {
    try {
      await completeTask(task.id);
    } catch (err) {
      console.error('Error completing task:', err);
    }
  };

  const filterOptions = [
    { value: 'all', label: 'All Tasks', count: stats.total },
    { value: 'pending', label: 'Pending', count: stats.pending },
    { value: 'in_progress', label: 'In Progress', count: stats.in_progress },
    { value: 'completed', label: 'Completed', count: stats.completed }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Tasks</h1>
        <p className="text-gray-600">Manage your social media tasks and projects</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-500">Total Tasks</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
            <div className="text-sm text-gray-500">Pending</div>
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
        
        <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
          {React.createElement(Icons.plus, { className: "h-4 w-4" })}
          New Task
        </Button>
      </div>

      {/* Tasks Grid */}
      {filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => handleTaskClick(task)}
              onComplete={handleCompleteTask}
              onEdit={() => setSelectedTask(task)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Icons.clipboard}
          title="No tasks found"
          description={searchTerm ? 'Try adjusting your search terms' : 'Create your first task to get started'}
          action={
            <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
              {React.createElement(Icons.plus, { className: "h-4 w-4" })}
              Create Task
            </Button>
          }
        />
      )}

      {/* Create Task Modal */}
      <TaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateTask}
        mode="create"
      />

      {/* Task Details Modal */}
      {selectedTask && (
        <TaskModal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onSave={handleUpdateTask}
          task={selectedTask}
          mode="edit"
        />
      )}
    </div>
  );
};
