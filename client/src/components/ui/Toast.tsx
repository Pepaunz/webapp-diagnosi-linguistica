// client/src/components/ui/Toast.tsx
import React from 'react';
import { X, AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react';

interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  details?: Array<{ field: string; message: string }>;
  onClose: (id: string) => void;
  autoClose?: boolean;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  message,
  details = [],
  onClose,
  autoClose = true,
}) => {
  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className={`flex items-start p-4 border rounded-lg shadow-sm ${getToastStyles()}`}>
      <div className="flex-shrink-0">
        {getIcon()}
      </div>
      
      <div className="ml-3 flex-1">
        <p className="text-sm font-medium">{message}</p>
        
        {details.length > 0 && (
          <div className="mt-2">
            <ul className="text-xs space-y-1">
              {details.map((detail, index) => (
                <li key={index} className="flex">
                  <span className="font-medium mr-2">{detail.field}:</span>
                  <span>{detail.message}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <div className="ml-4">
        <button
          onClick={() => onClose(id)}
          className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Toast Container per gestire multiple toast
interface ToastContainerProps {
  toasts: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    details?: Array<{ field: string; message: string }>;
  }>;
  onRemoveToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onRemoveToast,
}) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="animate-in slide-in-from-right-full duration-300"
        >
          <Toast
            id={toast.id}
            type={toast.type}
            message={toast.message}
            details={toast.details}
            onClose={onRemoveToast}
          />
        </div>
      ))}
    </div>
  );
};