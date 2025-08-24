import { z } from "zod";

// ====================================================================
// SCHEMI ERRORE
// ====================================================================

// Error detail for validation errors
export const errorDetailSchema = z.object({
  field: z.string(),
  message: z.string(),
});

// Standard error response
export const errorResponseSchema = z.object({
  status_code: z.number().int(),
  error: z.string(),
  message: z.string(),
  timestamp: z.string().datetime(),
  details: z.array(errorDetailSchema).optional(),
});

export type ErrorDetail = z.infer<typeof errorDetailSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
