// src/types/questionnaire.ts

export type QuestionType = "text" | "multiple-choice" | "rating" | "date";

export type Language = "it" | "en" | "es" | "ar";

export interface LocalizedText {
  it?: string;
  en?: string;
  es?: string;
  ar?: string;
  [key: string]: string | undefined; // Index signature per permettere l'accesso dinamico
}

export interface Option {
  value: string;
  text: LocalizedText;
}

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

export interface Section {
  sectionId: string;
  title: LocalizedText;
  description?: LocalizedText;
  questions: Question[];
}

export interface QuestionnaireData {
  questionnaireTitle: LocalizedText;
  description: LocalizedText;
  version: string;
  defaultLanguage: string;
  sections: Section[];
}

export interface Answer {
  answer_id: string;
  submission_id: string;
  question_identifier: string;
  answer_value: {
    value: any;
  };
  saved_at: string;
}
