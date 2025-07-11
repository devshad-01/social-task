import React, { useState } from 'react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskModal } from '../components/tasks/TaskModal';
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
      client: {
        id: 1,
        name: 'Fashion Brand Co.',
        logoUrl: '/images/client1.jpg'
      },
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
      client: {
        id: 2,
        name: 'Tech Startup Inc.',
        logoUrl: '/images/client2.jpg'
      },
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
      client: {
        id: 3,
        name: 'Restaurant Chain',
        logoUrl: '/images/client3.jpg'
      },
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
      client: {
        id: 4,
        name: 'B2B Software Co.',
        logoUrl: '/images/client4.jpg'
      },
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
      client: {
        id: 5,
        name: 'Youth Brand LLC',
        logoUrl: '/images/client5.jpg'
      },
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
                         task.client.name.toLowerCase().includes(searchTerm.toLowerCase());
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
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">Manage your social media tasks and projects</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="button-primary">
          {React.createElement(Icons.plus, { className: "button-icon" })}
          New Task
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <svg className="icon-lg" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Tasks</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <svg className="icon-lg" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <div className="stat-value" style={{ color: 'var(--status-warning)' }}>{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <svg className="icon-lg" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9.5 9.293 8.207a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L11 9.586l-2.293-2.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <div className="stat-value" style={{ color: 'var(--secondary-600)' }}>{stats.in_progress}</div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <svg className="icon-lg" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <div className="stat-value" style={{ color: 'var(--status-success)' }}>{stats.completed}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="tasks-filter-bar">
        <div className="search-input-wrapper">
          {React.createElement(Icons.search, { className: "search-icon" })}
          <Input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'all' ? 'filter-tab-active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({stats.total})
          </button>
          <button
            className={`filter-tab ${filter === 'pending' ? 'filter-tab-active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending ({stats.pending})
          </button>
          <button
            className={`filter-tab ${filter === 'in_progress' ? 'filter-tab-active' : ''}`}
            onClick={() => setFilter('in_progress')}
          >
            In Progress ({stats.in_progress})
          </button>
          <button
            className={`filter-tab ${filter === 'completed' ? 'filter-tab-active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed ({stats.completed})
          </button>
        </div>
      </div>

      {/* Tasks Grid */}
      {filteredTasks.length > 0 ? (
        <div className="task-list">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => handleTaskClick(task)}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">
            {React.createElement(Icons.check, { className: "icon-xl" })}
          </div>
          <h3 className="empty-text">No tasks found</h3>
          <p className="empty-text" style={{ fontSize: '0.875rem', marginTop: 'var(--spacing-sm)' }}>
            {searchTerm ? 'Try adjusting your search terms' : 'Create your first task to get started'}
          </p>
          <Button onClick={() => setIsCreateModalOpen(true)} className="button-primary" style={{ marginTop: 'var(--spacing-base)' }}>
            {React.createElement(Icons.plus, { className: "button-icon" })}
            Create Task
          </Button>
        </div>
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
