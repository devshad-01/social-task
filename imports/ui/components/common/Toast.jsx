import React, { useState, useEffect } from 'react';
import { Alert } from '../common/Alert';
import { Button } from '../common/Button';
import { Icons } from '../Icons';

export const Toast = ({ 
  id, 
  message, 
  type = 'info', 
  duration = 5000, 
  onClose, 
  action,
  persistent = false 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!persistent && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose?.(id), 300); // Allow for fade out animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, persistent, onClose, id]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose?.(id), 300);
  };

  return (
    <div
      className={`transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <Alert
        variant={type}
        className="mb-2 flex items-center justify-between shadow-lg"
        onClose={handleClose}
      >
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          {action && (
            <Button
              variant="ghost"
              size="sm"
              onClick={action.onClick}
              className="text-xs"
            >
              {action.label}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="p-1"
          >
            <Icons.x className="w-4 h-4" />
          </Button>
        </div>
      </Alert>
    </div>
  );
};

export const ToastContainer = ({ toasts = [], onRemoveToast }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={onRemoveToast}
        />
      ))}
    </div>
  );
};

// Hook for managing toasts
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { ...toast, id }]);
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearToasts = () => {
    setToasts([]);
  };

  const showSuccess = (message, options = {}) => {
    return addToast({ message, type: 'success', ...options });
  };

  const showError = (message, options = {}) => {
    return addToast({ message, type: 'error', ...options });
  };

  const showWarning = (message, options = {}) => {
    return addToast({ message, type: 'warning', ...options });
  };

  const showInfo = (message, options = {}) => {
    return addToast({ message, type: 'info', ...options });
  };

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};
