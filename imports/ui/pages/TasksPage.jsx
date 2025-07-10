import React from 'react';
import { Icons } from '../components/Icons';

export const TasksPage = () => {
  const mockTasks = [
    {
      id: '1',
      title: 'Instagram Story - Summer Campaign',
      client: 'Fashion Brand Co.',
      dueTime: '2:00 PM',
      status: 'scheduled',
      priority: 'high',
      category: 'work'
    },
    {
      id: '2',
      title: 'Facebook Post - Product Launch',
      client: 'Tech Startup Inc.',
      dueTime: '4:30 PM',
      status: 'scheduled',
      priority: 'medium',
      category: 'work'
    },
    {
      id: '3',
      title: 'LinkedIn Article Review',
      client: 'Corporate Solutions',
      dueTime: '6:00 PM',
      status: 'draft',
      priority: 'low',
      category: 'business'
    },
    {
      id: '4',
      title: 'TikTok Campaign Planning',
      client: 'Youth Brand',
      dueTime: 'Tomorrow',
      status: 'draft',
      priority: 'medium',
      category: 'creative'
    }
  ];

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">Manage your tasks and deadlines</p>
        </div>
        <button className="button-primary">
          <Icons.plus className="button-icon" />
          New Task
        </button>
      </header>

      <div className="tasks-filter">
        <button className="filter-button active">All</button>
        <button className="filter-button">Today</button>
        <button className="filter-button">Upcoming</button>
        <button className="filter-button">Completed</button>
      </div>

      <div className="task-list">
        {mockTasks.map((task) => (
          <div key={task.id} className={`task-card priority-${task.priority}`}>
            <div className="task-content">
              <h3 className="task-title">{task.title}</h3>
              <p className="task-client">{task.client}</p>
              <div className="task-meta">
                <span className={`task-status status-${task.status}`}>
                  {task.status}
                </span>
                <span className="task-due">Due: {task.dueTime}</span>
              </div>
            </div>
            <div className={`task-category category-${task.category}`}>
              <span>{task.category}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
