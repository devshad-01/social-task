import React, { useState, useMemo, useContext } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { useNavigate } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskModal } from '../components/tasks/TaskModal';
import { useTasks } from '../hooks/useTasks';
import { NavigationContext } from '../context/NavigationContext';
import { Icons } from '../components/Icons';

export const DashboardPage = ({ activeTab }) => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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
    createTask,
    updateTask,
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
      // Sort by priority (high first) then by due date
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

  if (loading) {
    return <div className="p-6 text-center">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">Error loading dashboard: {error}</div>;
  }

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
