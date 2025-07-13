import React from 'react';

export const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md', 
  className = '',
  ...props 
}) => {
  if (!isOpen) return null;
  
  const sizeClass = size === 'lg' ? 'size-lg' : size === 'xl' ? 'size-xl' : '';
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className={`modal-container ${sizeClass} ${className}`}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {title && (
          <div className="modal-header">
            <h3 className="modal-title">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="modal-close"
              type="button"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>
  );
};
