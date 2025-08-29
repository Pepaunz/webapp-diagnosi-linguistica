/**
 * Questionnaire related types
 */
import { LocalizedText } from "./common.types";

/**
 * Types of questions supported in the questionnaire
 */
export type QuestionType = "text" | "multiple-choice" | "rating" | "date";

/**
 * Represents an option in a multiple-choice question
 */
export interface Option {
  value: string;
  text: LocalizedText;
}

/**
 * Represents a question in the questionnaire
 */
export interface Question {
  questionId: string;
  text: LocalizedText;
  type: QuestionType;
  helpText?: LocalizedText;
  required?: boolean;
  options?: Option[]; // For multiple-choice questions
  minValue?: number; // For rating questions
  maxValue?: number; // For rating questions
}

/**
 * Represents a section of the questionnaire containing multiple questions
 */
export interface Section {
  sectionId: string;
  title: LocalizedText;
  description?: LocalizedText;
  questions: Question[];
}

/**
 * Represents a complete questionnaire template
 */
export interface QuestionnaireData {
  questionnaireTitle: LocalizedText;
  description: LocalizedText;
  version: string;
  defaultLanguage: string;
  sections: Section[];
}
