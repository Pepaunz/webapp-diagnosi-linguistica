import { z } from "zod/v4";
import { paginationQuerySchema } from "./common.schemas";

// Reporter metadata schema
const reporterMetadataSchema = z
  .object({
    email: z.email().optional(),
    user_agent: z.string().optional(),
  })
  .optional();

// Submit feedback request
export const submitFeedbackBodySchema = z.object({
  submission_id: z.uuid("Submission ID must be a valid UUID").optional(),

  question_identifier: z
    .string()
    .max(100, "Question identifier cannot exceed 100 characters")
    .optional(),

  feedback_text: z
    .string({
      error: "Feedback text is required",
    })
    .min(10, "Feedback must be at least 10 characters long")
    .max(2000, "Feedback cannot exceed 2000 characters"),

  reporter_metadata: reporterMetadataSchema,
});

// Feedback status enum
const feedbackStatusSchema = z.enum(
  ["New", "Acknowledged", "Investigating", "Resolved", "WontFix"],
  {
    error: (issue) => {
      if (issue.received === undefined) {
        return { message: "Status is required" };
      }
      return {
        message:
          "Invalid status. Must be one of: New, Acknowledged, Investigating, Resolved, WontFix",
      };
    },
  }
);

// List feedback query
export const listFeedbackQuerySchema = z.object({
  status: feedbackStatusSchema.optional(),
  ...paginationQuerySchema.shape,
});

// Feedback params
export const feedbackParamsSchema = z.object({
  feedback_id: z.uuid("Feedback ID must be a valid UUID"),
});

// Update feedback request
export const updateFeedbackBodySchema = z.object({
  status: feedbackStatusSchema,
});

// Full feedback report schema
export const feedbackReportSchema = z.object({
  feedback_id: z.uuid(),
  submission_id: z.uuid().nullable(),
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
export type FeedbackReport = z.infer<typeof feedbackReportSchema>;
