import { Request, Response, NextFunction } from "express";

// Interfaccia base per i nostri errori personalizzati
// Permette di aggiungere uno statusCode e dettagli di validazione
export class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public details?: any[];

  constructor(
    statusCode: number,
    message: string,
    isOperational: boolean = true,
    details: any[] = []
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational; // Per distinguere errori "previsti" (es. input utente errato) da bug del server
    this.details = details;

    // Mantiene lo stack trace corretto per dove è stato generato l'errore
    Error.captureStackTrace(this, this.constructor);
  }
}

export const globalErrorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction // NextFunction è necessario anche se non usato, altrimenti Express non lo riconosce come error handler
): void => {
  // Log dell'errore per il debug
  console.error(`[ERROR] ${new Date().toISOString()} - ${err.stack}`);

  if (err instanceof ApiError) {
    // Se è un nostro errore personalizzato e "operativo" (previsto), inviamo i dettagli al client
    res.status(err.statusCode).json({
      status_code: err.statusCode,
      error: err.name,
      message: err.message,
      timestamp: new Date().toISOString(),
      ...(err.details && err.details.length > 0 && { details: err.details }), // Aggiunge 'details' solo se non è vuoto
    });
  } else {
    // Se è un errore generico o non previsto (un bug), inviamo una risposta generica di sicurezza
    // In produzione, non vogliamo esporre i dettagli dell'errore
    const isProduction = process.env.NODE_ENV === "production";
    const message = isProduction
      ? "An internal server error occurred."
      : err.message;
    const statusCode = 500;

    res.status(statusCode).json({
      status_code: statusCode,
      error: "InternalServerError",
      message: message,
      timestamp: new Date().toISOString(),
    });
  }
};

export class ValidationError extends ApiError {
  constructor(message: string, details: any[] = []) {
    super(400, message, true, details);
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = "Authentication required") {
    super(401, message, true);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string = "Insufficient permissions") {
    super(403, message, true);
    this.name = "AuthorizationError";
  }
}
