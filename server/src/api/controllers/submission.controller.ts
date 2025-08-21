import { Request, Response, NextFunction } from "express";
import * as submissionService from "../../core/services/submission.service";
import { StartOrResumeRequest } from "../validators/submission.validator";
import { UuidParam } from "../validators";
import { SaveProgressRequest } from "../validators/submission.validator";

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

// src/api/controllers/submission.controller.ts

export const saveProgress = async (
  req: Request<UuidParam, {}, SaveProgressRequest>,
  res: Response,
  next: NextFunction
) => {
  try {
    // Estraiamo l'ID dall'oggetto req.params
    const submissionId = req.params.id;

    // E lo passiamo come stringa al servizio
    const result = await submissionService.saveProgress(submissionId, req.body);

    res.status(200).json({
      message: "Progress saved successfully.",
      last_updated_at: result.last_updated_at.toISOString(),
    });
  } catch (error) {
    next(error);
  }
};
