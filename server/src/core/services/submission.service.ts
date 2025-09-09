import * as submissionRepo from "../repositories/submission.repository";
import * as templateRepo from "../repositories/template.repository";
import * as operatorNotesRepo from "../repositories/notes.repository";
import { Language, QuestionnaireData, StartOrResumeRequest, SubmissionStatus, Question } from "@bilinguismo/shared";
import { ApiError } from "../../api/middlewares/errorHandler.middleware";
import { StartOrResumeResponse } from "../../types/api.types"; // Ipotetico file per i tipi di risposta
import { Prisma, Submission as PrismaSubmission, Answer, Template} from "@prisma/client";
import { SaveProgressRequest } from "@bilinguismo/shared";
import { ListSubmissionsQuery, CompleteSubmissionBody } from "@bilinguismo/shared";
import { SubmissionDTO } from "@bilinguismo/shared";
import { SubmissionDetailDTO, AnswerDTO, OperatorNoteDTO, TemplateDTO } from "@bilinguismo/shared";
import { questionSchema } from "@../../../shared/src/schemas/questionnaire.schemas";

// ====================================================================
// HELPER FUNCTIONS
// ====================================================================

const validateSectionAnswers = (sectionQuestions: Question[], answers: SaveProgressRequest['answers']) => {

    const answersMap = new Map(answers.map(a => [a.question_identifier, a.answer_value]));

    // Controlla che tutte le domande obbligatorie della sezione abbiano una risposta
    for (const question of sectionQuestions) {
      if (question.required) {
        const answerValue = answersMap.get(question.questionId);
        if (answerValue === undefined || answerValue === null || (typeof answerValue === 'string' && answerValue.trim() === '')) {
          throw new ApiError(400, `Validation Error: Answer for required question "${question.questionId}" in this section is missing.`);
        }
      }
    }
  
  const validQuestionMap = new Map(sectionQuestions.map(q => [q.questionId, q]));
  // Iteriamo su ogni risposta inviata dal client e la validiamo
  for (const answer of answers) {
    const questionDefinition = validQuestionMap.get(answer.question_identifier);

    // Controlla se l'ID della domanda è valido
    if (!questionDefinition) {
      throw new ApiError(400, `Validation Error: Question with ID "${answer.question_identifier}" does not exist in this template.`);
    }

    // Controlla la coerenza del valore della risposta con il tipo di domanda
    const { type, options,required } = questionDefinition;
    const { answer_value } = answer;

    if (required) {
      // Controlliamo se answer_value è nullo, indefinito o una stringa vuota
      if (answer_value === null || answer_value === undefined || (typeof answer_value === 'string' && answer_value.trim() === '')) {
        throw new ApiError(400, `Validation Error: Answer for required question "${answer.question_identifier}" cannot be empty.`);
      }
    }
    
    // Se la risposta è fornita, controlliamo la coerenza del tipo
    if (answer_value !== null && answer_value !== undefined) {
        if (type === 'multiple-choice' || type === 'rating') {
            const validOptionValues = options?.map(opt => opt.value) || [];
            if (typeof answer_value !== 'string' || !validOptionValues.includes(answer_value)) {
                throw new ApiError(400, `Validation Error: Invalid option "${answer_value}" for question "${answer.question_identifier}".`);
            }
        } else if (type === 'date') {
            if (typeof answer_value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(answer_value) || isNaN(Date.parse(answer_value))) {
                throw new ApiError(400, `Validation Error: Invalid date format for question "${answer.question_identifier}".`);
            }
        } else if (type === 'text') {
            if (typeof answer_value !== 'string') {
                throw new ApiError(400, `Validation Error: Answer for question "${answer.question_identifier}" must be a string.`);
            }
        }
    }
  }
};

const calculateProgress = (
  currentStepIdentifier: string | null,
  structureDefinition: any
): string => {
  
  if (!currentStepIdentifier) return "0/" + structureDefinition.sections.length;
  
  const totalSteps = structureDefinition.sections.length;
  
  const currentStepNumber = structureDefinition.sections.findIndex(
    (    section: { sectionId: string; }) => section.sectionId === currentStepIdentifier
  ) + 1;
  
  // Se non trova il sectionId, assume step 0
  if (currentStepNumber === 0) return `0/${totalSteps}`;
  
  return `${currentStepNumber}/${totalSteps}`;
};

// ====================================================================
// SERVICES
// ====================================================================

//POST /submissions/start_or_resume.
export const startOrResume = async (
  input: StartOrResumeRequest
): Promise<StartOrResumeResponse> => {
  //Verifica che il template esista e sia attivo
  const template = await templateRepo.findActiveTemplateById(
    input.questionnaire_template_id
  );
  if (!template) {
    throw new ApiError(
      404,
      "Questionnaire template not found or is not active"
    );
  }

  //Cerca una submission in corso
  let submission = await submissionRepo.findLatestInProgress(
    input.fiscal_code,
    input.questionnaire_template_id
  );
  let isNew = false;

  //Se non esiste, creane una nuova
  if (!submission) {
    submission = await submissionRepo.createSubmission({
      fiscal_code: input.fiscal_code,
      template_id: input.questionnaire_template_id,
      language_used: input.language_used,
    });
    isNew = true;
  }

  //Recupera le risposte già salvate (sarà un array vuoto se la submission è nuova)
  const answersFromDb = await submissionRepo.findAnswersBySubmissionId(
    submission.submission_id
  );

  const answersDTO: AnswerDTO[] = answersFromDb.map(answer => {
    const extractedValue = (answer.answer_value as any)?.value ?? null;

    return {
      answer_id: answer.answer_id, 
      question_identifier: answer.question_identifier,
      saved_at: answer.saved_at.toISOString(),
      answer_value: extractedValue,
    };
  });

  //Costruisci e restituisci la risposta standard
  return {
    submission_id: submission.submission_id,
    status: submission.status as "InProgress", // Sappiamo che è InProgress
    current_step_identifier: submission.current_step_identifier,
    answers: answersDTO,
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

  // Verifica che la submission esista e sia ancora in corso
  const submission = await submissionRepo.findInProgressSubmissionByIdWithTemplate(
    submission_id
  );
  if (!submission || !submission.template) {
    throw new ApiError(
      404,
      "Submission not found or has already been completed or not associated template"
    );
  }

  // **NUOVA LOGICA DI VALIDAZIONE**
  const structure = submission.template.structure_definition as any;
  const currentSection = structure.sections.find((s: any) => s.sectionId === current_step_identifier);

  if (!currentSection) {
    throw new ApiError(400, `Validation Error: Step identifier "${current_step_identifier}" is not a valid section in this template.`);
  }

  // Valida le risposte SOLO per la sezione che si sta salvando
  validateSectionAnswers(currentSection.questions, answers);

  const answersToUpsert: Prisma.AnswerCreateManyInput[] = answers.map(
    (answer) => ({
      // Aggiungiamo il submission_id, che conosciamo dal parametro dell'URL
      submission_id: submission_id,
      question_identifier: answer.question_identifier,
      answer_value: {value: answer.answer_value}

    })
  );

  // Chiama il repository per eseguire l'operazione transazionale
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

  // Verifica che la submission esista e sia ancora in corso
  const submission = await submissionRepo.findInProgressSubmissionByIdWithTemplate(submission_id);
  if (!submission || !submission.template) {
    throw new ApiError(404, 'Submission not found or has already been completed or it is not associated to a template');
  }

  // Recupera tutte le risposte già salvate nel DB per questa submission
  const allSavedAnswers = await submissionRepo.findAllAnswersForSubmission(submission_id);
  const allAnswersMap = new Map(allSavedAnswers.map(a => [a.question_identifier, a.answer_value]));

  //Unisci le risposte finali (dall'ultimo step) a quelle già salvate
  if (answers && answers.length > 0) {
    answers.forEach(a => allAnswersMap.set(a.question_identifier, a.answer_value));
  }

  //Itera su TUTTE le domande di TUTTE le sezioni del template
  const structure = submission.template.structure_definition as any;
  for (const section of structure.sections) {
    for (const question of section.questions) {
      // Verifica che ogni domanda obbligatoria abbia una risposta nella nostra mappa aggregata
      if (question.required) {
        const answerValue = allAnswersMap.get(question.questionId);
        // estrae il valore reale dall'oggetto { value: ... }
        const finalValue = (answerValue as any)?.value;

        if (finalValue === undefined || finalValue === null || (typeof finalValue === 'string' && finalValue.trim() === '')) {
          throw new ApiError(400, `Cannot complete: Answer for required question "${question.questionId}" in section "${section.sectionId}" is missing.`);
        }
      }
    }
  }




  //  Prepara le risposte per il repository, se presenti
  let answersToUpsert: Prisma.AnswerCreateManyInput[] | undefined = undefined;
  if (answers && answers.length > 0) {
  
    answersToUpsert = answers.map(answer => ({
      submission_id: submission_id,
      question_identifier: answer.question_identifier,
      answer_value: {value: answer.answer_value},
    }));
  }

  // Chiama il repository per eseguire la transazione e restituire la submission completata
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
   // Trasformazione in DTO per frontend
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
      uuid: submission.submission_id,
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
  // Verifica che la submission esista
  const submission = await submissionRepo.findSubmissionById(submission_id);
  if (!submission) {
    throw new ApiError(404, "Submission not found");
  }

  // Recupera le risposte associate
  const answers = await submissionRepo.findAnswersBySubmissionId(submission_id);

  // Recupera i dettagli del template
  const template = await templateRepo.findTemplateById(submission.template_id);
  if (!template) {
    throw new ApiError(500, "Associated template not found");
  }

  // Recupera eventuali note degli operatori (opzionale per questa fase)
   const notes = await operatorNotesRepo.findNotesBySubmissionId(submission_id);

   const submissionDTO: SubmissionDTO = {
    id: 1,
    uuid:submission.submission_id,
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

  //  Trasforma template in DTO (converti date in string)
  const templateDTO: TemplateDTO = {
    ...template, 
    // Safe cast: structure_definition è validato con structureDefinitionSchema durante la creazione
    structure_definition: template.structure_definition as QuestionnaireData,
    created_at: template.created_at.toISOString(),
    updated_at: template.updated_at.toISOString(),
   
  };
  const answersDTO: AnswerDTO[] = answers.map(answer => {
    // Estraiamo il valore dall'oggetto JSONB
    let extractedValue: any = null;
    if (answer.answer_value && typeof answer.answer_value === 'object' && 'value' in answer.answer_value) {
        extractedValue = (answer.answer_value as { value: any }).value;
    }
    return {
      answer_id: answer.answer_id,
      question_identifier: answer.question_identifier,
      saved_at: answer.saved_at.toISOString(),
      answer_value: extractedValue,
    };
  });

  // Trasforma notes in DTO (gestisci null values e aggiungi operator info)
  const notesDTO: OperatorNoteDTO[] = notes.map(note => ({
    note_id: note.note_id,
    submission_id: note.submission_id,
    question_identifier: note.question_identifier,
    note_text: note.note_text,
    operator_full_name: note.operator?.full_name || "Operatore sconosciuto", 
    created_at: note.created_at.toISOString(),
    updated_at: note.updated_at.toISOString(),
  }));

  // Costruisci il DTO finale
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
  // Verifica che la submission esista
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