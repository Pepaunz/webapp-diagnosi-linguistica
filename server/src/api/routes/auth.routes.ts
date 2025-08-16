// src/api/routes/auth.routes.ts
import { Router } from "express";
import { validate } from "../middlewares/validator.middleware";
import { loginBodySchema } from "../validators/auth.validator";
import * as authController from "../controllers/auth.controller";

const router = Router();

// Definiamo la rotta POST per /login
// 1. Applichiamo il middleware di validazione per il body
// 2. Chiamiamo la funzione del controller corrispondente
router.post("/login", validate(loginBodySchema, "body"), authController.login);

export default router;
