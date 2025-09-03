import { z } from "zod";

// ====================================================================
// SCHEMI COMUNI RIUTILIZZABILI
// ====================================================================

// UUID parameter schema
export const uuidParamSchema = z.object({
  id: z.string().uuid("Invalid UUID format"),
});

// Fiscal code validation (migliorato per Zod v4)
export const fiscalCodeSchema = z
  .string()
  .regex(
    /^[A-Z]{6}[0-9LMNPQRSTUV]{2}[A-Z]{1}[0-9LMNPQRSTUV]{2}[A-Z]{1}[0-9LMNPQRSTUV]{3}[A-Z]{1}$/,
    "Codice fiscale non valido"
  )
  .length(16, "Fiscal code must be exactly 16 characters");

// Pagination schema migliorato
export const paginationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  sort_by: z.string().optional(),
  sort_order: z.enum(["asc", "desc"]).default("desc"),
});

// Date filtering schema
export const dateFilterSchema = z
  .object({
    date_from: z.coerce
      .date()
      .optional(),
    date_to: z.coerce
      .date()
      .optional(),
  })
  .refine(
    (data) =>
      !data.date_from || !data.date_to || data.date_from <= data.date_to,
    {
      message: "date_from must be before or equal to date_to",
      path: ["date_from"],
    }
  );

// Language code validation
export const languageCodeSchema = z
  .string()
  .regex(
    /^[a-z]{2}(-[A-Z]{2})?$/,
    "Invalid language code format (expected: 'it', 'en', 'es-ES', etc.)"
  );

  export const localizedTextSchema = z.object({
    it: z.string().optional(),
    en: z.string().optional(),
    es: z.string().optional(),
    ar: z.string().optional(),
  })
  
// Tipi comuni
export type UuidParam = z.infer<typeof uuidParamSchema>;
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
export type DateFilter = z.infer<typeof dateFilterSchema>;
export type Language = "it" | "en" | "es" | "ar";
export type LocalizedText = z.infer<typeof localizedTextSchema>;
