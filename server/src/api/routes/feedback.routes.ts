// src/api/routes/feedback.routes.ts
import { Router } from "express";
import { validate } from "../middlewares/validator.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
import { 
  submitFeedbackBodySchema,
  listFeedbackQuerySchema,
  updateFeedbackBodySchema
} from "@bilinguismo/shared";
import { uuidParamSchema } from "@bilinguismo/shared";
import * as feedbackController from "../controllers/feedback.controller";

const router = Router();

// ====================================================================
// FEEDBACK ROUTES
// ====================================================================

// POST /feedback - Invia feedback (PUBBLICO - nessuna autenticazione)
router.post(
  "/",
  validate(submitFeedbackBodySchema, "body"),
  feedbackController.submitFeedback
);

// GET /feedback - Lista feedback (PROTETTO - solo operatori)
router.get(
  "/",
  authMiddleware,
  validate(listFeedbackQuerySchema, "query"),
  feedbackController.getFeedback
);

// PUT /feedback/:id - Aggiorna status feedback (PROTETTO - solo operatori)
router.put(
  "/:id",
  authMiddleware,
  validate(uuidParamSchema, "params"),
  validate(updateFeedbackBodySchema, "body"),
  feedbackController.updateFeedbackStatus
);

export default router;