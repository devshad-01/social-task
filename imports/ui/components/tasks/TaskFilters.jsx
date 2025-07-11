import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Input, Select } from '../common/Input';
import { Badge } from '../common/Badge';

export const TaskFilters = ({ 
  onFiltersChange, 
  clients = [], 
  users = [],
  initialFilters = {}
}) => {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    clientId: '',
    assigneeId: '',
    priority: '',
    category: 'work',
    dueDate: '',
    ...initialFilters
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFilterChange = (name, value) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      status: '',
      clientId: '',
      assigneeId: '',
      priority: '',
      category: 'work',
      dueDate: ''
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const activeFiltersCount = Object.values(filters).filter(value => value && value !== 'work').length;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <div className="flex items-center space-x-2">
          {activeFiltersCount > 0 && (
            <Badge variant="primary" size="sm">
              {activeFiltersCount} active
            </Badge>
          )}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? 'Less' : 'More'} Filters
          </Button>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input
            placeholder="Search tasks..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            leftIcon={
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
          
          <Select
            placeholder="All statuses"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            options={[
              { value: 'draft', label: 'Draft' },
              { value: 'scheduled', label: 'Scheduled' },
              { value: 'completed', label: 'Completed' }
            ]}
          />
          
          <Select
            placeholder="All clients"
            value={filters.clientId}
            onChange={(e) => handleFilterChange('clientId', e.target.value)}
            options={clients.map(client => ({
              value: client.id,
              label: client.name
            }))}
          />
        </div>
        
        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
            <Select
              placeholder="All assignees"
              value={filters.assigneeId}
              onChange={(e) => handleFilterChange('assigneeId', e.target.value)}
              options={users.map(user => ({
                value: user.id,
                label: user.fullName
              }))}
            />
            
            <Select
              placeholder="All priorities"
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              options={[
                { value: 'low', label: 'Low Priority' },
                { value: 'medium', label: 'Medium Priority' },
                { value: 'high', label: 'High Priority' }
              ]}
            />
            
            <Select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              options={[
                { value: 'work', label: 'Work' },
                { value: 'personal', label: 'Personal' },
                { value: 'urgent', label: 'Urgent' }
              ]}
            />
            
            <Input
              type="date"
              placeholder="Due date"
              value={filters.dueDate}
              onChange={(e) => handleFilterChange('dueDate', e.target.value)}
            />
          </div>
        )}
        
        {activeFiltersCount > 0 && (
          <div className="flex justify-end pt-4 border-t border-gray-100">
            <Button 
              variant="outline" 
              size="sm"
              onClick={clearFilters}
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
