import React, { forwardRef } from 'react';

export const Input = forwardRef(({ 
  label, 
  error, 
  helper, 
  leftIcon, 
  rightIcon, 
  className = '',
  ...props 
}, ref) => {
  const inputClasses = `w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
    error ? 'border-red-300' : 'border-gray-300'
  } ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''} ${className}`;
  
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">{leftIcon}</span>
          </div>
        )}
        <input
          ref={ref}
          className={inputClasses}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-400">{rightIcon}</span>
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helper && !error && (
        <p className="mt-1 text-sm text-gray-500">{helper}</p>
      )}
    </div>
  );
});

export const TextArea = forwardRef(({ 
  label, 
  error, 
  helper, 
  className = '',
  rows = 4,
  ...props 
}, ref) => {
  const textareaClasses = `w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none ${
    error ? 'border-red-300' : 'border-gray-300'
  } ${className}`;
  
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={textareaClasses}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helper && !error && (
        <p className="mt-1 text-sm text-gray-500">{helper}</p>
      )}
    </div>
  );
});

export const Select = forwardRef(({ 
  label, 
  error, 
  helper, 
  options = [], 
  placeholder = 'Select an option',
  className = '',
  ...props 
}, ref) => {
  const selectClasses = `w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
    error ? 'border-red-300' : 'border-gray-300'
  } ${className}`;
  
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={selectClasses}
        {...props}
      >
        {placeholder && (
          <option value="">{placeholder}</option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helper && !error && (
        <p className="mt-1 text-sm text-gray-500">{helper}</p>
      )}
    </div>
  );
});

export const Checkbox = forwardRef(({ 
  label, 
  error, 
  helper, 
  className = '',
  ...props 
}, ref) => {
  return (
    <div>
      <div className="flex items-center">
        <input
          ref={ref}
          type="checkbox"
          className={`h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded ${className}`}
          {...props}
        />
        {label && (
          <label className="ml-2 block text-sm text-gray-700">
            {label}
          </label>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helper && !error && (
        <p className="mt-1 text-sm text-gray-500">{helper}</p>
      )}
    </div>
  );
});

export const FileInput = forwardRef(({ 
  label, 
  error, 
  helper, 
  accept,
  multiple = false,
  className = '',
  ...props 
}, ref) => {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        ref={ref}
        type="file"
        accept={accept}
        multiple={multiple}
        className={`w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helper && !error && (
        <p className="mt-1 text-sm text-gray-500">{helper}</p>
      )}
    </div>
  );
});
