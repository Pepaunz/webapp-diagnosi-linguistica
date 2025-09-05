// src/hooks/useErrorHandler.ts - Versione adattata per family-client
import { useState, useCallback } from 'react';
import { ZodError } from 'zod';
import { ApiError } from '../services/apiService';

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
  showError: (error: string | Error | ZodError | ApiError | any, type?: AppError['type']) => void;
  showSuccess: (message: string) => void;
  clearError: (errorId: string) => void;
  clearAllErrors: () => void;
  hasErrors: boolean;
  getFieldError: (fieldName: string) => string | undefined;
}

export const useErrorHandler = (): UseErrorHandlerReturn => {
  const [errors, setErrors] = useState<AppError[]>([]);

  const showError = useCallback((
    error: string | Error | ZodError | ApiError | any, 
    type: AppError['type'] = 'generic'
  ) => {
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
        message: 'Controlla i dati inseriti',
        details,
        timestamp: new Date(),
      };
    } else if (error instanceof ApiError) {
      // Errore dalla nostra ApiError class
      let errorType: AppError['type'] = 'server';
      let message = error.message;
      
      // Determina il tipo di errore basato sullo status
      if (error.status >= 400 && error.status < 500) {
        if (error.status === 422) {
          errorType = 'validation';
          message = 'Controlla i dati inseriti';
        } else if (error.status === 404) {
          message = 'Risorsa non trovata';
        }
      } else if (error.status >= 500) {
        errorType = 'server';
        message = 'Errore del server. Riprova più tardi.';
      }
      
      // Gestisci errori di rete (fetch failed)
      if (error.message.includes('Failed to fetch') || error.status === 0) {
        errorType = 'network';
        message = 'Problemi di connessione. Controlla la connessione internet.';
      }

      const details: ErrorDetail[] = [];
      if (error.response?.details && Array.isArray(error.response.details)) {
        error.response.details.forEach((detail: any) => {
          if (detail.field && detail.message) {
            details.push({
              field: detail.field,
              message: detail.message
            });
          }
        });
      }

      appError = {
        id: errorId,
        type: errorType,
        message,
        details: details.length > 0 ? details : undefined,
        timestamp: new Date(),
      };
    } else if (error?.response?.data) {
      // Errore dal server con formato API standardizzato (Axios style)
      const serverError = error.response.data;
      appError = {
        id: errorId,
        type: 'server',
        message: serverError.message || 'Errore dal server',
        details: serverError.details || [],
        timestamp: new Date(),
      };
    } else if (error instanceof TypeError && error.message.includes('fetch')) {
      // Errore di rete
      appError = {
        id: errorId,
        type: 'network',
        message: 'Problemi di connessione. Controlla la connessione internet.',
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
        message: 'Si è verificato un errore imprevisto',
        timestamp: new Date(),
      };
    }

    setErrors(prev => [...prev, appError]);

    // Auto-remove con tempistiche differenti per mobile
    const autoRemoveDelay = appError.type === 'validation' ? 15000 : // 15s per validation
                           appError.type === 'network' ? 8000 :    // 8s per network
                           appError.type === 'server' ? 10000 :    // 10s per server
                           7000;                                    // 7s per generic

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
      type: 'generic', // Usiamo generic ma lo gestiamo come success nel context
      message,
      timestamp: new Date(),
    };

    setErrors(prev => [...prev, successMessage]);

    // Auto-remove dopo 4 secondi per successi (più veloce su mobile)
    setTimeout(() => {
      clearError(errorId);
    }, 4000);
  }, [clearError]);

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