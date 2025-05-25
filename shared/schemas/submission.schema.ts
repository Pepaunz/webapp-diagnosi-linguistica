/**
 * JSON Schema for submission validation
 */
import { questionnaireSchema } from './questionnaire.schema';

export const answerSchema = {
  type: "object",
  properties: {
    answer_id: { type: "string" },
    submission_id: { type: "string" },
    question_identifier: { type: "string" },
    answer_value: {
      type: "object",
      properties: {
        value: { }  // Any type allowed
      },
      required: ["value"]
    },
    saved_at: { 
      type: "string", 
      format: "date-time" 
    }
  },
  required: ["submission_id", "question_identifier", "answer_value", "saved_at"]
};

export const noteSchema = {
  type: "object",
  properties: {
    note_id: { type: "string" },
    question_identifier: { type: "string" },
    note_text: { type: "string" },
    created_at: { 
      type: "string", 
      format: "date-time" 
    },
    operator: {
      type: "object",
      properties: {
        full_name: { type: "string" }
      },
      required: ["full_name"]
    }
  },
  required: ["note_text", "created_at", "operator"]
};

export const submissionSchema = {
  type: "object",
  properties: {
    submission_id: { type: "string" },
    fiscal_code: { 
      type: "string",
      // Italian fiscal code pattern (16 characters)
      pattern: "^[A-Z]{6}[0-9]{2}[A-Z]{1}[0-9]{2}[A-Z]{1}[0-9]{3}[A-Z]{1}$"
    },
    status: { 
      type: "string", 
      enum: ["InProgress", "Completed", "Abandoned"] 
    },
    created_at: { 
      type: "string", 
      format: "date-time" 
    },
    completed_at: { 
      type: "string", 
      format: "date-time" 
    },
    language_used: { 
      type: "string", 
      enum: ["it", "en", "es", "ar"] 
    },
    questionnaire: questionnaireSchema,
    answers: {
      type: "array",
      items: answerSchema
    },
    notes: {
      type: "array",
      items: noteSchema
    }
  },
  required: ["submission_id", "fiscal_code", "status", "created_at", "language_used", "questionnaire", "answers"]
};
