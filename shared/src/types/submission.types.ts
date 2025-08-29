/**
 * Submission related types
 */
import { Language } from "./common.types";
import { QuestionnaireData } from "./questionnaire.types";

/**
 * Represents an answer to a specific question
 */
export interface Answer {
  answer_id: string;
  submission_id: string;
  question_identifier: string;
  answer_value: {
    value: any;
  };
  saved_at: string;
}

/**
 * Represents a note added by an operator
 */
export interface Note {
  note_id: string;
  question_identifier?: string;
  note_text: string;
  created_at: string;
  operator: {
    full_name: string;
  };
}

/**
 * Status of a questionnaire submission
 */
export type SubmissionStatus = "InProgress" | "Completed" | "Abandoned";

/**
 * Represents a submission of a questionnaire
 */
export interface Submission {
  id: string;
  fiscal_code: string;
  status: SubmissionStatus;
  created_at: string;
  completed_at?: string;
  language_used: Language;
  questionnaire: QuestionnaireData;
  answers: Answer[];
  notes: Note[];
}
