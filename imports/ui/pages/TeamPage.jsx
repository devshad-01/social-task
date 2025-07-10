import React from 'react';
import { Icons } from '../components/Icons';

export const TeamPage = () => {
  const mockTeamMembers = [
    {
      id: '1',
      name: 'Sarah Johnson',
      role: 'Content Creator',
      email: 'sarah@example.com',
      avatar: null,
      status: 'online',
      activeTasks: 5
    },
    {
      id: '2',
      name: 'Michael Wong',
      role: 'Designer',
      email: 'michael@example.com',
      avatar: null,
      status: 'offline',
      activeTasks: 2
    },
    {
      id: '3',
      name: 'Amanda Lee',
      role: 'Social Media Manager',
      email: 'amanda@example.com',
      avatar: null,
      status: 'online',
      activeTasks: 8
    },
    {
      id: '4',
      name: 'Robert Chen',
      role: 'Copywriter',
      email: 'robert@example.com',
      avatar: null,
      status: 'away',
      activeTasks: 3
    }
  ];

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1 className="page-title">Team</h1>
          <p className="page-subtitle">Manage your team members</p>
        </div>
        <button className="button-primary">
          <Icons.plus className="button-icon" />
          Add Member
        </button>
      </header>

      <div className="team-filter">
        <input 
          type="text" 
          placeholder="Search team members..." 
          className="search-input"
        />
        <div className="filter-buttons">
          <button className="filter-button active">All</button>
          <button className="filter-button">Online</button>
          <button className="filter-button">Busy</button>
        </div>
      </div>

      <div className="team-grid">
        {mockTeamMembers.map((member) => (
          <div key={member.id} className="team-card">
            <div className={`avatar-status status-${member.status}`}>
              {member.avatar ? (
                <img src={member.avatar} alt={member.name} className="team-avatar" />
              ) : (
                <div className="team-avatar-placeholder">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
              )}
            </div>
            <h3 className="team-name">{member.name}</h3>
            <p className="team-role">{member.role}</p>
            <p className="team-email">{member.email}</p>
            <div className="team-meta">
              <div className="task-badge">
                <Icons.tasks className="badge-icon" />
                <span>{member.activeTasks} Active Tasks</span>
              </div>
            </div>
            <div className="team-actions">
              <button className="button-icon">
                <Icons.messageCircle />
              </button>
              <button className="button-icon">
                <Icons.info />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
