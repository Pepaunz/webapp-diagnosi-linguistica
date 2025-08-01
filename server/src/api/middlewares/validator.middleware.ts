import { Request, Response, NextFunction } from "express";
import { ZodError, z } from "zod"; // Importiamo 'z' per accedere ai suoi tipi
import { ApiError } from "./errorHandler.middleware";

/**
 * Middleware di validazione generico per Zod.
 * @param schema Lo schema Zod da usare per la validazione.
 * @param source La parte della richiesta da validare ('body', 'query', o 'params').
 * @returns Un middleware Express.
 */
// Usiamo z.Schema che è il tipo base per tutti gli schemi Zod (oggetti, stringhe, numeri, ecc.)
export const validate =
  (schema: z.Schema, source: "body" | "query" | "params") =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      // Esegue la validazione sulla parte specificata della richiesta.
      // Esempio: se source è 'body', valida req.body.
      // La sovrascrittura con il risultato di .parse() è una buona pratica
      // per ottenere dati "puliti" con eventuali trasformazioni o valori di default.
      req[source] = schema.parse(req[source]);

      // Se la validazione ha successo, passa al prossimo middleware.
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Se è un errore di Zod, formatta i dettagli.
        const validationErrors = error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));

        // Crea e passa l'errore al gestore globale.
        const apiError = new ApiError(
          400,
          `Invalid input in request ${source}`,
          true,
          validationErrors
        );
        next(apiError);
      } else {
        // Se è un altro tipo di errore, passalo avanti.
        next(error);
      }
    }
  };
