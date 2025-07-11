import React from 'react';
import { Button } from './Button';

export const EmptyState = ({ 
  title, 
  description, 
  action, 
  illustration, 
  className = '',
  ...props 
}) => {
  const defaultIllustration = (
    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
  
  return (
    <div className={`text-center py-12 ${className}`} {...props}>
      <div className="mb-4">
        {illustration || defaultIllustration}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
          {description}
        </p>
      )}
      {action && (
        <div>
          {action}
        </div>
      )}
    </div>
  );
};

export const ErrorState = ({ 
  title = 'Something went wrong', 
  description = 'An error occurred while loading this content. Please try again.', 
  onRetry,
  className = '',
  ...props 
}) => {
  const errorIllustration = (
    <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
  
  return (
    <div className={`text-center py-12 ${className}`} {...props}>
      <div className="mb-4">
        {errorIllustration}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
        {description}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          Try again
        </Button>
      )}
    </div>
  );
};
