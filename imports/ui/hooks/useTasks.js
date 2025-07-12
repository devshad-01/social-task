import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to manage tasks state and operations
 * @returns {Object} - Tasks state and methods
 */
export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mock data for now - will be replaced with Meteor methods
  const mockTasks = [
    {
      id: 1,
      title: 'Create Instagram post for summer sale',
      description: 'Design and schedule Instagram post featuring summer products with engaging visuals and compelling copy',
      status: 'in_progress',
      priority: 'high',
      dueDate: '2024-01-15',
      assignees: [{ name: 'Sarah Johnson', avatar: '/images/avatar1.jpg' }],
      client: { id: 1, name: 'Fashion Brand Co.', logoUrl: '/images/client1.jpg' },
      socialAccounts: [{ id: 1, platform: 'Instagram' }],
      attachments: [],
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
      assignees: [{ name: 'Mike Chen', avatar: '/images/avatar2.jpg' }],
      client: { id: 2, name: 'Tech Startup Inc.', logoUrl: '/images/client2.jpg' },
      socialAccounts: [{ id: 2, platform: 'Facebook' }],
      attachments: [],
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
      assignees: [{ name: 'Emily Davis', avatar: '/images/avatar3.jpg' }],
      client: { id: 3, name: 'Restaurant Chain', logoUrl: '/images/client3.jpg' },
      socialAccounts: [{ id: 3, platform: 'Multiple' }],
      attachments: [],
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
      assignees: [{ name: 'David Wilson', avatar: '/images/avatar4.jpg' }],
      client: { id: 4, name: 'B2B Software Co.', logoUrl: '/images/client4.jpg' },
      socialAccounts: [{ id: 4, platform: 'LinkedIn' }],
      attachments: [],
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
      assignees: [{ name: 'Lisa Garcia', avatar: '/images/avatar5.jpg' }],
      client: { id: 5, name: 'Youth Brand LLC', logoUrl: '/images/client5.jpg' },
      socialAccounts: [{ id: 5, platform: 'TikTok' }],
      attachments: [],
      createdAt: '2024-01-11',
      updatedAt: '2024-01-11'
    }
  ];

  // Initialize tasks
  useEffect(() => {
    setTasks(mockTasks);
  }, []);

  // Create task
  const createTask = useCallback(async (taskData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock create operation
      const newTask = {
        id: Date.now(),
        ...taskData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setTasks(prev => [...prev, newTask]);
      return newTask;
    } catch (err) {
      setError(err.message || 'Failed to create task');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update task
  const updateTask = useCallback(async (taskId, updates) => {
    try {
      setLoading(true);
      setError(null);
      
      setTasks(prev => 
        prev.map(task => 
          task.id === taskId 
            ? { ...task, ...updates, updatedAt: new Date().toISOString() }
            : task
        )
      );
    } catch (err) {
      setError(err.message || 'Failed to update task');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete task
  const deleteTask = useCallback(async (taskId) => {
    try {
      setLoading(true);
      setError(null);
      
      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (err) {
      setError(err.message || 'Failed to delete task');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Complete task
  const completeTask = useCallback(async (taskId) => {
    return updateTask(taskId, { status: 'completed' });
  }, [updateTask]);

  // Filter tasks
  const filterTasks = useCallback((filter, searchTerm = '') => {
    return tasks.filter(task => {
      const matchesFilter = filter === 'all' || task.status === filter;
      const matchesSearch = !searchTerm || 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.client?.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesFilter && matchesSearch;
    });
  }, [tasks]);

  // Get task statistics
  const getTaskStats = useCallback(() => {
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      in_progress: tasks.filter(t => t.status === 'in_progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      overdue: tasks.filter(t => 
        new Date(t.dueDate) < new Date() && t.status !== 'completed'
      ).length
    };
  }, [tasks]);

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    filterTasks,
    getTaskStats
  };
};
