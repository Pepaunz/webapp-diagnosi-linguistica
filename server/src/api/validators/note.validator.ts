import { z } from "zod/v4";

// ====================================================================
// SCHEMI NOTE OPERATORI
// ====================================================================

// Add note request
export const addNoteRequestSchema = z.object({
  note_text: z
    .string({
      error: "Note text is required",
    })
    .min(1, "Note text cannot be empty")
    .max(2000, "Note text cannot exceed 2000 characters"),

  question_identifier: z
    .string()
    .max(100, "Question identifier too long")
    .nullable()
    .optional(),
});

// Update note request
export const updateNoteRequestSchema = z.object({
  note_text: z
    .string({
      error: "Note text is required",
    })
    .min(1, "Note text cannot be empty")
    .max(2000, "Note text cannot exceed 2000 characters"),
});

// Full operator note schema
export const operatorNoteSchema = z.object({
  note_id: z.uuid(),
  submission_id: z.uuid(),
  question_identifier: z.string().nullable(),
  operator_id: z.uuid(),
  operator_full_name: z.string(),
  note_text: z.string(),
  created_at: z.date(),
  updated_at: z.date(),
});

// Note params
export const noteParamsSchema = z.object({
  submission_id: z.uuid(),
  note_id: z.uuid(),
});

export type AddNoteRequest = z.infer<typeof addNoteRequestSchema>;
export type UpdateNoteRequest = z.infer<typeof updateNoteRequestSchema>;
export type OperatorNote = z.infer<typeof operatorNoteSchema>;
export type NoteParams = z.infer<typeof noteParamsSchema>;
