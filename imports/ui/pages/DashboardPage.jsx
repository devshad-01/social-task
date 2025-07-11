import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { LoadingCard, EmptyState } from '../components/common/Loading';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskModal } from '../components/tasks/TaskModal';

export const DashboardPage = ({ activeTab }) => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Mock data - replace with actual data from API
  const todaysTasks = [
    {
      id: '1',
      title: 'Create Instagram story for product launch',
      description: 'Design and publish an engaging Instagram story showcasing our new product line with call-to-action',
      dueDate: new Date().toISOString(),
      status: 'scheduled',
      priority: 'high',
      client: {
        id: '1',
        name: 'TechCorp Solutions',
        logoUrl: '',
      },
      assignees: ['user1', 'user2'],
      socialAccounts: [
        { id: '1', platform: 'Instagram', name: '@techcorp' }
      ],
      attachments: [
        { id: '1', name: 'product-image.jpg', url: '/images/product1.jpg' }
      ]
    },
    {
      id: '2',
      title: 'Schedule Facebook post about team update',
      description: 'Write and schedule a Facebook post announcing our new team members',
      dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      status: 'scheduled',
      priority: 'medium',
      client: {
        id: '2',
        name: 'Creative Agency',
        logoUrl: '',
      },
      assignees: ['user1'],
      socialAccounts: [
        { id: '2', platform: 'Facebook', name: 'Creative Agency Page' }
      ]
    }
  ];

  const stats = {
    tasksToday: 5,
    completed: 2,
    overdue: 1,
    activeClients: 12
  };

  const handleTaskComplete = async (task) => {
    setLoading(true);
    try {
      // API call to complete task
      console.log('Completing task:', task.id);
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error completing task:', error);
      setLoading(false);
    }
  };

  const handleTaskView = (task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleTaskSave = async (taskData) => {
    // API call to save task
    console.log('Saving task:', taskData);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{getGreeting()}, John</h1>
          <p className="text-gray-600">Here's what's happening today</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </Button>
          <Button variant="primary" size="sm">
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Task
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{stats.tasksToday}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
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
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
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
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Clients</p>
                <p className="text-2xl font-bold text-purple-600">{stats.activeClients}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Tasks */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Today's Tasks</CardTitle>
            <Badge variant="primary">{todaysTasks.length} tasks</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {todaysTasks.length === 0 ? (
            <EmptyState
              title="No tasks for today"
              description="You're all caught up! No tasks are scheduled for today."
              illustration={
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          ) : (
            <div className="space-y-4">
              {todaysTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={handleTaskComplete}
                  onView={handleTaskView}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleTaskSave}
        task={selectedTask}
        mode="view"
      />
    </div>
  );
};
