// src/api/routes/notes.routes.ts
import { Router } from "express";
import { validate } from "../middlewares/validator.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
import { addNoteRequestSchema, updateNoteRequestSchema } from "@bilinguismo/shared";
import { uuidParamSchema } from "@bilinguismo/shared";
import * as notesController from "../controllers/notes.controller";

const router = Router();

// ====================================================================
// ROTTE NOTES - Tutte protette da autenticazione
// ====================================================================

// Schema per validare i parametri delle nested routes
const noteRouteParamsSchema = uuidParamSchema.extend({
  submissionId: uuidParamSchema.shape.id,
  noteId: uuidParamSchema.shape.id,
});

// GET /submissions/:id/notes - Lista note per submission
router.get(
  "/:id/notes",
  authMiddleware,
  validate(uuidParamSchema, "params"),
  notesController.getNotesBySubmissionId
);

// POST /submissions/:id/notes - Crea nuova nota
router.post(
  "/:id/notes",
  authMiddleware,
  validate(uuidParamSchema, "params"),
  validate(addNoteRequestSchema, "body"),
  notesController.createNote
);

// PUT /submissions/:submissionId/notes/:noteId - Aggiorna nota (solo proprietario o admin)
router.put(
  "/:submissionId/notes/:noteId",
  authMiddleware,
  validate(updateNoteRequestSchema, "body"),
  notesController.updateNote
);

// DELETE /submissions/:submissionId/notes/:noteId - Elimina nota (solo proprietario o admin)
router.delete(
  "/:submissionId/notes/:noteId",
  authMiddleware,
  notesController.deleteNote
);

export default router;