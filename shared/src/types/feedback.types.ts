/**
 * Feedback related types
 */

/**
 * Status of a feedback report
 */
export type FeedbackStatus = "New" | "Investigating" | "Resolved";

/**
 * Represents a feedback report
 */
export interface Feedback {
  id: number;
  submission_id?: string;
  question_identifier?: string;
  feedback_text: string;
  template_name: string;
  reporter_metadata?: Record<string, any>;
  submitted_at: string;
  status: FeedbackStatus;
}
