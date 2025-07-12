import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Input } from '../components/common/Input';
import { EmptyState } from '../components/common/EmptyState';
import { Loading } from '../components/common/Loading';
import { TaskCard } from '../components/tasks/TaskCard';
import { ClientCard } from '../components/clients/ClientCard';
import { NotificationCard } from '../components/notifications/NotificationCard';
import { Icons } from '../components/Icons';

export const SearchResults = ({ query, onQueryChange }) => {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');

  // Mock search results
  const mockResults = [
    {
      id: 1,
      type: 'task',
      title: 'Instagram Content Calendar',
      description: 'Create monthly content calendar for Fashion Brand Co.',
      priority: 'high',
      status: 'in_progress',
      client: 'Fashion Brand Co.',
      dueDate: '2024-01-15',
      tags: ['content', 'instagram', 'calendar'],
      relevance: 95
    },
    {
      id: 2,
      type: 'client',
      title: 'Fashion Brand Co.',
      description: 'Premium fashion retailer focusing on sustainable clothing',
      industry: 'Fashion',
      status: 'active',
      activeTasks: 5,
      tags: ['fashion', 'retail', 'premium'],
      relevance: 90
    },
    {
      id: 3,
      type: 'task',
      title: 'Facebook Ad Campaign',
      description: 'Launch new customer acquisition campaign',
      priority: 'medium',
      status: 'pending',
      client: 'Tech Startup Inc.',
      dueDate: '2024-01-20',
      tags: ['facebook', 'ads', 'campaign'],
      relevance: 85
    },
    {
      id: 4,
      type: 'notification',
      title: 'Task Deadline Approaching',
      description: 'Instagram Content Calendar is due in 2 days',
      type: 'reminder',
      priority: 'high',
      timestamp: '2024-01-12T10:00:00Z',
      tags: ['reminder', 'deadline'],
      relevance: 80
    },
    {
      id: 5,
      type: 'team',
      title: 'Sarah Johnson',
      description: 'Team Lead - Creative Department',
      role: 'Team Lead',
      department: 'Creative',
      skills: ['Content Creation', 'Strategy', 'Instagram'],
      tags: ['team', 'creative', 'lead'],
      relevance: 75
    }
  ];

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const filtered = mockResults.filter(item => {
        const matchesQuery = item.title.toLowerCase().includes(query.toLowerCase()) ||
                           item.description.toLowerCase().includes(query.toLowerCase()) ||
                           item.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));
        
        const matchesFilter = filter === 'all' || item.type === filter;
        
        return matchesQuery && matchesFilter;
      });

      const sorted = filtered.sort((a, b) => {
        if (sortBy === 'relevance') {
          return b.relevance - a.relevance;
        } else if (sortBy === 'date') {
          return new Date(b.timestamp || b.dueDate || '2024-01-01') - 
                 new Date(a.timestamp || a.dueDate || '2024-01-01');
        }
        return 0;
      });

      setResults(sorted);
      setIsLoading(false);
    }, 500);
  }, [query, filter, sortBy]);

  const filters = [
    { id: 'all', label: 'All Results', count: results.length },
    { id: 'task', label: 'Tasks', count: results.filter(r => r.type === 'task').length },
    { id: 'client', label: 'Clients', count: results.filter(r => r.type === 'client').length },
    { id: 'notification', label: 'Notifications', count: results.filter(r => r.type === 'notification').length },
    { id: 'team', label: 'Team', count: results.filter(r => r.type === 'team').length }
  ];

  const renderResultItem = (item) => {
    switch (item.type) {
      case 'task':
        return (
          <TaskCard
            key={item.id}
            task={item}
            onEdit={() => {}}
            onDelete={() => {}}
            onStatusChange={() => {}}
          />
        );
      case 'client':
        return (
          <ClientCard
            key={item.id}
            client={item}
            onEdit={() => {}}
            onDelete={() => {}}
          />
        );
      case 'notification':
        return (
          <NotificationCard
            key={item.id}
            notification={item}
            onMarkAsRead={() => {}}
            onDelete={() => {}}
          />
        );
      case 'team':
        return (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Icons.user className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{item.title}</h3>
                  <p className="text-sm text-gray-600 truncate">{item.description}</p>
                </div>
                <Badge variant="secondary">{item.role}</Badge>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Search Results</h1>
          <p className="text-gray-600 mt-1">
            {query ? `Results for "${query}"` : 'Enter a search term to find content'}
          </p>
        </div>
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="relevance">Sort by Relevance</option>
            <option value="date">Sort by Date</option>
          </select>
        </div>
      </div>

      {/* Search Input */}
      <div className="mb-6">
        <Input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search tasks, clients, notifications, team members..."
          className="w-full"
          prefix={<Icons.search className="w-4 h-4 text-gray-400" />}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((filterOption) => (
          <Button
            key={filterOption.id}
            variant={filter === filterOption.id ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter(filterOption.id)}
            className="flex items-center space-x-2"
          >
            <span>{filterOption.label}</span>
            <Badge variant={filter === filterOption.id ? 'primary' : 'secondary'} size="sm">
              {filterOption.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Results */}
      <div>
        {isLoading ? (
          <Loading message="Searching..." />
        ) : !query.trim() ? (
          <EmptyState
            illustration={React.createElement(Icons.search, { className: "mx-auto h-12 w-12 text-gray-400" })}
            title="Start Your Search"
            description="Enter a search term above to find tasks, clients, notifications, and team members."
          />
        ) : results.length === 0 ? (
          <EmptyState
            illustration={React.createElement(Icons.search, { className: "mx-auto h-12 w-12 text-gray-400" })}
            title="No Results Found"
            description={`No results found for "${query}". Try different keywords or filters.`}
          />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {results.length} result{results.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {results.map(renderResultItem)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
