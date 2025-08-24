import { Request, Response, NextFunction } from "express";
import * as submissionService from "../../core/services/submission.service";
import { UuidParam } from "../validators";
import { SaveProgressRequest , CompleteSubmissionBody,StartOrResumeRequest } from "../validators/submission.validator";

export const startOrResume = async (
  req: Request<{}, {}, StartOrResumeRequest>,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await submissionService.startOrResume(req.body);

    // Se la submission è nuova, rispondiamo con 201 Created.
    // Altrimenti, 200 OK per una ripresa.
    const statusCode = result.isNew ? 201 : 200;

    // Rimuoviamo il campo 'isNew' prima di inviare la risposta al client
    const { isNew, ...responseData } = result;

    res.status(statusCode).json(responseData);
  } catch (error) {
    next(error);
  }
};

export const saveProgress = async (
  req: Request<UuidParam, {}, SaveProgressRequest>,
  res: Response,
  next: NextFunction
) => {
  try {
    const submissionId = req.params.id;
    const result = await submissionService.saveProgress(submissionId, req.body);

    res.status(200).json({
      message: "Progress saved successfully.",
      last_updated_at: result.last_updated_at.toISOString(),
    });
  } catch (error) {
    next(error);
  }
};


export const complete = async (
  // USA IL TIPO CORRETTO QUI
  req: Request<UuidParam, {}, CompleteSubmissionBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const submissionId = req.params.id;
    const completedSubmission = await submissionService.complete(submissionId, req.body);

    res.status(200).json({
      message: 'Submission completed successfully.',
      submission: completedSubmission,
    });
  } catch (error) {
    next(error);
  }
};