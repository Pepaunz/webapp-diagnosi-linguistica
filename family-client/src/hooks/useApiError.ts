// src/hooks/useApiError.ts - Hook semplificato per gestire errori API
import { useCallback } from 'react';
import { useError } from '../context/ErrorContext';
import { ApiError, isNetworkError } from '../services/apiService';

interface UseApiErrorReturn {
  handleApiError: (error: unknown, context?: string) => void;
  handleApiSuccess: (message: string) => void;
  clearErrors: () => void;
}

/**
 * Hook semplificato per gestire errori API nel family-client
 * Fornisce metodi standard per gestire errori server, rete e validazione
 */
export const useApiError = (): UseApiErrorReturn => {
  const { showError, showSuccess, clearAllErrors } = useError();

  const handleApiError = useCallback((error: unknown, context = 'operazione') => {
    console.error(`API Error in ${context}:`, error);
    
    if (isNetworkError(error)) {
      showError('Problemi di connessione. Controlla la connessione internet e riprova.', 'network');
    } else if (error instanceof ApiError) {
      let errorType: 'server' | 'validation' | 'network' = 'server';
      let message = error.message;
      
      switch (error.status) {
        case 400:
        case 422:
          errorType = 'validation';
          message = 'Controlla i dati inseriti e riprova.';
          break;
        case 401:
          message = 'Accesso non autorizzato.';
          break;
        case 403:
          message = 'Non hai i permessi per questa operazione.';
          break;
        case 404:
          message = 'Risorsa non trovata.';
          break;
        case 429:
          message = 'Troppe richieste. Riprova più tardi.';
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          message = 'Errore del server. Riprova più tardi.';
          break;
        default:
          message = error.message || `Errore durante ${context}`;
      }
      
      showError(error, errorType);
    } else if (error instanceof Error) {
      if (error.name === 'AbortError') {
        // Request cancelled - non mostrare errore
        return;
      }
      showError(`Errore durante ${context}: ${error.message}`, 'generic');
    } else {
      showError(`Errore imprevisto durante ${context}`, 'generic');
    }
  }, [showError]);

  const handleApiSuccess = useCallback((message: string) => {
    showSuccess(message);
  }, [showSuccess]);

  const clearErrors = useCallback(() => {
    clearAllErrors();
  }, [clearAllErrors]);

  return {
    handleApiError,
    handleApiSuccess,
    clearErrors
  };
};