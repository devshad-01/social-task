import React, { useState, useEffect, useRef } from 'react';
import { Icons } from '../Icons';

export const SearchBar = ({ 
  isOpen = false, 
  onClose, 
  isMobile = false, 
  onFocus, 
  onBlur 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && isMobile && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMobile]);

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    
    // Mock search - replace with actual search logic
    setTimeout(() => {
      const mockResults = [
        {
          id: '1',
          title: 'Instagram Post - Brand Campaign',
          type: 'task',
          client: 'Acme Corp',
          description: 'Create engaging content for summer campaign'
        },
        {
          id: '2',
          title: 'Facebook Ad Creative',
          type: 'task',
          client: 'Tech Startup',
          description: 'Design compelling ad visuals'
        },
        {
          id: '3',
          title: 'Acme Corp',
          type: 'client',
          description: 'Technology company specializing in digital solutions'
        }
      ].filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase())
      );
      
      setResults(mockResults);
      setIsSearching(false);
    }, 300);
  };

  const handleInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    handleSearch(query);
  };

  const handleClear = () => {
    setSearchQuery('');
    setResults([]);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const getResultIcon = (type) => {
    switch (type) {
      case 'task':
        return Icons.tasks;
      case 'client':
        return Icons.building;
      case 'user':
        return Icons.user;
      default:
        return Icons.search;
    }
  };

  if (isMobile) {
    return (
      <div className="flex flex-col h-full bg-white">
        {/* Mobile Search Header */}
        <div className="flex items-center p-4 border-b border-neutral-200">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icons.search className="h-5 w-5 text-neutral-400" />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              placeholder="Search tasks, clients, users..."
              className="input pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={handleClear}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <Icons.close className="h-5 w-5 text-neutral-400 hover:text-neutral-600" />
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-3 text-primary-600 font-medium"
          >
            Cancel
          </button>
        </div>

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto">
          {isSearching ? (
            <div className="p-6 text-center">
              <div className="loading-spinner w-8 h-8 mx-auto mb-3" />
              <p className="text-neutral-500">Searching...</p>
            </div>
          ) : searchQuery && results.length === 0 ? (
            <div className="p-6 text-center">
              <Icons.search className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-500">No results found</p>
              <p className="text-sm text-neutral-400 mt-1">Try searching for tasks, clients, or team members</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {results.map((result) => {
                const IconComponent = getResultIcon(result.type);
                
                return (
                  <div
                    key={result.id}
                    className="p-4 hover:bg-neutral-50 cursor-pointer transition-colors duration-200"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center">
                          <IconComponent className="w-4 h-4 text-neutral-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-800 truncate">
                          {result.title}
                        </p>
                        <p className="text-sm text-neutral-600 mt-1">
                          {result.description}
                        </p>
                        {result.client && (
                          <p className="text-xs text-neutral-500 mt-1">
                            {result.client}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        <span className="badge badge-neutral capitalize">
                          {result.type}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop Search Bar
  return (
    <div className="relative">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icons.search className="h-5 w-5 text-neutral-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder="Search..."
          className="input pl-10 pr-4 w-64 focus:w-80 transition-all duration-200"
        />
      </div>

      {/* Desktop Search Results Dropdown */}
      {searchQuery && (
        <div className="absolute top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-neutral-200 z-50 animate-fade-in">
          {isSearching ? (
            <div className="p-4 text-center">
              <div className="loading-spinner w-6 h-6 mx-auto mb-2" />
              <p className="text-sm text-neutral-500">Searching...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-sm text-neutral-500">No results found</p>
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto custom-scrollbar">
              <div className="divide-y divide-neutral-100">
                {results.map((result) => {
                  const IconComponent = getResultIcon(result.type);
                  
                  return (
                    <div
                      key={result.id}
                      className="p-3 hover:bg-neutral-50 cursor-pointer transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-6 h-6 bg-neutral-100 rounded-full flex items-center justify-center">
                            <IconComponent className="w-3 h-3 text-neutral-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-800 truncate">
                            {result.title}
                          </p>
                          <p className="text-xs text-neutral-500 truncate">
                            {result.description}
                          </p>
                        </div>
                        <span className="badge badge-neutral text-xs capitalize">
                          {result.type}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
