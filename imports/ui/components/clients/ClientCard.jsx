import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card';
import { Badge } from '../common/Badge';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';

export const ClientCard = ({ 
  client, 
  onEdit, 
  onView, 
  onArchive, 
  onConnect,
  showActions = true 
}) => {
  const connectedAccountsCount = client.socialAccounts?.filter(account => account.isConnected).length || 0;
  const totalAccountsCount = client.socialAccounts?.length || 0;
  
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar 
              src={client.logoUrl} 
              alt={client.name}
              size="lg"
              fallback={client.name.charAt(0)}
            />
            <div>
              <CardTitle className="text-lg">{client.name}</CardTitle>
              <p className="text-sm text-gray-600">{client.contact?.name}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {client.isArchived ? (
              <Badge variant="default">Archived</Badge>
            ) : (
              <Badge variant="success">Active</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Contact Email:</span>
            <span className="text-gray-900">{client.contact?.email || 'Not provided'}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Contact Phone:</span>
            <span className="text-gray-900">{client.contact?.phone || 'Not provided'}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Social Accounts:</span>
            <div className="flex items-center space-x-2">
              <span className="text-gray-900">
                {connectedAccountsCount}/{totalAccountsCount}
              </span>
              {connectedAccountsCount > 0 && (
                <Badge variant="success" size="sm">
                  {connectedAccountsCount} connected
                </Badge>
              )}
            </div>
          </div>
          
          {client.socialAccounts && client.socialAccounts.length > 0 && (
            <div className="pt-2">
              <div className="flex flex-wrap gap-2">
                {client.socialAccounts.map(account => (
                  <Badge 
                    key={account.id}
                    variant={account.isConnected ? 'success' : 'default'}
                    size="sm"
                  >
                    <div className="flex items-center space-x-1">
                      <span>{account.platform}</span>
                      {account.isConnected ? (
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <div className="text-xs text-gray-500 pt-2">
            Created: {new Date(client.createdAt).toLocaleDateString()}
          </div>
        </div>
        
        {showActions && (
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              {onView && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onView(client)}
                >
                  View Details
                </Button>
              )}
              
              {onEdit && (
                <Button 
                  size="sm" 
                  variant="primary"
                  onClick={() => onEdit(client)}
                >
                  Edit
                </Button>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {onConnect && (
                <Button 
                  size="sm" 
                  variant="success"
                  onClick={() => onConnect(client)}
                >
                  Connect Accounts
                </Button>
              )}
              
              {onArchive && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onArchive(client)}
                >
                  {client.isArchived ? 'Restore' : 'Archive'}
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
