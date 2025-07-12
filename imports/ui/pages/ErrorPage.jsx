import React from 'react';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { Icons } from '../components/Icons';

export const ErrorPage = ({ error, onRetry, onGoHome }) => {
  const getErrorIcon = (type) => {
    switch (type) {
      case '404':
        return Icons.search;
      case '500':
        return Icons.bell;  // Using bell since alertCircle doesn't exist in Icons
      case 'network':
        return Icons.eye;  // Using eye since wifi doesn't exist in Icons
      default:
        return Icons.bell;  // Using bell since alertTriangle doesn't exist in Icons
    }
  };

  const getErrorMessage = (type) => {
    switch (type) {
      case '404':
        return {
          title: 'Page Not Found',
          description: 'The page you\'re looking for doesn\'t exist or has been moved.',
          showRetry: false
        };
      case '500':
        return {
          title: 'Server Error',
          description: 'Something went wrong on our end. Please try again later.',
          showRetry: true
        };
      case 'network':
        return {
          title: 'Connection Error',
          description: 'Please check your internet connection and try again.',
          showRetry: true
        };
      default:
        return {
          title: 'Something went wrong',
          description: error?.message || 'An unexpected error occurred.',
          showRetry: true
        };
    }
  };

  const errorInfo = getErrorMessage(error?.type || 'default');
  const ErrorIcon = getErrorIcon(error?.type || 'default');

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <EmptyState
          illustration={ErrorIcon}
          title={errorInfo.title}
          description={errorInfo.description}
          className="text-center"
        />
        
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={onGoHome}
            variant="primary"
            className="w-full sm:w-auto"
          >
            <Icons.home className="w-4 h-4 mr-2" />
            Go Home
          </Button>
          
          {errorInfo.showRetry && onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <Icons.chevronDown className="w-4 h-4 mr-2" />  {/* Using chevronDown since refresh doesn't exist */}
              Try Again
            </Button>
          )}
        </div>

        {error?.details && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              Error Details
            </h3>
            <p className="text-sm text-gray-600 font-mono">
              {error.details}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
