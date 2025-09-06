import { z } from 'zod';
import { localizedTextSchema } from './common.schemas';

export const optionSchema = z.object({
  value: z.string(),
  text: localizedTextSchema,
});

export const questionTypeSchema = z.enum(["text", "multiple-choice", "rating", "date"]);

export const questionSchema = z.object({
  questionId: z.string(),
  text: localizedTextSchema,
  type: questionTypeSchema,
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
  sections: z.array(sectionSchema).min(1, "Il questionario deve avere almeno una sezione"),
});

// Tipi inferiti
export type QuestionnaireData = z.infer<typeof structureDefinitionSchema>;
export type QuestionType = z.infer<typeof questionTypeSchema>;
export type Section = z.infer<typeof sectionSchema>;
export type Question = z.infer<typeof questionSchema>;
export type Option = z.infer<typeof optionSchema>;