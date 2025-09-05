// src/components/ui/MobileToast.tsx - Toast ottimizzato per mobile
import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  details?: Array<{ field: string; message: string }>;
}

interface MobileToastProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const MobileToast: React.FC<MobileToastProps> = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Animation: slide in from bottom
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getBgColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getTextColor = () => {
    switch (toast.type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-orange-800';
      default:
        return 'text-blue-800';
    }
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`
        max-w-sm w-full mx-auto mb-mobile-sm p-mobile-sm border rounded-mobile-sm shadow-lg
        transition-all duration-300 ease-in-out transform
        ${getBgColor()}
        ${isVisible && !isExiting 
          ? 'translate-y-0 opacity-100' 
          : isExiting 
          ? '-translate-y-full opacity-0' 
          : 'translate-y-full opacity-0'
        }
      `}
    >
      <div className="flex items-start">
        {/* Icon */}
        <div className="flex-shrink-0 mr-3">
          {getIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-mobile-sm font-medium ${getTextColor()}`}>
            {toast.message}
          </p>
          
          {/* Details per errori di validazione */}
          {toast.details && toast.details.length > 0 && (
            <ul className={`mt-2 text-mobile-xs ${getTextColor()} space-y-1`}>
              {toast.details.map((detail, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-block w-1 h-1 bg-current rounded-full mt-2 mr-2 flex-shrink-0" />
                  <span>{detail.message}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={handleRemove}
          className={`
            flex-shrink-0 ml-3 p-1 rounded-mobile-xs hover:bg-white/50 
            focus:outline-none focus:ring-2 focus:ring-offset-1
            ${toast.type === 'success' ? 'focus:ring-green-500' :
              toast.type === 'error' ? 'focus:ring-red-500' :
              toast.type === 'warning' ? 'focus:ring-orange-500' :
              'focus:ring-blue-500'
            }
          `}
          aria-label="Chiudi notifica"
        >
          <X className={`w-4 h-4 ${getTextColor()}`} />
        </button>
      </div>
    </div>
  );
};

interface MobileToastContainerProps {
  toasts: Toast[];
  onRemoveToast: (id: string) => void;
}

export const MobileToastContainer: React.FC<MobileToastContainerProps> = ({
  toasts,
  onRemoveToast,
}) => {
  if (toasts.length === 0) return null;

  return (
    <div 
      className="fixed top-safe-area-top left-0 right-0 z-50 px-mobile-md pt-mobile-sm pointer-events-none"
      aria-live="polite"
      aria-label="Notifiche"
    >
      <div className="pointer-events-auto">
        {toasts.map((toast) => (
          <MobileToast
            key={toast.id}
            toast={toast}
            onRemove={onRemoveToast}
          />
        ))}
      </div>
    </div>
  );
};