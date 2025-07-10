import React from 'react';
import { Icons } from '../components/Icons';

export const DashboardPage = ({ activeTab }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

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
    }
  ];

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1 className="page-title">{getGreeting()}, John</h1>
          <p className="page-subtitle">Here's what's happening today</p>
        </div>
      </header>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <Icons.tasks />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">8</h3>
            <p className="stat-label">Tasks Today</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Icons.check />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">12</h3>
            <p className="stat-label">Completed</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Icons.calendar />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">5</h3>
            <p className="stat-label">Upcoming</p>
          </div>
        </div>
      </div>

      <section className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">Today's Tasks</h2>
          <button className="button-primary">
            <Icons.plus className="button-icon" />
            Add Task
          </button>
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
      </section>
    </div>
  );
};
