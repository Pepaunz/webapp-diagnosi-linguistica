// src/api/controllers/auth.controller.ts
import { Request, Response, NextFunction } from "express";
import { LoginInput } from "../validators/auth.validator";
import * as authService from "../../core/services/auth.service";

/**
 * Gestisce la richiesta di login.
 */
export const login = async (
  req: Request<{}, {}, LoginInput>, // Specifica il tipo per il body della richiesta
  res: Response,
  next: NextFunction
) => {
  try {
    // I dati in req.body sono già stati validati dal middleware Zod.
    const token = await authService.login(req.body);

    // Invia la risposta con il token
    res.status(200).json({
      access_token: token,
    });
  } catch (error) {
    // Se il servizio lancia un errore (es. ApiError per credenziali non valide),
    // lo passiamo al gestore di errori globale.
    next(error);
  }
};
