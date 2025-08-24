import { z } from 'zod';
import { localizedTextSchema } from './common.schemas';

export const optionSchema = z.object({
  value: z.string(),
  text: localizedTextSchema,
});

export const questionSchema = z.object({
  questionId: z.string(),
  text: localizedTextSchema,
  type: z.enum(["text", "multiple-choice", "rating", "date"]),
  helpText: localizedTextSchema.optional(),
  required: z.boolean().optional(),
  options: z.array(optionSchema).optional(),
  minValue: z.number().optional(),
  maxValue: z.number().optional(),
});

export const sectionSchema = z.object({
  sectionId: z.string(),
  title: localizedTextSchema,
  description: localizedTextSchema.optional(),
  questions: z.array(questionSchema),
});

// Schema completo per il campo `structure_definition`
export const structureDefinitionSchema = z.object({
  questionnaireTitle: localizedTextSchema,
  description: localizedTextSchema,
  version: z.string(),
  defaultLanguage: z.string(),
  sections: z.array(sectionSchema).min(1, "Questionnaire must have at least one section"),
});

// Tipi inferiti
export type QuestionnaireData = z.infer<typeof structureDefinitionSchema>;
export type Section = z.infer<typeof sectionSchema>;
export type Question = z.infer<typeof questionSchema>;