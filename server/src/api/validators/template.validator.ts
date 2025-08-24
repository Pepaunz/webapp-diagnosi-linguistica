import { z } from "zod/v4";
import { languageCodeSchema, paginationQuerySchema } from "./common.schemas";
import { structureDefinitionSchema } from "./questionnaire.schemas";

// ====================================================================
// SCHEMI TEMPLATE QUESTIONARIO
// ====================================================================

// Base template schema (per POST/PUT)
export const createTemplateBodySchema = z.object({
  name: z
    .string({
      error: "Name is required",
    })
    .min(1, "Name cannot be empty")
    .max(255, "Name must not exceed 255 characters"),

  description: z
    .string()
    .max(1000, "Description must not exceed 1000 characters")
    .nullable()
    .optional(),

  structure_definition: structureDefinitionSchema, 
  is_active: z.boolean().default(true),

  available_languages: z
    .array(languageCodeSchema)
    .min(1, "At least one language must be specified"),
});

// Full template schema (per responses)
export const TemplateSchema =
  createTemplateBodySchema.extend({
    template_id: z.uuid(),
    created_at: z.date(),
    updated_at: z.date(),
  });

// Query schema per GET /templates
export const listTemplatesQuerySchema = z.object({
  active_only: z.coerce.boolean().default(true),
  ...paginationQuerySchema.shape,
});

// Params per template operations
export const templateParamsSchema = z.object({
  template_id: z.uuid("Template ID must be a valid UUID"),
});

// Delete template query
export const deleteTemplateQuerySchema = z.object({
  permanent_delete: z.coerce.boolean().default(false),
});

export type CreateTemplateInput = z.infer<
  typeof createTemplateBodySchema
>;
export type Template = z.infer<typeof TemplateSchema>;
export type ListTemplatesQuery = z.infer<typeof listTemplatesQuerySchema>;
export type TemplateParams = z.infer<typeof templateParamsSchema>;
