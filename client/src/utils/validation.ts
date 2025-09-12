import { ZodSchema, ZodError } from 'zod';

interface ValidationResult {
  success: boolean;
  errors?: Array<{ field: string; message: string }>;
}

/**
 * Valida un valore usando uno schema Zod e ritorna un risultato strutturato
 */
export const validateField = (schema: ZodSchema, value: any): ValidationResult => {
  try {
    schema.parse(value);
    return { success: true };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        errors: error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      };
    }
    return {
      success: false,
      errors: [{ field: 'unknown', message: 'Errore di validazione sconosciuto' }],
    };
  }
};

/**
 * Valida solo un campo specifico di un oggetto
 */
export const validateSingleField = (
  schema: ZodSchema, 
  data: any, 
  fieldPath: string
): ValidationResult => {
  try {
    // Esegui validazione completa ma ritorna solo errori per il campo specifico
    schema.parse(data);
    return { success: true };
  } catch (error) {
    if (error instanceof ZodError) {
      const fieldErrors = error.issues.filter(issue => 
        issue.path.join('.') === fieldPath
      );
      
      if (fieldErrors.length === 0) {
        return { success: true };
      }
      
      return {
        success: false,
        errors: fieldErrors.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      };
    }
    return {
      success: false,
      errors: [{ field: fieldPath, message: 'Errore di validazione' }],
    };
  }
};

/**
 * Debounce function per validazione real-time
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Formatta errori del server per il display nel frontend
 */
export const formatServerError = (error: any): string => {
  // Se è un errore con risposta del server
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  // Se è un errore di rete
  if (error?.code === 'NETWORK_ERROR' || error?.name === 'NetworkError') {
    return 'Errore di connessione. Controlla la tua connessione internet.';
  }
  
  // Se è un timeout
  if (error?.code === 'TIMEOUT') {
    return 'Richiesta scaduta. Riprova più tardi.';
  }
  
  // Fallback generico
  return 'Si è verificato un errore imprevisto. Riprova più tardi.';
};