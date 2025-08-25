import { Request, Response, NextFunction } from "express";
import { verifyJwt, JwtPayload } from "../../utils/jwt.utils";
import { ApiError } from "./errorHandler.middleware";

// Extend Express Request interface per includere l'operatore autenticato
declare global {
  namespace Express {
    interface Request {
      operator?: JwtPayload;
    }
  }
}

/**
 * Middleware di autenticazione JWT per proteggere le rotte degli operatori.
 * Verifica la presenza e validità del token JWT nell'header Authorization.
 */
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Estrae il token dall'header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new ApiError(401, "Authorization header missing");
    }

    // Verifica che il formato sia "Bearer <token>"
    const tokenParts = authHeader.split(" ");
    if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
      throw new ApiError(401, "Invalid authorization header format");
    }

    const token = tokenParts[1];

    // Verifica e decodifica il token JWT
    const payload = verifyJwt(token);

    // Aggiunge i dati dell'operatore alla richiesta
    req.operator = payload;

    next();
  } catch (error) {
    // Se la verifica del token fallisce, passa l'errore al gestore globale
    if (error instanceof ApiError) {
      next(error);
    } else {
      // Per errori di JWT (token scaduto, non valido, etc.)
      next(new ApiError(401, "Invalid or expired token"));
    }
  }
};

/**
 * Deve essere usato dopo authMiddleware.
 */
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.operator) {
      throw new ApiError(401, "Authentication required");
    }

    if (!roles.includes(req.operator.role)) {
      throw new ApiError(403, `Access denied. Required roles: ${roles.join(", ")}`);
    }

    next();
  };
};