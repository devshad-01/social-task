import React from 'react';
import { Icons } from '../components/Icons';

export const AnalyticsPage = () => {
  const mockMetrics = [
    { 
      id: 'posts', 
      label: 'Total Posts', 
      value: '124', 
      change: '+12%',
      trend: 'up'
    },
    { 
      id: 'engagement', 
      label: 'Engagement Rate', 
      value: '5.2%', 
      change: '+0.8%',
      trend: 'up'
    },
    { 
      id: 'reach', 
      label: 'Audience Reach', 
      value: '45.3K', 
      change: '+22.5%',
      trend: 'up'
    },
    { 
      id: 'clicks', 
      label: 'Link Clicks', 
      value: '1,842', 
      change: '-3.1%',
      trend: 'down'
    }
  ];

  const mockClients = [
    { name: 'Fashion Brand Co.', percentage: 35 },
    { name: 'Tech Startup Inc.', percentage: 25 },
    { name: 'Corporate Solutions', percentage: 20 },
    { name: 'Youth Brand', percentage: 15 },
    { name: 'Other', percentage: 5 }
  ];

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Track performance metrics</p>
        </div>
        <div className="header-actions">
          <select className="select-period">
            <option>Last 30 Days</option>
            <option>Last Quarter</option>
            <option>Last Year</option>
          </select>
          <button className="button-secondary">
            <Icons.download className="button-icon" />
            Export
          </button>
        </div>
      </header>

      <div className="metrics-grid">
        {mockMetrics.map((metric) => (
          <div key={metric.id} className="metric-card">
            <div className="metric-header">
              <h3 className="metric-label">{metric.label}</h3>
              <div className={`trend-badge trend-${metric.trend}`}>
                <Icons.arrowUp className={`trend-icon ${metric.trend === 'down' ? 'trend-down' : ''}`} />
                <span>{metric.change}</span>
              </div>
            </div>
            <p className="metric-value">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="analytics-content">
        <div className="chart-section">
          <div className="section-header">
            <h2 className="section-title">Performance Trend</h2>
            <div className="chart-legend">
              <div className="legend-item">
                <div className="legend-color legend-primary"></div>
                <span>Engagement</span>
              </div>
              <div className="legend-item">
                <div className="legend-color legend-secondary"></div>
                <span>Reach</span>
              </div>
            </div>
          </div>
          <div className="chart-container">
            <div className="chart-placeholder">
              <p>Chart visualization will appear here</p>
              <p className="placeholder-note">(Using a chart library like Chart.js or Recharts)</p>
            </div>
          </div>
        </div>

        <div className="distribution-section">
          <h2 className="section-title">Client Distribution</h2>
          <div className="distribution-content">
            {mockClients.map((client, index) => (
              <div key={index} className="distribution-item">
                <div className="distribution-label">
                  <span className="client-name">{client.name}</span>
                  <span className="percentage">{client.percentage}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{width: `${client.percentage}%`}}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
