// client/src/hooks/useErrorHandler.ts
import { useState, useCallback } from 'react';
import { ZodError } from 'zod';

interface ErrorDetail {
  field: string;
  message: string;
}

interface AppError {
  id: string;
  type: 'validation' | 'server' | 'network' | 'generic';
  message: string;
  details?: ErrorDetail[];
  timestamp: Date;
}

interface UseErrorHandlerReturn {
  errors: AppError[];
  showError: (error: string | Error | ZodError | any, type?: AppError['type']) => void;
  showSuccess: (message: string) => void;
  clearError: (errorId: string) => void;
  clearAllErrors: () => void;
  hasErrors: boolean;
  getFieldError: (fieldName: string) => string | undefined;
}

export const useErrorHandler = (): UseErrorHandlerReturn => {
  const [errors, setErrors] = useState<AppError[]>([]);

  const showError = useCallback((error: string | Error | ZodError | any, type: AppError['type'] = 'generic') => {
    const errorId = `error_${Date.now()}_${Math.random()}`;
    let appError: AppError;

    if (typeof error === 'string') {
      // Errore stringa semplice
      appError = {
        id: errorId,
        type,
        message: error,
        timestamp: new Date(),
      };
    } else if (error instanceof ZodError) {
      // Errore di validazione Zod
      const details: ErrorDetail[] = error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      
      appError = {
        id: errorId,
        type: 'validation',
        message: 'Errori di validazione rilevati',
        details,
        timestamp: new Date(),
      };
    } else if (error?.response?.data) {
      // Errore dal server con formato API standardizzato
      const serverError = error.response.data;
      appError = {
        id: errorId,
        type: 'server',
        message: serverError.message || 'Errore dal server',
        details: serverError.details || [],
        timestamp: new Date(),
      };
    } else if (error instanceof Error) {
      // Errore JavaScript generico
      appError = {
        id: errorId,
        type: error.name === 'TypeError' || error.name === 'ReferenceError' ? 'generic' : type,
        message: error.message,
        timestamp: new Date(),
      };
    } else {
      // Fallback per errori sconosciuti
      appError = {
        id: errorId,
        type: 'generic',
        message: 'Si è verificato un errore sconosciuto',
        timestamp: new Date(),
      };
    }

    setErrors(prev => [...prev, appError]);

   // Auto-remove con tempistiche differenti per tipo
    const autoRemoveDelay = appError.type === 'validation' ? 8000 :  // 8s per validation
          appError.type === 'network' ? 6000 :     // 6s per network  
          appError.type === 'server' ? 10000 :     // 10s per server
          7000;                                     // 7s per generic

    setTimeout(() => {
      clearError(errorId);
    }, autoRemoveDelay);
  }, []);

  const clearError = useCallback((errorId: string) => {
    setErrors(prev => prev.filter(error => error.id !== errorId));
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const getFieldError = useCallback((fieldName: string): string | undefined => {
    const validationError = errors.find(error => 
      error.type === 'validation' && 
      error.details?.some(detail => detail.field === fieldName)
    );
    
    if (validationError) {
      const fieldDetail = validationError.details?.find(detail => detail.field === fieldName);
      return fieldDetail?.message;
    }
    
    return undefined;
  }, [errors]);

  const showSuccess = useCallback((message: string) => {
    const errorId = `success_${Date.now()}_${Math.random()}`;
    const successMessage: AppError = {
      id: errorId,
      type: 'generic',
      message,
      timestamp: new Date(),
    };

    setErrors(prev => [...prev, successMessage]);

  
    setTimeout(() => {
      clearError(errorId);
    }, 4000);
  }, []);

  return {
    errors,
    showError,
    showSuccess,
    clearError,
    clearAllErrors,
    hasErrors: errors.length > 0,
    getFieldError,
  };
};