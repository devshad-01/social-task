import React from 'react';
import { Icons } from '../components/Icons';

export const ClientsPage = () => {
  const mockClients = [
    {
      id: '1',
      name: 'Fashion Brand Co.',
      industry: 'Fashion & Apparel',
      contact: 'Sarah Johnson',
      email: 'sarah@fashionbrand.co',
      activeSince: 'June 2022',
      status: 'active'
    },
    {
      id: '2',
      name: 'Tech Startup Inc.',
      industry: 'Technology',
      contact: 'Michael Wong',
      email: 'michael@techstartup.com',
      activeSince: 'January 2023',
      status: 'active'
    },
    {
      id: '3',
      name: 'Corporate Solutions',
      industry: 'Business Services',
      contact: 'Amanda Lee',
      email: 'amanda@corpsolutions.com',
      activeSince: 'March 2022',
      status: 'inactive'
    }
  ];

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1 className="page-title">Clients</h1>
          <p className="page-subtitle">Manage your client relationships</p>
        </div>
        <button className="button-primary">
          <Icons.plus className="button-icon" />
          Add Client
        </button>
      </header>

      <div className="clients-filter">
        <input 
          type="text" 
          placeholder="Search clients..." 
          className="search-input"
        />
        <div className="filter-buttons">
          <button className="filter-button active">All</button>
          <button className="filter-button">Active</button>
          <button className="filter-button">Inactive</button>
        </div>
      </div>

      <div className="client-list">
        {mockClients.map((client) => (
          <div key={client.id} className={`client-card status-${client.status}`}>
            <div className="client-header">
              <h3 className="client-name">{client.name}</h3>
              <span className={`client-status status-${client.status}`}>
                {client.status === 'active' ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="client-industry">{client.industry}</p>
            
            <div className="client-details">
              <div className="client-contact">
                <p className="detail-label">Contact</p>
                <p className="detail-value">{client.contact}</p>
              </div>
              <div className="client-email">
                <p className="detail-label">Email</p>
                <p className="detail-value">{client.email}</p>
              </div>
              <div className="client-since">
                <p className="detail-label">Active Since</p>
                <p className="detail-value">{client.activeSince}</p>
              </div>
            </div>
            
            <div className="client-actions">
              <button className="button-icon">
                <Icons.edit />
              </button>
              <button className="button-icon">
                <Icons.trash />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
