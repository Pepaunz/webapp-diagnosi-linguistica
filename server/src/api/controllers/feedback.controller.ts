// src/api/controllers/feedback.controller.ts
import { Request, Response, NextFunction } from "express";
import { 
  SubmitFeedbackInput,
  UpdateFeedbackInput, 
  ListFeedbackQuery,
  FeedbackParams
} from "../validators/feedback.validator";
import { UuidParam } from "../validators";
import * as feedbackService from "../../core/services/feedback.service";

// POST /feedback - Invia feedback (PUBBLICO - nessuna autenticazione)
export const submitFeedback = async (
  req: Request<{}, {}, SubmitFeedbackInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await feedbackService.submitFeedback(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

// GET /feedback - Lista feedback (PROTETTO - solo operatori)
export const getFeedback = async (
  req: Request<{},{},{},any>,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = req.query as ListFeedbackQuery;
    const result = await feedbackService.getFeedback(query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// PUT /feedback/:id - Aggiorna status feedback (PROTETTO - solo operatori)
export const updateFeedbackStatus = async (
  req: Request<UuidParam, {}, UpdateFeedbackInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await feedbackService.updateFeedbackStatus(req.params.id, req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};