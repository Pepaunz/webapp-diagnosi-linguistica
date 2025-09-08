import { Router } from "express";
import { validate } from "../middlewares/validator.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
import { completeSubmissionBodySchema, startOrResumeRequestSchema,saveProgressRequestSchema, listSubmissionsQuerySchema } from "@bilinguismo/shared";
import { uuidParamSchema } from "@bilinguismo/shared";
import { } from "@bilinguismo/shared";
import * as submissionController from "../controllers/submission.controller";
import noteRoutes from "./notes.routes";
const router = Router();
//;=====================================================================
// ROTTE PUBBLICHE
//=====================================================================
router.post(
  "/start_or_resume",
  validate(startOrResumeRequestSchema, "body"),
  submissionController.startOrResume
);

router.put(
  "/:id/save_progress",
  validate(uuidParamSchema, "params"),
  validate(saveProgressRequestSchema, "body"),
  submissionController.saveProgress
);

 router.post(
    '/:id/complete',
    validate(uuidParamSchema, 'params'),
    validate(completeSubmissionBodySchema,'body'),
    submissionController.complete
  );

//=====================================================================
//ROTTE PROTETTE (OPERATORI)
//=====================================================================

// GET /submissions - Lista submission per operatori
router.get(
  "/",
  authMiddleware,
  validate(listSubmissionsQuerySchema, "query"),
  submissionController.getSubmissions
);

// GET /submissions/:id - Dettagli completi di una submission
router.get(
  "/:id",
  authMiddleware,
  validate(uuidParamSchema, "params"),
  submissionController.getSubmissionById
);

// DELETE /submissions/:id - Eliminazione di una submission
router.delete(
  "/:id",
  authMiddleware,
  validate(uuidParamSchema, "params"),
  submissionController.deleteSubmission
);



// ROTTE NOTES 
router.use("/", noteRoutes);

export default router;
