import { Router } from "express";
import { validate } from "../middlewares/validator.middleware";
import { completeSubmissionBodySchema, startOrResumeRequestSchema } from "../validators/submission.validator";
import { uuidParamSchema } from "../validators";
import { saveProgressRequestSchema } from "../validators/submission.validator";
import * as submissionController from "../controllers/submission.controller";

const router = Router();

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

// Le altre rotte per submission verranno aggiunte qui...

export default router;
