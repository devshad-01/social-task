import { useState, useEffect, useCallback } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import { Tasks } from '../../api/tasks/TasksCollection';

/**
 * Custom hook to manage tasks state and operations
 * @returns {Object} - Tasks state and methods
 */
export const useTasks = () => {
  const [error, setError] = useState(null);

  // Subscribe to tasks based on user role
  const { tasks, loading, user } = useTracker(() => {
    const user = Meteor.user();
    
    if (!user) {
      return { tasks: [], loading: false, user: null };
    }

    // Subscribe to appropriate tasks based on user role
    const isAdmin = Roles.userIsInRole(user._id, ['admin', 'supervisor']);
    const subscription = isAdmin ? 
      Meteor.subscribe('tasks.all') : 
      Meteor.subscribe('tasks.assigned');

    const tasks = Tasks.find({}, {
      sort: { createdAt: -1 }
    }).fetch();

    return {
      tasks,
      loading: !subscription.ready(),
      user
    };
  }, []);

  // Create task
  const createTask = useCallback(async (taskData) => {
    try {
      setError(null);
      
      // Convert date string to Date object if needed
      if (taskData.dueDate && typeof taskData.dueDate === 'string') {
        taskData.dueDate = new Date(taskData.dueDate);
      }

      const taskId = await Meteor.callAsync('tasks.create', taskData);
      return taskId;
    } catch (err) {
      setError(err.message || 'Failed to create task');
      throw err;
    }
  }, []);

  // Update task
  const updateTask = useCallback(async (taskId, updates) => {
    try {
      setError(null);
      
      // Convert date string to Date object if needed
      if (updates.dueDate && typeof updates.dueDate === 'string') {
        updates.dueDate = new Date(updates.dueDate);
      }

      await Meteor.callAsync('tasks.update', taskId, updates);
    } catch (err) {
      setError(err.message || 'Failed to update task');
      throw err;
    }
  }, []);

  // Delete task
  const deleteTask = useCallback(async (taskId) => {
    try {
      setError(null);
      await Meteor.callAsync('tasks.delete', taskId);
    } catch (err) {
      setError(err.message || 'Failed to delete task');
      throw err;
    }
  }, []);

  // Update task status
  const updateStatus = useCallback(async (taskId, status) => {
    try {
      setError(null);
      await Meteor.callAsync('tasks.updateStatus', taskId, status);
    } catch (err) {
      setError(err.message || 'Failed to update task status');
      throw err;
    }
  }, []);

  // Complete task
  const completeTask = useCallback(async (taskId) => {
    return updateStatus(taskId, 'completed');
  }, [updateStatus]);

  // Add comment to task
  const addComment = useCallback(async (taskId, commentText) => {
    try {
      setError(null);
      await Meteor.callAsync('tasks.addComment', taskId, commentText);
    } catch (err) {
      setError(err.message || 'Failed to add comment');
      throw err;
    }
  }, []);

  // Assign users to task
  const assignUsers = useCallback(async (taskId, userIds) => {
    try {
      setError(null);
      await Meteor.callAsync('tasks.assignUsers', taskId, userIds);
    } catch (err) {
      setError(err.message || 'Failed to assign users');
      throw err;
    }
  }, []);

  // Filter tasks
  const filterTasks = useCallback((filter, searchTerm = '') => {
    return tasks.filter(task => {
      const matchesFilter = filter === 'all' || task.status === filter;
      const matchesSearch = !searchTerm || 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesFilter && matchesSearch;
    });
  }, [tasks]);

  // Get task statistics
  const getTaskStats = useCallback(() => {
    return {
      total: tasks.length,
      draft: tasks.filter(t => t.status === 'draft').length,
      scheduled: tasks.filter(t => t.status === 'scheduled').length,
      in_progress: tasks.filter(t => t.status === 'in_progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      blocked: tasks.filter(t => t.status === 'blocked').length,
      overdue: tasks.filter(t => 
        t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed'
      ).length
    };
  }, [tasks]);

  return {
    tasks,
    loading,
    error,
    user,
    createTask,
    updateTask,
    deleteTask,
    updateStatus,
    completeTask,
    addComment,
    assignUsers,
    filterTasks,
    getTaskStats
  };
};
