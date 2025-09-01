export type FeedbackStatus = "New" | "Investigating" | "Resolved";

export interface FeedbackDTO {
    id: number;
    submission_id?: string;
    question_identifier?: string;
    feedback_text: string;
    template_name: string;
    reporter_metadata?: Record<string, any>;
    submitted_at: string;
    status: FeedbackStatus;
  }