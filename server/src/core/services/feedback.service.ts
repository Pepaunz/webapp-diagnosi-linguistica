// src/core/services/feedback.service.ts
import * as feedbackRepo from "../repositories/feedback.repository";
import * as submissionRepo from "../repositories/submission.repository";
import { ApiError } from "../../api/middlewares/errorHandler.middleware";
import { 
  SubmitFeedbackInput, 
  ListFeedbackQuery, 
  UpdateFeedbackInput 
} from "@bilinguismo/shared";
import { FeedbackReport as PrismaFeedbackReport } from "@prisma/client";
import { FeedbackDTO, FeedbackStatus} from "@bilinguismo/shared";

// POST /feedback - Invia feedback (pubblico)
export const submitFeedback = async (
  data: SubmitFeedbackInput
): Promise<{
  feedback_id: string;
  message: string;
  submitted_at: Date;
}> => {
  // 1. Se submission_id è fornito, verifica che esista
  if (data.submission_id) {
    const submission = await submissionRepo.findSubmissionById(data.submission_id);
    if (!submission) {
      throw new ApiError(404, "Submission not found");
    }
  }

  // 2. Crea il feedback
  const feedback = await feedbackRepo.createFeedback(data);

  return {
    feedback_id: feedback.feedback_id,
    message: "Feedback submitted successfully. Thank you for helping us improve!",
    submitted_at: feedback.submitted_at,
  };
};

// GET /feedback - Lista feedback per operatori
export const getFeedback = async (
  query: ListFeedbackQuery
): Promise<{
  feedback: FeedbackDTO[];
  total: number;
  pagination: {
    limit: number;
    offset: number;
    has_more: boolean;
  };
}> => {
  const { feedback: rawFeedbacks, total } = await feedbackRepo.findAllFeedbackWithFilters(query);

  const hasMore = query.offset + query.limit < total;

  const feedbacksDTO: FeedbackDTO[] = rawFeedbacks.map((feedback, index) => ({
    id: (query.offset || 0) + index + 1,
    uuid: feedback.feedback_id,
    submission_id: feedback.submission_id || undefined,
    question_identifier: feedback.question_identifier || undefined,
    feedback_text: feedback.feedback_text,
    template_name: feedback.submission?.template?.name || "Unknown",
    reporter_metadata: feedback.reporter_metadata as Record<string,any> || undefined,
    submitted_at: feedback.submitted_at.toISOString(),
    status: feedback.status as FeedbackStatus,
  }));

  return {
    feedback: feedbacksDTO,
    total,
    pagination: {
      limit: query.limit,
      offset: query.offset,
      has_more: hasMore,
    },
  };
};

// PUT /feedback/{id} - Aggiorna status feedback
export const updateFeedbackStatus = async (
  feedback_id: string,
  data: UpdateFeedbackInput
): Promise<PrismaFeedbackReport> => {
  // 1. Verifica che il feedback esista
  const existingFeedback = await feedbackRepo.findFeedbackById(feedback_id);
  if (!existingFeedback) {
    throw new ApiError(404, "Feedback not found");
  }

  const currentStatus = existingFeedback.status;
  const newStatus = data.status;
  
  // Permette di mantenere lo stesso status (no-op)
  if (currentStatus === newStatus) {
    return existingFeedback;
  }

  // 2. Validazione workflow stati con typing corretto
  const validTransitions: Record<string, string[]> = {
    "New": ["Acknowledged", "Investigating", "WontFix"],
    "Acknowledged": ["Investigating", "Resolved", "WontFix"],
    "Investigating": ["Resolved", "WontFix"],
    "Resolved": [], // Stato finale
    "WontFix": [], // Stato finale
  };

  // Controlla se il currentStatus ha transizioni valide definite
  if (validTransitions.hasOwnProperty(currentStatus)) {
    const allowedTransitions = validTransitions[currentStatus];
    
    // Se l'array è vuoto, significa che è uno stato finale
    if (allowedTransitions.length === 0) {
      throw new ApiError(
        400,
        `Cannot change status from '${currentStatus}' as it is a final state`
      );
    }
    
    // Controlla se la transizione è permessa
    if (!allowedTransitions.includes(newStatus)) {
      throw new ApiError(
        400,
        `Invalid status transition from '${currentStatus}' to '${newStatus}'. Allowed: ${allowedTransitions.join(", ")}`
      );
    }
  }

  // 3. Aggiorna lo status
  return await feedbackRepo.updateFeedbackStatus(feedback_id, newStatus);
};