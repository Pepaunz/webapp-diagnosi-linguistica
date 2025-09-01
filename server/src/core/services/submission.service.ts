import * as submissionRepo from "../repositories/submission.repository";
import * as templateRepo from "../repositories/template.repository";
import * as operatorNotesRepo from "../repositories/notes.repository";
import { Language, QuestionnaireData, StartOrResumeRequest, SubmissionStatus } from "@bilinguismo/shared";
import { ApiError } from "../../api/middlewares/errorHandler.middleware";
import { StartOrResumeResponse } from "../../types/api.types"; // Ipotetico file per i tipi di risposta
import { Prisma, Submission as PrismaSubmission, Answer } from "@prisma/client";
import { SaveProgressRequest } from "@bilinguismo/shared";
import { ListSubmissionsQuery, CompleteSubmissionBody } from "@bilinguismo/shared";
import { SubmissionDTO } from "@bilinguismo/shared";
import { SubmissionDetailDTO, AnswerDTO, OperatorNoteDTO, TemplateDTO } from "@bilinguismo/shared";

// ====================================================================
// HELPER FUNCTIONS
// ====================================================================

const calculateProgress = (
  currentStepIdentifier: string | null,
  structureDefinition: any
): string => {
  
  if (!currentStepIdentifier) return "0/" + structureDefinition.sections.length;
  
  const totalSteps = structureDefinition.sections.length;
  
  const currentStepNumber = structureDefinition.sections.findIndex(
    (    section: { sectionId: string; }) => section.sectionId === currentStepIdentifier
  ) + 1;
  
  // Se non trova il sectionId (caso edge), assume step 0
  if (currentStepNumber === 0) return `0/${totalSteps}`;
  
  return `${currentStepNumber}/${totalSteps}`;
};

//POST /submissions/start_or_resume.
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

//PUT /submissions/{id}/save_progress
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

  return { last_updated_at: new Date() };
};

//POST /submissions/{id}/complete
export const complete = async (
  submission_id: string,
  body: CompleteSubmissionBody
): Promise<PrismaSubmission> => {
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
  const completedSubmissionFromPrisma: PrismaSubmission = await submissionRepo.saveAndCompleteSubmission(
    submission_id,
    answersToUpsert,
    current_step_identifier
  );

  return completedSubmissionFromPrisma;

};

// GET /submissions - Per operatori
export const getSubmissions = async (
  query: ListSubmissionsQuery
): Promise<{
  submissions: SubmissionDTO[];
  total: number;
  pagination: {
    limit: number;
    offset: number;
    has_more: boolean;
  };
}> => {
  // Chiama il repository per ottenere le submission con filtri e paginazione
  const { submissions: rawSubmissions, total } = await submissionRepo.findSubmissionsWithFilters(query);

  // Calcola se ci sono più pagine disponibili
  const hasMore = query.offset + query.limit < total;
   // 2. Trasformazione in DTO per frontend
   const submissionsDTO: SubmissionDTO[] = rawSubmissions.map((submission, index) => {
    
    // Calcola ID incrementale basato su paginazione
    const incrementalId = (query.offset || 0) + index + 1;
    
    // Calcola progress usando la struttura del template
    const progress = calculateProgress(
      submission.current_step_identifier, 
      submission.template.structure_definition
    );
    
    return {
      id: incrementalId,
      fiscalCode: submission.fiscal_code,
      template: submission.template.name,
      status: submission.status as SubmissionStatus,
      progress: progress,
      lastUpdated: submission.last_updated_at.toISOString(),
      completedOn: submission.completed_at?.toISOString() || null,
      language: submission.language_used as Language,
    };
  });

  return {
    submissions: submissionsDTO,
    total,
    pagination: {
      limit: query.limit,
      offset: query.offset,
      has_more: hasMore,
    },
  };
};

// GET /submissions/{id} - Dettagli completi di una submission per operatori
export const getSubmissionById = async (
  submission_id: string
): Promise<SubmissionDetailDTO> => {
  // 1. Verifica che la submission esista
  const submission = await submissionRepo.findSubmissionById(submission_id);
  if (!submission) {
    throw new ApiError(404, "Submission not found");
  }

  // 2. Recupera le risposte associate
  const answers = await submissionRepo.findAnswersBySubmissionId(submission_id);

  // 3. Recupera i dettagli del template
  const template = await templateRepo.findTemplateById(submission.template_id);
  if (!template) {
    throw new ApiError(500, "Associated template not found");
  }

  // 4. Recupera eventuali note degli operatori (opzionale per questa fase)
   const notes = await operatorNotesRepo.findNotesBySubmissionId(submission_id);

   const submissionDTO: SubmissionDTO = {
    id: 1,
    fiscalCode: submission.fiscal_code,
    template: template.name,
    status: submission.status as SubmissionStatus,
    progress: calculateProgress(
      submission.current_step_identifier, 
      template.structure_definition
    ),
    lastUpdated: submission.last_updated_at.toISOString(),
    completedOn: submission.completed_at?.toISOString() || null,
    language: submission.language_used as Language,
  };

  // 2. Trasforma template in DTO (converti date in string)
  const templateDTO: TemplateDTO = {
    ...template, 
    // Safe cast: structure_definition è validato con structureDefinitionSchema durante la creazione
    structure_definition: template.structure_definition as QuestionnaireData,
    created_at: template.created_at.toISOString(),
    updated_at: template.updated_at.toISOString(),
   
  };

  // 3. Trasforma answers in DTO (gestisci JsonValue)
  const answersDTO: AnswerDTO[] = answers.map(answer => ({
    ...answer, 
    saved_at: answer.saved_at.toISOString(),
  }));

  // 4. Trasforma notes in DTO (gestisci null values e aggiungi operator info)
  const notesDTO: OperatorNoteDTO[] = notes.map(note => ({
    note_id: note.note_id,
    submission_id: note.submission_id,
    question_identifier: note.question_identifier,
    note_text: note.note_text,
    operator_full_name: note.operator?.full_name || "Operatore sconosciuto", 
    created_at: note.created_at.toISOString(),
    updated_at: note.updated_at.toISOString(),
  }));

  // 5. Costruisci il DTO finale
  const submissionDetail: SubmissionDetailDTO = {
    submission: submissionDTO,
    template: templateDTO,
    answers: answersDTO,
    notes: notesDTO,
  };

  return submissionDetail;
};

// DELETE /submissions/{id} - Eliminazione di una submission per operatori
export const deleteSubmission = async (
  submission_id: string
): Promise<void> => {
  // 1. Verifica che la submission esista
  const submission = await submissionRepo.findSubmissionById(submission_id);
  if (!submission) {
    throw new ApiError(404, "Submission not found");
  }

  // 2. Verifica che la submission non sia in uno stato che non dovrebbe essere eliminato
  // Ad esempio, potremmo voler impedire l'eliminazione di submission completate
  // (questo dipende dalle regole di business specifiche)
  // if (submission.status === "Completed") {
  //   throw new ApiError(400, "Cannot delete completed submissions");
  // }

  // 3. Procedi con l'eliminazione
  // Grazie ai vincoli CASCADE nel database, le entità correlate 
  // (answers, notes, feedback) verranno eliminate automaticamente
  await submissionRepo.deleteSubmission(submission_id);
};