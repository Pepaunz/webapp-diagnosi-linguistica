import * as submissionRepo from "../repositories/submission.repository";
import * as templateRepo from "../repositories/template.repository";
import { StartOrResumeRequest } from "../../api/validators/submission.validator";
import { ApiError } from "../../api/middlewares/errorHandler.middleware";
import { StartOrResumeResponse } from "../../types/api.types"; // Ipotetico file per i tipi di risposta
import { Prisma } from "@prisma/client";
import { SaveProgressRequest } from "../../api/validators/submission.validator";
import { Submission } from "../../api/validators/submission.validator";

export const startOrResume = async (
  input: StartOrResumeRequest
): Promise<StartOrResumeResponse> => {
  // 1. Verifica che il template esista e sia attivo
  const template = await templateRepo.findActiveTemplateById(
    input.questionnaire_template_id
  );
  if (!template) {
    throw new ApiError(
      404,
      "Questionnaire template not found or is not active"
    );
  }

  // 2. Cerca una submission in corso
  let submission = await submissionRepo.findLatestInProgress(
    input.fiscal_code,
    input.questionnaire_template_id
  );
  let isNew = false;

  // 3. Se non esiste, creane una nuova
  if (!submission) {
    submission = await submissionRepo.createSubmission({
      fiscal_code: input.fiscal_code,
      template_id: input.questionnaire_template_id,
      language_used: input.language_used,
    });
    isNew = true;
  }

  // 4. Recupera le risposte già salvate (sarà un array vuoto se la submission è nuova)
  const answers = await submissionRepo.findAnswersBySubmissionId(
    submission.submission_id
  );

  // 5. Costruisci e restituisci la risposta standard
  return {
    submission_id: submission.submission_id,
    status: submission.status as "InProgress", // Sappiamo che è InProgress
    current_step_identifier: submission.current_step_identifier,
    answers: answers,
    questionnaire_template: template, // Restituiamo il template per il rendering
    isNew: isNew, // Campo extra per far sapere al frontend se è una ripresa o un nuovo avvio
  };
};

export const saveProgress = async (
  submission_id: string,
  body: SaveProgressRequest
): Promise<{ last_updated_at: Date }> => {
  const { answers, current_step_identifier } = body;

  // 1. Verifica che la submission esista e sia ancora in corso
  const submission = await submissionRepo.findInProgressSubmissionById(
    submission_id
  );
  if (!submission) {
    throw new ApiError(
      404,
      "Submission not found or has already been completed"
    );
  }

  const answersToUpsert: Prisma.AnswerCreateManyInput[] = answers.map(
    (answer) => ({
      // Aggiungiamo il submission_id, che conosciamo dal parametro dell'URL
      submission_id: submission_id,
      question_identifier: answer.question_identifier,
      answer_value: answer.answer_value as Prisma.InputJsonValue,
      // `saved_at` verrà gestito dal DB con `default(now())` in creazione
      // e lo impostiamo esplicitamente nell'update nel repository.
    })
  );

  // 3. Chiama il repository per eseguire l'operazione transazionale
  await submissionRepo.upsertAnswersAndUpdateSubmission(
    submission_id,
    answersToUpsert,
    current_step_identifier
  );

  // Restituiamo il timestamp per la risposta del controller
  return { last_updated_at: new Date() };
};

// ... (import e funzioni esistenti) ...
import { CompleteSubmissionBody } from '../../api/validators/submission.validator';

export const complete = async (
  submission_id: string,
  body: CompleteSubmissionBody
): Promise<Submission> => {
  const { answers, current_step_identifier } = body;

  // 1. Verifica che la submission esista e sia ancora in corso
  const submission = await submissionRepo.findInProgressSubmissionById(submission_id);
  if (!submission) {
    throw new ApiError(404, 'Submission not found or has already been completed');
  }

  // 2. Prepara le risposte per il repository, se presenti
  let answersToUpsert: Prisma.AnswerCreateManyInput[] | undefined = undefined;
  if (answers && answers.length > 0) {
    answersToUpsert = answers.map(answer => ({
      submission_id: submission_id,
      question_identifier: answer.question_identifier,
      answer_value: answer.answer_value as Prisma.InputJsonValue,
    }));
  }

  // 3. Chiama il repository per eseguire la transazione e restituire la submission completata
  return submissionRepo.saveAndCompleteSubmission(
    submission_id,
    answersToUpsert,
    current_step_identifier
  );
};