// src/utils/jwt.utils.ts
import jwt from "jsonwebtoken";

// Assicuriamoci che il segreto JWT sia definito, altrimenti l'app non deve partire
if (!process.env.JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined.");
  process.exit(1);
}

const jwtSecret = process.env.JWT_SECRET;
const expiresIn = process.env.JWT_EXPIRES_IN || "1h";

// Definiamo un'interfaccia per il payload del nostro token per avere type safety
export interface JwtPayload {
  operator_id: string;
  role: string;
}

/**
 * Firma un payload per creare un token JWT.
 * @param payload L'oggetto da includere nel token (deve corrispondere a JwtPayload).
 * @returns Il token JWT come stringa.
 */
export const signJwt = (payload: JwtPayload): string => {
  return jwt.sign(payload, jwtSecret, { expiresIn });
};

/**
 * Verifica un token JWT e ne restituisce il payload decodificato.
 * Lancia un errore se il token non è valido o è scaduto.
 * @param token Il token JWT da verificare.
 * @returns Il payload decodificato (corrisponde a JwtPayload).
 */
export const verifyJwt = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, jwtSecret);
    // Facciamo un type guard per assicurarci che il payload abbia la forma che ci aspettiamo
    if (
      typeof decoded === "object" &&
      decoded !== null &&
      "operator_id" in decoded &&
      "role" in decoded
    ) {
      return decoded as JwtPayload;
    }
    throw new Error("Invalid token payload");
  } catch (error) {
    // Rilanciamo l'errore per essere gestito a un livello superiore (nel middleware di autenticazione)
    throw error;
  }
};
