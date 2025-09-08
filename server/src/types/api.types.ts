// src/types/api.types.ts
import { Template } from "@prisma/client";
import { AnswerDTO } from "@bilinguismo/shared";

export interface StartOrResumeResponse {
  submission_id: string;
  status: "InProgress";
  current_step_identifier: string | null;
  answers: AnswerDTO[];
  questionnaire_template: Template;
  isNew: boolean;
}
