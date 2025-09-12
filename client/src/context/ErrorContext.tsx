// client/src/context/ErrorContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { ToastContainer } from '../components/ui/Toast';
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
      <ToastContainer 
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

// Error Boundary per catturare errori React non gestiti
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
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <AlertCircle className="mx-auto w-12 h-12 text-red-500 mb-4" />
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Qualcosa è andato storto
              </h2>
              <p className="text-gray-600 mb-4">
                Si è verificato un errore imprevisto. Prova a ricaricare la pagina.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Ricarica Pagina
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}