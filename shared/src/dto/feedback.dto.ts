export type FeedbackStatus = "New" | "Investigating" | "Resolved";

export interface FeedbackDTO {
    id: number; // ID incrementale per UI
    uuid: string; // UUID univoco per API
    submission_id?: string;
    question_identifier?: string;
    feedback_text: string;
    template_name: string;
    reporter_metadata?: Record<string, any>;
    submitted_at: string;
    status: FeedbackStatus;
  }