import React from 'react';

export const Avatar = ({ 
  src, 
  alt, 
  size = 'md', 
  fallback, 
  className = '',
  ...props 
}) => {
  const sizeClasses = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
    '2xl': 'h-20 w-20'
  };
  
  const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl'
  };
  
  const classes = `inline-flex items-center justify-center rounded-full bg-gray-100 ${sizeClasses[size]} ${className}`;
  
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${classes} object-cover`}
        {...props}
      />
    );
  }
  
  return (
    <div className={classes} {...props}>
      <span className={`font-medium text-gray-600 ${textSizeClasses[size]}`}>
        {fallback || alt?.charAt(0)?.toUpperCase() || '?'}
      </span>
    </div>
  );
};
