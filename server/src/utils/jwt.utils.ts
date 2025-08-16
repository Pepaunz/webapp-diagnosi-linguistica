// src/utils/jwt.utils.ts
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

// Carica le variabili d'ambiente
dotenv.config();

// Interfaccia per il payload JWT
export interface JwtPayload {
  operator_id: string;
  role: string;
}

// Funzione per ottenere il JWT secret in modo sicuro
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.error(
      "FATAL ERROR: JWT_SECRET environment variable is not defined."
    );
    process.exit(1);
  }

  return secret;
}

// Funzione per ottenere l'expiration time
function getJwtExpiresIn(): string {
  return process.env.JWT_EXPIRES_IN || "1d";
}

/**
 * Crea e firma un nuovo JSON Web Token.
 * @param payload - Dati da includere nel token
 * @returns Token JWT firmato
 */
export function signJwt(payload: JwtPayload): string {
  try {
    const secret = getJwtSecret();
    const expiresIn = getJwtExpiresIn();

    // Crea una copia pulita del payload
    const tokenPayload = {
      operator_id: payload.operator_id,
      role: payload.role,
    };

    // Cast delle opzioni per bypassare il problema TypeScript
    const options = {
      expiresIn: expiresIn,
    } as jwt.SignOptions;

    // Firma il token con cast esplicito
    return jwt.sign(tokenPayload, secret, options);
  } catch (error) {
    console.error("Error signing JWT:", error);
    throw new Error("Failed to sign JWT token");
  }
}

/**
 * Verifica un token JWT e restituisce il suo payload.
 * @param token - Token JWT da verificare
 * @returns Payload decodificato
 */
export function verifyJwt(token: string): JwtPayload {
  try {
    const secret = getJwtSecret();

    // Verifica il token
    const decoded = jwt.verify(token, secret);

    // Type guard per verificare la struttura
    if (
      typeof decoded === "object" &&
      decoded !== null &&
      !Buffer.isBuffer(decoded) &&
      typeof (decoded as any).operator_id === "string" &&
      typeof (decoded as any).role === "string"
    ) {
      return {
        operator_id: (decoded as any).operator_id,
        role: (decoded as any).role,
      };
    }

    throw new Error("Invalid token payload structure");
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error(`Invalid token: ${error.message}`);
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Token has expired");
    }
    if (error instanceof jwt.NotBeforeError) {
      throw new Error("Token is not active yet");
    }

    // Re-throw altri errori
    throw error;
  }
}
