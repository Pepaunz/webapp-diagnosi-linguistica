// src/context/ErrorContext.tsx - Versione mobile-first per family-client
import React, { createContext, useContext, ReactNode } from 'react';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { MobileToastContainer } from "../components/ui/MobileToast"
import { AlertCircle } from 'lucide-react';

interface ErrorContextType {
  showError: (error: any, type?: 'validation' | 'server' | 'network' | 'generic') => void;
  showSuccess: (message: string) => void;
  clearError: (errorId: string) => void;
  clearAllErrors: () => void;
  hasErrors: boolean;
  getFieldError: (fieldName: string) => string | undefined;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

interface ErrorProviderProps {
  children: ReactNode;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const errorHandler = useErrorHandler();

  // Converte gli errori in formato toast mobile-friendly
  const toasts = errorHandler.errors.map(error => ({
    id: error.id,
    type: error.type === 'validation' ? 'error' as const : 
          error.type === 'server' ? 'error' as const :
          error.type === 'network' ? 'warning' as const : 
          error.message.toLowerCase().includes('successo') || error.id.startsWith('success_') ? 'success' as const : 'info' as const,
    message: error.message,
    details: error.details,
  }));

  return (
    <ErrorContext.Provider value={errorHandler}>
      {children}
      <MobileToastContainer 
        toasts={toasts} 
        onRemoveToast={errorHandler.clearError} 
      />
    </ErrorContext.Provider>
  );
};

// Hook per usare il context
export const useError = (): ErrorContextType => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError deve essere utilizzato all\'interno di un ErrorProvider');
  }
  return context;
};

// Error Boundary semplificato per mobile
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  { children: ReactNode; onError?: (error: Error) => void },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode; onError?: (error: Error) => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-mobile-md">
          <div className="max-w-sm w-full bg-white rounded-mobile-lg shadow-lg p-mobile-lg text-center">
            <AlertCircle className="mx-auto w-16 h-16 text-red-500 mb-mobile-md" />
            <h2 className="text-mobile-lg font-semibold text-family-text-primary mb-mobile-sm">
              Qualcosa è andato storto
            </h2>
            <p className="text-mobile-sm text-family-text-body mb-mobile-md leading-relaxed">
              Si è verificato un errore imprevisto. Prova a ricaricare la pagina.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-family-primary text-white py-mobile-sm px-mobile-md rounded-mobile-sm font-medium hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-family-primary focus:ring-offset-2 transition-colors min-h-touch-md"
            >
              Ricarica Pagina
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}