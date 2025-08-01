// src/utils/bcrypt.utils.ts
import bcrypt from "bcrypt";

const saltRounds = 10; // Un buon valore di default per il "costo" dell'hashing

/**
 * Genera un hash sicuro per una password in chiaro.
 * @param password La password da hashare.
 * @returns Una promise che si risolve con la stringa dell'hash.
 */
export const hashPassword = (password: string): Promise<string> => {
  return bcrypt.hash(password, saltRounds);
};

/**
 * Confronta una password in chiaro con un hash esistente.
 * @param password La password in chiaro fornita dall'utente.
 * @param hash L'hash salvato nel database.
 * @returns Una promise che si risolve con `true` se le password corrispondono, altrimenti `false`.
 */
export const comparePassword = (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
