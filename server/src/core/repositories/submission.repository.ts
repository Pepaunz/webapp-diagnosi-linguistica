import { PrismaClient, Submission, Answer, Prisma } from "@prisma/client";
import { ListSubmissionsQuery } from "@bilinguismo/shared";
const prisma = new PrismaClient();

type SubmissionWithTemplate = Submission & {
  template: {
    template_id: string;
    name: string;
    structure_definition: any; // Aggiungi anche questo se serve per calcolare gli step
  };
};
export const findLatestInProgress = async (
  fiscal_code: string,
  template_id: string
): Promise<Submission | null> => {
  return prisma.submission.findFirst({
    where: { fiscal_code, template_id, status: "InProgress" },
    orderBy: { last_updated_at: "desc" },
  });
};

export const createSubmission = async (data: {
  fiscal_code: string;
  template_id: string;
  language_used: string;
}): Promise<Submission> => {
  return prisma.submission.create({
    data: {
      fiscal_code: data.fiscal_code,
      template_id: data.template_id,
      language_used: data.language_used,
      // status, created_at, etc., hanno valori di default nello schema
    },
  });
};

export const findAnswersBySubmissionId = async (
  submission_id: string
): Promise<Answer[]> => {
  return prisma.answer.findMany({
    where: { submission_id },
  });
};


export const findInProgressSubmissionByIdWithTemplate = async (id: string) => {
  return prisma.submission.findUnique({
    where: { submission_id: id, status: 'InProgress' },
    include: {
      template: true, 
    },
  });
};

/**
 * Esegue l'upsert di un batch di risposte e aggiorna la submission
 * all'interno di un'unica transazione.
 * @param submission_id L'ID della submission da aggiornare.
 * @param answers L'array di risposte da salvare/aggiornare.
 * @param current_step_identifier L'ultimo step raggiunto dall'utente.
 */
export const upsertAnswersAndUpdateSubmission = async (
  submission_id: string,
  answers: Prisma.AnswerCreateManyInput[], // Usiamo il tipo generato da Prisma per l'input di createMany
  current_step_identifier: string
): Promise<void> => {
  // Le operazioni da eseguire nella transazione
  const upsertOperations = answers.map((answer) =>
    prisma.answer.upsert({
      where: {
        submission_id_question_identifier: {
          submission_id: submission_id,
          question_identifier: answer.question_identifier,
        },
      },
      update: { answer_value: answer.answer_value, saved_at: new Date() },
      create: {
        submission_id: submission_id,
        question_identifier: answer.question_identifier,
        answer_value: answer.answer_value,
      },
    })
  );

  const updateSubmissionOperation = prisma.submission.update({
    where: { submission_id: submission_id },
    data: {
      last_updated_at: new Date(),
      current_step_identifier: current_step_identifier,
    },
  });

  // Esegui tutte le operazioni in una transazione per /api/submissions/submission_id/save_progress
  await prisma.$transaction([...upsertOperations, updateSubmissionOperation]);
};

export const saveAndCompleteSubmission = async (
  submission_id: string,
  answers: Prisma.AnswerCreateManyInput[] | undefined,
  current_step_identifier: string
): Promise<Submission> => {
  const operations: any[] = [];

  // 1. Operazioni di upsert risposte
  if (answers && answers.length > 0) {
    const upsertOperations = answers.map(answer =>
      prisma.answer.upsert({
        where: {
          submission_id_question_identifier: {
            submission_id: submission_id,
            question_identifier: answer.question_identifier,
          },
        },
        update: { answer_value: answer.answer_value, saved_at: new Date() },
        create: {
          submission_id: submission_id,
          question_identifier: answer.question_identifier,
          answer_value: answer.answer_value,
        },
      })
    );
    operations.push(...upsertOperations);
  }

  // 2. Operazione di completamento
  const completeOperation = prisma.submission.update({
    where: { submission_id },
    data: {
      status: 'Completed',
      completed_at: new Date(),
      last_updated_at: new Date(),
      current_step_identifier: current_step_identifier,
    },
  });
  operations.push(completeOperation);

  // 3. Esegui transazione e restituisci esplicitamente la submission
  await prisma.$transaction(operations);
  
  // 4. SOLUZIONE: Recupera esplicitamente la submission aggiornata
  const updatedSubmission = await prisma.submission.findUnique({
    where: { submission_id }
  });
  
  if (!updatedSubmission) {
    throw new Error("Submission not found after completion");
  }
  
  return updatedSubmission;
};

export const findSubmissionsWithFilters = async (
  query: ListSubmissionsQuery
): Promise<{
  submissions: SubmissionWithTemplate[];
  total: number;
}> => {
  // Costruisce il filtro WHERE dinamicamente
  const whereClause: Prisma.SubmissionWhereInput = {};

  if (query.status) {
    whereClause.status = query.status;
  }

  if (query.fiscal_code) {
    whereClause.fiscal_code = query.fiscal_code;
  }

  if (query.template_id) {
    whereClause.template_id = query.template_id;
  }

  // Aggiungi filtri per date se presenti nella query
  if (query.date_from || query.date_to) {
    whereClause.created_at = {};
    if (query.date_from) {
      whereClause.created_at.gte = query.date_from;
    }
    if (query.date_to) {
      whereClause.created_at.lte = query.date_to;
    }
  }

  // Costruisce l'ordinamento dinamico
  let orderBy: Prisma.SubmissionOrderByWithRelationInput = { last_updated_at: "desc" };
  
  if (query.sort_by) {
    switch (query.sort_by) {
      case "created_at":
        orderBy = { created_at: query.sort_order };
        break;
      case "last_updated_at":
        orderBy = { last_updated_at: query.sort_order };
        break;
      case "completed_at":
        orderBy = { completed_at: query.sort_order };
        break;
      case "fiscal_code":
        orderBy = { fiscal_code: query.sort_order };
        break;
      case "status":
        orderBy = { status: query.sort_order };
        break;
      default:
        orderBy = { last_updated_at: "desc" };
    }
  }

  // Esegue le query in parallelo per ottimizzare le performance
  const [submissions, total] = await Promise.all([
    prisma.submission.findMany({
      where: whereClause,
      orderBy,
      skip: query.offset,
      take: query.limit,
      include: {
        template: {
          select: {
            template_id: true,
            name: true,
            structure_definition:true,
          },
        },
      },
    }),
    prisma.submission.count({
      where: whereClause,
    }),
  ]);

  return { submissions, total };
};

export const findSubmissionById = async (
  id: string
): Promise<Submission | null> => {
  return prisma.submission.findUnique({
    where: { submission_id: id },
    include: {
      template: {
        select: {
          template_id: true,
          name: true,
          description: true,
        },
      },
    },
  });
};

export const deleteSubmission = async (id: string): Promise<void> => {
  // Elimina la submission. Grazie ai vincoli CASCADE definiti nello schema Prisma,
  // tutte le entità correlate (answers, notes, feedback) verranno eliminate automaticamente
  await prisma.submission.delete({
    where: { submission_id: id },
  });
};

export const findAllAnswersForSubmission = async (submission_id: string) => {
  return prisma.answer.findMany({
    where: { submission_id },
  });
};



export const findSubmissionWithDetailsById = async (id: string) => {
  return prisma.submission.findUnique({
    where: { submission_id: id },
    include: {
      template: true,
      answers: true,
      notes: {
        include: {
          operator: {
            select: { full_name: true }, // Carichiamo solo il nome dell'operatore
          },
        },
      },
    },
  });
};