import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Avatar } from '../components/common/Avatar';
import { Input, TextArea, Select } from '../components/common/Input';
import { EmptyState } from '../components/common/EmptyState';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskModal } from '../components/tasks/TaskModal';
import { TaskFilters } from '../components/tasks/TaskFilters';
import { Icons } from '../components/Icons';

export const TasksPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data
  const tasks = [
    {
      id: 1,
      title: 'Create Instagram post for summer sale',
      description: 'Design and schedule Instagram post featuring summer products with engaging visuals and compelling copy',
      status: 'in_progress',
      priority: 'high',
      dueDate: '2024-01-15',
      assignedTo: {
        name: 'Sarah Johnson',
        avatar: '/images/avatar1.jpg'
      },
      client: 'Fashion Brand Co.',
      platform: 'Instagram',
      tags: ['content', 'design', 'instagram'],
      createdAt: '2024-01-10',
      updatedAt: '2024-01-12'
    },
    {
      id: 2,
      title: 'Facebook ad campaign setup',
      description: 'Set up and launch Facebook advertising campaign for Q1 with targeted demographics and budget allocation',
      status: 'pending',
      priority: 'medium',
      dueDate: '2024-01-20',
      assignedTo: {
        name: 'Mike Chen',
        avatar: '/images/avatar2.jpg'
      },
      client: 'Tech Startup Inc.',
      platform: 'Facebook',
      tags: ['ads', 'facebook', 'campaign'],
      createdAt: '2024-01-08',
      updatedAt: '2024-01-10'
    },
    {
      id: 3,
      title: 'Weekly analytics report',
      description: 'Compile and analyze social media performance metrics for all active campaigns',
      status: 'completed',
      priority: 'low',
      dueDate: '2024-01-10',
      assignedTo: {
        name: 'Emily Davis',
        avatar: '/images/avatar3.jpg'
      },
      client: 'Restaurant Chain',
      platform: 'Multiple',
      tags: ['analytics', 'report', 'metrics'],
      createdAt: '2024-01-05',
      updatedAt: '2024-01-10'
    },
    {
      id: 4,
      title: 'LinkedIn content calendar',
      description: 'Create monthly content calendar for LinkedIn business profile with industry insights',
      status: 'in_progress',
      priority: 'medium',
      dueDate: '2024-01-18',
      assignedTo: {
        name: 'David Wilson',
        avatar: '/images/avatar4.jpg'
      },
      client: 'B2B Software Co.',
      platform: 'LinkedIn',
      tags: ['content', 'calendar', 'linkedin'],
      createdAt: '2024-01-09',
      updatedAt: '2024-01-11'
    },
    {
      id: 5,
      title: 'TikTok viral challenge',
      description: 'Develop creative TikTok challenge campaign to increase brand awareness',
      status: 'pending',
      priority: 'high',
      dueDate: '2024-01-22',
      assignedTo: {
        name: 'Lisa Garcia',
        avatar: '/images/avatar5.jpg'
      },
      client: 'Youth Brand LLC',
      platform: 'TikTok',
      tags: ['tiktok', 'challenge', 'viral'],
      createdAt: '2024-01-11',
      updatedAt: '2024-01-11'
    }
  ];

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === 'all' || task.status === filter;
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.client.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  const handleCreateTask = (taskData) => {
    console.log('Creating task:', taskData);
    setIsCreateModalOpen(false);
    // In a real app, this would make an API call
  };

  const handleUpdateTask = (taskData) => {
    console.log('Updating task:', taskData);
    setSelectedTask(null);
    // In a real app, this would make an API call
  };

  const getTaskStats = () => {
    const stats = {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      in_progress: tasks.filter(t => t.status === 'in_progress').length,
      completed: tasks.filter(t => t.status === 'completed').length
    };
    return stats;
  };

  const stats = getTaskStats();

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
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-500">Pending</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.in_progress}</div>
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
            <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <TaskFilters
            currentFilter={filter}
            onFilterChange={setFilter}
            taskStats={stats}
          />
        </div>
        
        <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
          <Icons.Plus className="h-4 w-4" />
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
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Icons.CheckSquare}
          title="No tasks found"
          description={searchTerm ? 'Try adjusting your search terms' : 'Create your first task to get started'}
          action={
            <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
              <Icons.Plus className="h-4 w-4" />
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
        title="Create New Task"
      />

      {/* Task Details Modal */}
      {selectedTask && (
        <TaskModal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onSave={handleUpdateTask}
          task={selectedTask}
          title="Edit Task"
        />
      )}
    </div>
  );
};
