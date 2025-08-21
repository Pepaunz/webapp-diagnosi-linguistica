import { z } from "zod/v4";
import {
  fiscalCodeSchema,
  paginationQuerySchema,
  dateFilterSchema,
} from "./common.schemas";

// ====================================================================
// SCHEMI SUBMISSION QUESTIONARIO
// ====================================================================

// Start or resume request
export const startOrResumeRequestSchema = z.object({
  fiscal_code: fiscalCodeSchema,
  questionnaire_template_id: z
    .uuid("Invalid template ID format")
    .nonempty("template ID is required"),
  language_used: z
    .string()
    .nonempty("Language is required")
    .max(10, "Language code too long"),
});

// Answer input schema
export const answerInputSchema = z.object({
  question_identifier: z
    .string({
      error: "Question identifier is required",
    })
    .nonempty()
    .min(1, "Question identifier cannot be empty")
    .max(100, "Question identifier too long"),

  answer_value: z.any(),
});

// Save progress request
export const saveProgressRequestSchema = z.object({
  current_step_identifier: z
    .string({
      error: "Current step identifier is required",
    })
    .max(100, "Step identifier too long"),

  answers: z
    .array(answerInputSchema)
    .min(1, "At least one answer must be provided"),
});

// Answer schema (full object)
export const answerSchema = z.object({
  answer_id: z.number().int(),
  submission_id: z.uuid(),
  question_identifier: z.string(),
  answer_value: z.record(z.string(), z.unknown()),
  saved_at: z.date(),
});

// Submission status enum
export const submissionStatusSchema = z.enum([
  "InProgress",
  "Completed",
  "Abandoned",
]);

// Full submission schema
export const SubmissionSchema = z.object({
  submission_id: z.uuid(),
  fiscal_code: fiscalCodeSchema,
  template_id: z.uuid(),
  status: submissionStatusSchema,
  current_step_identifier: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  created_at: z.date(),
  last_updated_at: z.date(),
  completed_at: z.string().nullable(),
});

// Start/Resume response
export const startOrResumeResponseSchema = z.object({
  submission_id: z.uuid(),
  status: z.literal("InProgress"),
  current_step_identifier: z.string().nullable(),
  answers: z.array(answerSchema),
  questionnaire_template: z.record(z.string(), z.unknown()), // Simplified for now
});

// List submissions query
export const listSubmissionsQuerySchema = z.object({
  status: submissionStatusSchema.optional(),
  fiscal_code: fiscalCodeSchema.optional(),
  template_id: z.uuid().optional(),
  ...dateFilterSchema.shape,
  ...paginationQuerySchema.shape,
});

// Submission params
export const submissionParamsSchema = z.object({
  submission_id: z.uuid("Submission ID must be a valid UUID"),
});

// Modify answer request (per operatori)
export const modifyAnswerRequestSchema = z.object({
  new_answer_value: z.record(z.string(), z.unknown(), {
    error: "New answer value must be a valid JSON object",
  }),
});

// Answer params
export const answerParamsSchema = z.object({
  submission_id: z.uuid(),
  question_identifier: z.string().min(1, "Question identifier is required"),
});

export const completeSubmissionBodySchema = z.object({
  // Lo step identifier è ancora utile per sapere qual è l'ultima pagina vista
  current_step_identifier: z
    .string()
    .nonempty("Current step identifier is required"),

  answers: z.array(answerInputSchema).optional(), // <-- .optional() è la chiave qui
});

export type StartOrResumeRequest = z.infer<typeof startOrResumeRequestSchema>;
export type SaveProgressRequest = z.infer<typeof saveProgressRequestSchema>;
export type AnswerInput = z.infer<typeof answerInputSchema>;
export type Answer = z.infer<typeof answerSchema>;
export type Submission = z.infer<
  typeof SubmissionSchema
>;
export type StartOrResumeResponse = z.infer<typeof startOrResumeResponseSchema>;
export type ListSubmissionsQuery = z.infer<typeof listSubmissionsQuerySchema>;
export type ModifyAnswerRequest = z.infer<typeof modifyAnswerRequestSchema>;
export type CompleteSubmissionBody = z.infer<typeof completeSubmissionBodySchema>;

