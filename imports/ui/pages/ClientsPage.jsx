import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Avatar } from '../components/common/Avatar';
import { Input } from '../components/common/Input';
import { EmptyState } from '../components/common/EmptyState';
import { ClientCard } from '../components/clients/ClientCard';
import { ClientModal } from '../components/clients/ClientModal';
import { Icons } from '../components/Icons';

export const ClientsPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data
  const clients = [
    {
      id: 1,
      name: 'Fashion Brand Co.',
      email: 'contact@fashionbrand.com',
      phone: '+1 (555) 123-4567',
      avatar: '/images/client1.jpg',
      industry: 'Fashion',
      status: 'active',
      tier: 'premium',
      joinDate: '2023-06-15',
      lastActivity: '2024-01-12',
      activeProjects: 3,
      totalProjects: 12,
      monthlyBudget: 5000,
      platforms: ['Instagram', 'Facebook', 'Pinterest'],
      manager: {
        name: 'Sarah Johnson',
        avatar: '/images/avatar1.jpg'
      },
      notes: 'High-value client with focus on visual content and influencer partnerships',
      address: {
        street: '123 Fashion Ave',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        country: 'USA'
      }
    },
    {
      id: 2,
      name: 'Tech Startup Inc.',
      email: 'hello@techstartup.com',
      phone: '+1 (555) 987-6543',
      avatar: '/images/client2.jpg',
      industry: 'Technology',
      status: 'active',
      tier: 'standard',
      joinDate: '2023-09-22',
      lastActivity: '2024-01-10',
      activeProjects: 2,
      totalProjects: 8,
      monthlyBudget: 3000,
      platforms: ['LinkedIn', 'Twitter', 'Facebook'],
      manager: {
        name: 'Mike Chen',
        avatar: '/images/avatar2.jpg'
      },
      notes: 'B2B focused with emphasis on thought leadership and technical content',
      address: {
        street: '456 Tech Blvd',
        city: 'San Francisco',
        state: 'CA',
        zip: '94105',
        country: 'USA'
      }
    },
    {
      id: 3,
      name: 'Restaurant Chain',
      email: 'marketing@restaurantchain.com',
      phone: '+1 (555) 456-7890',
      avatar: '/images/client3.jpg',
      industry: 'Food & Beverage',
      status: 'active',
      tier: 'enterprise',
      joinDate: '2023-03-10',
      lastActivity: '2024-01-11',
      activeProjects: 5,
      totalProjects: 20,
      monthlyBudget: 8000,
      platforms: ['Instagram', 'Facebook', 'TikTok', 'Yelp'],
      manager: {
        name: 'Emily Davis',
        avatar: '/images/avatar3.jpg'
      },
      notes: 'Multiple locations requiring localized content and promotional campaigns',
      address: {
        street: '789 Food Court',
        city: 'Chicago',
        state: 'IL',
        zip: '60601',
        country: 'USA'
      }
    },
    {
      id: 4,
      name: 'B2B Software Co.',
      email: 'pr@b2bsoftware.com',
      phone: '+1 (555) 321-0987',
      avatar: '/images/client4.jpg',
      industry: 'Software',
      status: 'active',
      tier: 'premium',
      joinDate: '2023-11-08',
      lastActivity: '2024-01-09',
      activeProjects: 2,
      totalProjects: 6,
      monthlyBudget: 4500,
      platforms: ['LinkedIn', 'Twitter', 'YouTube'],
      manager: {
        name: 'David Wilson',
        avatar: '/images/avatar4.jpg'
      },
      notes: 'Focus on professional networking and industry expertise content',
      address: {
        street: '321 Software Dr',
        city: 'Austin',
        state: 'TX',
        zip: '78701',
        country: 'USA'
      }
    },
    {
      id: 5,
      name: 'Youth Brand LLC',
      email: 'social@youthbrand.com',
      phone: '+1 (555) 654-3210',
      avatar: '/images/client5.jpg',
      industry: 'Lifestyle',
      status: 'inactive',
      tier: 'standard',
      joinDate: '2023-12-01',
      lastActivity: '2024-01-05',
      activeProjects: 1,
      totalProjects: 3,
      monthlyBudget: 2500,
      platforms: ['TikTok', 'Instagram', 'Snapchat'],
      manager: {
        name: 'Lisa Garcia',
        avatar: '/images/avatar5.jpg'
      },
      notes: 'Gen Z focused brand with emphasis on viral content and trends',
      address: {
        street: '987 Youth St',
        city: 'Los Angeles',
        state: 'CA',
        zip: '90210',
        country: 'USA'
      }
    }
  ];

  const filteredClients = clients.filter(client => {
    const matchesFilter = filter === 'all' || client.status === filter || client.tier === filter;
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.industry.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleClientClick = (client) => {
    setSelectedClient(client);
  };

  const handleCreateClient = (clientData) => {
    console.log('Creating client:', clientData);
    setIsCreateModalOpen(false);
    // In a real app, this would make an API call
  };

  const handleUpdateClient = (clientData) => {
    console.log('Updating client:', clientData);
    setSelectedClient(null);
    // In a real app, this would make an API call
  };

  const getClientStats = () => {
    const stats = {
      total: clients.length,
      active: clients.filter(c => c.status === 'active').length,
      inactive: clients.filter(c => c.status === 'inactive').length,
      premium: clients.filter(c => c.tier === 'premium').length,
      enterprise: clients.filter(c => c.tier === 'enterprise').length,
      totalRevenue: clients.reduce((sum, c) => sum + c.monthlyBudget, 0),
      activeProjects: clients.reduce((sum, c) => sum + c.activeProjects, 0)
    };
    return stats;
  };

  const stats = getClientStats();

  const filterOptions = [
    { value: 'all', label: 'All Clients', count: stats.total },
    { value: 'active', label: 'Active', count: stats.active },
    { value: 'inactive', label: 'Inactive', count: stats.inactive },
    { value: 'premium', label: 'Premium', count: stats.premium },
    { value: 'enterprise', label: 'Enterprise', count: stats.enterprise }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Clients</h1>
        <p className="text-gray-600">Manage your client relationships and projects</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-500">Total Clients</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-sm text-gray-500">Active</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.activeProjects}</div>
            <div className="text-sm text-gray-500">Active Projects</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">${stats.totalRevenue.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Monthly Revenue</div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <Button
                key={option.value}
                variant={filter === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(option.value)}
                className="flex items-center gap-2"
              >
                {option.label}
                <Badge variant="secondary" size="sm">
                  {option.count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>
        
        <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
          <Icons.Plus className="h-4 w-4" />
          New Client
        </Button>
      </div>

      {/* Clients Grid */}
      {filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onClick={() => handleClientClick(client)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Icons.Building}
          title="No clients found"
          description={searchTerm ? 'Try adjusting your search terms' : 'Add your first client to get started'}
          action={
            <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
              <Icons.Plus className="h-4 w-4" />
              Add Client
            </Button>
          }
        />
      )}

      {/* Create Client Modal */}
      <ClientModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateClient}
        title="Add New Client"
      />

      {/* Client Details Modal */}
      {selectedClient && (
        <ClientModal
          isOpen={!!selectedClient}
          onClose={() => setSelectedClient(null)}
          onSave={handleUpdateClient}
          client={selectedClient}
          title="Edit Client"
        />
      )}
    </div>
  );
};

