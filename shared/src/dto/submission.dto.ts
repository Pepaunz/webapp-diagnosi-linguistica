import { SubmissionStatus, QuestionnaireData } from "../schemas";
import { Language } from "../schemas";

export interface SubmissionDTO {
  id: number;                    // ID incrementale per UI
  fiscalCode: string;           // CF della famiglia  
  template: string;             // Nome del template (non UUID)
  status: SubmissionStatus;     // Stato della submission
  progress: string;             // passi completati
  lastUpdated: string;          // Data formattata ISO string
  completedOn: string | null;   // Data completamento o null
  language: Language;             // Lingua utilizzata
}

export interface AnswerDTO {
  answer_id: number;
  question_identifier: string;
  answer_value: any; // Qualsiasi tipo di risposta
  saved_at: string; // Data ISO string
}

// Note operatore per frontend
export interface OperatorNoteDTO {
  note_id: string;
  question_identifier: string | null;
  operator_full_name: string;
  note_text: string;
  created_at: string; // Data ISO string
  updated_at?: string; // Data ISO string
}

// Template per frontend
export interface TemplateDTO {
  template_id: string;
  name: string;
  description: string | null;
  structure_definition: QuestionnaireData; // JSON del questionario
  available_languages: string[];
  created_at: string;
  updated_at?: string;
}

// DTO completo per dettaglio submission
export interface SubmissionDetailDTO {
  submission: SubmissionDTO;
  template: TemplateDTO;
  answers: AnswerDTO[];
  notes: OperatorNoteDTO[];
}