import { useState, useCallback } from 'react';
import { ZodSchema } from 'zod';
import { validateField, validateSingleField, debounce } from '../utils/validation';
import { useError } from '../context/ErrorContext';

interface UseValidationOptions {
  schema: ZodSchema;
  debounceMs?: number;
  validateOnChange?: boolean;
}

interface UseValidationReturn {
  errors: Record<string, string>;
  isValid: boolean;
  validateForm: (data: any) => boolean;
  validateField: (fieldName: string, value: any, fullData: any) => void;
  clearFieldError: (fieldName: string) => void;
  clearAllErrors: () => void;
}

export const useValidation = ({
  schema,
  debounceMs = 500,
  validateOnChange = true,
}: UseValidationOptions): UseValidationReturn => {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { showError } = useError();

  // Validazione completa del form (per submit)
  const validateForm = useCallback((data: any): boolean => {
    const result = validateField(schema, data);
    
    if (!result.success && result.errors) {
      // Aggiorna gli errori locali per i campi
      const newFieldErrors: Record<string, string> = {};
      result.errors.forEach(error => {
        newFieldErrors[error.field] = error.message;
      });
      setFieldErrors(newFieldErrors);
      
      // Mostra anche toast per errori critici
      showError(result.errors[0].message, 'validation');
      return false;
    }
    
    // Se tutto ok, pulisci gli errori
    setFieldErrors({});
    return true;
  }, [schema, showError]);

  // Validazione singolo campo (real-time)
  const validateFieldDebounced = useCallback(
    debounce((fieldName: string, value: any, fullData: any) => {
      if (!validateOnChange) return;
      
      const result = validateSingleField(schema, fullData, fieldName);
      
      if (!result.success && result.errors) {
        const error = result.errors.find(err => err.field === fieldName);
        if (error) {
          setFieldErrors(prev => ({
            ...prev,
            [fieldName]: error.message,
          }));
        }
      } else {
        // Rimuovi errore se ora è valido
        setFieldErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });
      }
    }, debounceMs),
    [schema, validateOnChange, debounceMs]
  );

  const validateFieldImmediate = useCallback((fieldName: string, value: any, fullData: any) => {
    validateFieldDebounced(fieldName, value, fullData);
  }, [validateFieldDebounced]);

  const clearFieldError = useCallback((fieldName: string) => {
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setFieldErrors({});
  }, []);

  return {
    errors: fieldErrors,
    isValid: Object.keys(fieldErrors).length === 0,
    validateForm,
    validateField: validateFieldImmediate,
    clearFieldError,
    clearAllErrors,
  };
};