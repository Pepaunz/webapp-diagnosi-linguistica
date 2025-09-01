import { z } from "zod";
import { paginationQuerySchema } from "./common.schemas";

// Reporter metadata schema
const reporterMetadataSchema = z
  .object({
    email: z.string().email().optional(),
    user_agent: z.string().optional(),
  })
  .optional();

// Submit feedback request
export const submitFeedbackBodySchema = z.object({
  submission_id: z.string().uuid("Submission ID must be a valid UUID").optional(),

  question_identifier: z
    .string()
    .max(100, "Question identifier cannot exceed 100 characters")
    .optional(),

  feedback_text: z
    .string()
    .min(10, "Feedback must be at least 10 characters long")
    .max(2000, "Feedback cannot exceed 2000 characters"),

  reporter_metadata: reporterMetadataSchema,
});

// Feedback status enum
const feedbackStatusSchema = z.enum(
  ["New", "Investigating", "Resolved"],
  
);

// List feedback query
export const listFeedbackQuerySchema = z.object({
  status: feedbackStatusSchema.optional(),
  ...paginationQuerySchema.shape,
});

// Feedback params
export const feedbackParamsSchema = z.object({
  feedback_id: z.string().uuid("Feedback ID must be a valid UUID"),
});

// Update feedback request
export const updateFeedbackBodySchema = z.object({
  status: feedbackStatusSchema,
});

// Full feedback report schema
export const feedbackReportSchema = z.object({
  feedback_id: z.string().uuid(),
  submission_id: z.string().uuid().nullable(),
  question_identifier: z.string().nullable(),
  feedback_text: z.string(),
  reporter_metadata: z.record(z.string(), z.unknown()).nullable(),
  submitted_at: z.date(),
  status: feedbackStatusSchema,
});

export type SubmitFeedbackInput = z.infer<typeof submitFeedbackBodySchema>;
export type ListFeedbackQuery = z.infer<typeof listFeedbackQuerySchema>;
export type FeedbackParams = z.infer<typeof feedbackParamsSchema>;
export type UpdateFeedbackInput = z.infer<typeof updateFeedbackBodySchema>;
export type Feedback = z.infer<typeof feedbackReportSchema>;
