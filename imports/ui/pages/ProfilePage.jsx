import React from 'react';
import { Icons } from '../components/Icons';

export const ProfilePage = () => {
  const user = {
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin',
    joinedDate: 'January 2022',
    avatar: null,
    stats: {
      tasksCompleted: 248,
      projectsDelivered: 24,
      hoursLogged: 1240
    }
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle">Manage your account details</p>
        </div>
        <button className="button-secondary">
          <Icons.edit className="button-icon" />
          Edit Profile
        </button>
      </header>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-header">
            <div className="avatar-container">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="user-avatar" />
              ) : (
                <div className="user-avatar-placeholder">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </div>
              )}
            </div>
            <div className="profile-details">
              <h2 className="profile-name">{user.name}</h2>
              <p className="profile-role">{user.role}</p>
              <p className="profile-meta">Member since {user.joinedDate}</p>
            </div>
          </div>

          <div className="profile-stats">
            <div className="stat-item">
              <h3 className="stat-value">{user.stats.tasksCompleted}</h3>
              <p className="stat-label">Tasks Completed</p>
            </div>
            <div className="stat-item">
              <h3 className="stat-value">{user.stats.projectsDelivered}</h3>
              <p className="stat-label">Projects Delivered</p>
            </div>
            <div className="stat-item">
              <h3 className="stat-value">{user.stats.hoursLogged}</h3>
              <p className="stat-label">Hours Logged</p>
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h3 className="section-title">Contact Information</h3>
          <div className="info-group">
            <div className="info-item">
              <p className="info-label">Email</p>
              <p className="info-value">{user.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
