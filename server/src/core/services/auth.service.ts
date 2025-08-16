// src/core/services/auth.service.ts
import { comparePassword } from "../../utils/bcrypt.utils";
import { signJwt } from "../../utils/jwt.utils";
import { ApiError } from "../../api/middlewares/errorHandler.middleware";
import { LoginInput } from "../../api/validators/auth.validator"; // Importiamo il tipo inferito da Zod
import * as operatorRepository from "../repositories/operator.repository";

/**
 * Gestisce la logica di business per il login di un operatore.
 * @param input Dati di login (email, password) già validati.
 * @returns Una promise che si risolve con il token JWT.
 * @throws {ApiError} Se le credenziali non sono valide o l'utente non è trovato.
 */
export const login = async (input: LoginInput): Promise<string> => {
  // Trova l'operatore tramite email
  const operator = await operatorRepository.findOperatorByEmail(input.email);

  // Se l'operatore non esiste o la password non corrisponde, lancia un errore di autenticazione
  if (!operator) {
    // Usiamo un messaggio generico per non rivelare se l'email esiste o meno
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordValid = await comparePassword(
    input.password,
    operator.password_hash
  );

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  //Se le credenziali sono valide, crea il payload del JWT
  const jwtPayload = {
    operator_id: operator.operator_id,
    role: operator.role,
  };

  // Firma e restituisci il token JWT
  const token = signJwt(jwtPayload);

  return token;
};
