// src/api/routes/template.routes.ts
import { Router } from "express";
import { validate } from "../middlewares/validator.middleware";
import { authMiddleware, requireRole } from "../middlewares/auth.middleware";
import { 
  createTemplateBodySchema,
  updateTemplateBodySchema,
  listTemplatesQuerySchema,
  templateParamsSchema
} from "../validators/template.validator";
import { uuidParamSchema } from "../validators";
import * as templateController from "../controllers/template.controller";

const router = Router();

// ====================================================================
// ROTTE TEMPLATE - Tutte protette da autenticazione
// ====================================================================

// GET /templates - Lista template (operator + admin)
router.get(
  "/",
  authMiddleware,
  validate(listTemplatesQuerySchema, "query"),
  templateController.getTemplates
);

// GET /templates/:id - Dettagli template (operator + admin)
router.get(
  "/:id",
  authMiddleware,
  validate(uuidParamSchema, "params"),
  templateController.getTemplateById
);

// POST /templates - Crea template (solo admin)
router.post(
  "/",
  authMiddleware,
  requireRole(["admin"]),
  validate(createTemplateBodySchema, "body"),
  templateController.createTemplate
);

// PUT /templates/:id - Aggiornamento completo (solo admin)
router.put(
  "/:id",
  authMiddleware,
  requireRole(["admin"]),
  validate(uuidParamSchema, "params"),
  validate(createTemplateBodySchema, "body"),
  templateController.updateTemplateComplete
);

// PATCH /templates/:id - Aggiornamento parziale/soft delete (operator + admin)
router.patch(
  "/:id",
  authMiddleware,
  validate(uuidParamSchema, "params"),
  validate(updateTemplateBodySchema, "body"),
  templateController.updateTemplatePartial
);

// DELETE /templates/:id - Hard delete (solo admin)
router.delete(
  "/:id",
  authMiddleware,
  requireRole(["admin"]),
  validate(uuidParamSchema, "params"),
  templateController.deleteTemplate
);

export default router;