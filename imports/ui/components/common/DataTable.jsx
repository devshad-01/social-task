import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Badge } from '../common/Badge';
import { EmptyState } from '../common/EmptyState';
import { Loading } from '../common/Loading';
import { Icons } from '../Icons';

export const DataTable = ({ 
  data = [], 
  columns = [], 
  title,
  searchable = true,
  sortable = true,
  filterable = true,
  pagination = true,
  pageSize = 10,
  loading = false,
  onRowClick,
  onSearch,
  onSort,
  onFilter,
  actions = [],
  emptyState
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [selectedRows, setSelectedRows] = useState([]);

  // Filter and search data
  const filteredData = data.filter(item => {
    if (!searchTerm) return true;
    return Object.values(item).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Sort data
  const sortedData = sortable ? [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  }) : filteredData;

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = pagination ? sortedData.slice(startIndex, startIndex + pageSize) : sortedData;

  const handleSort = (key) => {
    if (!sortable) return;
    
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
    onSort?.(key, direction);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
    onSearch?.(value);
  };

  const handleRowSelect = (rowId) => {
    setSelectedRows(prev => 
      prev.includes(rowId) 
        ? prev.filter(id => id !== rowId)
        : [...prev, rowId]
    );
  };

  const handleSelectAll = () => {
    setSelectedRows(
      selectedRows.length === paginatedData.length
        ? []
        : paginatedData.map(item => item.id)
    );
  };

  const renderCell = (item, column) => {
    if (column.render) {
      return column.render(item[column.key], item);
    }

    const value = item[column.key];

    if (column.type === 'badge') {
      return (
        <Badge 
          variant={column.badgeVariant?.(value) || 'secondary'}
          size="sm"
        >
          {value}
        </Badge>
      );
    }

    if (column.type === 'date') {
      return new Date(value).toLocaleDateString();
    }

    if (column.type === 'boolean') {
      return value ? (
        <Icons.check className="w-4 h-4 text-green-600" />
      ) : (
        <Icons.x className="w-4 h-4 text-red-600" />
      );
    }

    return value;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <Loading message="Loading data..." />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {(title || searchable || actions.length > 0) && (
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {title && <CardTitle>{title}</CardTitle>}
            
            <div className="flex items-center space-x-2">
              {searchable && (
                <Input
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search..."
                  prefix={<Icons.search className="w-4 h-4 text-gray-400" />}
                  className="w-64"
                />
              )}
              
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'primary'}
                  size="sm"
                  onClick={action.onClick}
                  disabled={action.disabled}
                >
                  {action.icon && <action.icon className="w-4 h-4 mr-2" />}
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
      )}

      <CardContent className="p-0">
        {paginatedData.length === 0 ? (
          <div className="p-8">
            {emptyState || (
              <EmptyState
                icon={Icons.inbox}
                title="No data available"
                description="No items match your current search criteria."
              />
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {columns.some(col => col.selectable) && (
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedRows.length === paginatedData.length}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                  )}
                  {columns.map((column, index) => (
                    <th
                      key={index}
                      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                        sortable && column.sortable !== false ? 'cursor-pointer hover:text-gray-700' : ''
                      }`}
                      onClick={() => sortable && column.sortable !== false && handleSort(column.key)}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{column.title}</span>
                        {sortable && column.sortable !== false && (
                          <span className="ml-1">
                            {sortConfig.key === column.key ? (
                              sortConfig.direction === 'asc' ? (
                                <Icons.chevronUp className="w-3 h-3" />
                              ) : (
                                <Icons.chevronDown className="w-3 h-3" />
                              )
                            ) : (
                              <Icons.chevronUp className="w-3 h-3 text-gray-300" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedData.map((item, index) => (
                  <tr
                    key={item.id || index}
                    onClick={() => onRowClick?.(item)}
                    className={`${
                      onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''
                    } ${selectedRows.includes(item.id) ? 'bg-blue-50' : ''}`}
                  >
                    {columns.some(col => col.selectable) && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(item.id)}
                          onChange={() => handleRowSelect(item.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                    )}
                    {columns.map((column, colIndex) => (
                      <td
                        key={colIndex}
                        className={`px-6 py-4 whitespace-nowrap text-sm ${
                          column.className || 'text-gray-900'
                        }`}
                      >
                        {renderCell(item, column)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(startIndex + pageSize, sortedData.length)} of {sortedData.length} results
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <Icons.chevronLeft className="w-4 h-4" />
              </Button>
              
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                <Icons.chevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
