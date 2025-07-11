import React from 'react';

export const Card = ({ children, className = '', padding = 'md', shadow = 'md', ...props }) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };
  
  const classes = `bg-white rounded-2xl border border-gray-100 ${paddingClasses[padding]} ${shadowClasses[shadow]} ${className}`;
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div className={`border-b border-gray-100 pb-4 mb-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className = '', ...props }) => {
  return (
    <h3 className={`text-lg font-semibold text-gray-900 ${className}`} {...props}>
      {children}
    </h3>
  );
};

export const CardContent = ({ children, className = '', ...props }) => {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
};

export const CardFooter = ({ children, className = '', ...props }) => {
  return (
    <div className={`border-t border-gray-100 pt-4 mt-4 ${className}`} {...props}>
      {children}
    </div>
  );
};
