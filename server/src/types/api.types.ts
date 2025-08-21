// src/types/api.types.ts
import { Answer, Template } from "@prisma/client";

export interface StartOrResumeResponse {
  submission_id: string;
  status: "InProgress";
  current_step_identifier: string | null;
  answers: Answer[];
  questionnaire_template: Template;
  isNew: boolean;
}
