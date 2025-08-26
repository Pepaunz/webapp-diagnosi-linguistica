// src/core/repositories/feedback.repository.ts
import { PrismaClient, FeedbackReport, Prisma } from "@prisma/client";
import { SubmitFeedbackInput, ListFeedbackQuery } from "../../api/validators/feedback.validator";

const prisma = new PrismaClient();

// POST /feedback - Crea nuovo feedback (pubblico)
export const createFeedback = async (
  data: SubmitFeedbackInput
): Promise<FeedbackReport> => {
  return prisma.feedbackReport.create({
    data: {
      submission_id: data.submission_id,
      question_identifier: data.question_identifier,
      feedback_text: data.feedback_text,
      reporter_metadata: data.reporter_metadata as Prisma.InputJsonValue,
      // status è automatico "New" per default
    },
  });
};

// GET /feedback - Lista feedback con filtri (solo operatori)
export const findAllFeedbackWithFilters = async (
  query: ListFeedbackQuery
): Promise<{
  feedback: FeedbackReport[];
  total: number;
}> => {
  // Costruisce il filtro WHERE dinamicamente
  const whereClause: Prisma.FeedbackReportWhereInput = {};

  if (query.status) {
    whereClause.status = query.status;
  }

  // Costruisce l'ordinamento dinamico
  let orderBy: Prisma.FeedbackReportOrderByWithRelationInput = { submitted_at: "desc" };
  
  if (query.sort_by) {
    switch (query.sort_by) {
      case "submitted_at":
        orderBy = { submitted_at: query.sort_order };
        break;
      case "status":
        orderBy = { status: query.sort_order };
        break;
      default:
        orderBy = { submitted_at: "desc" };
    }
  }

  // Esegue le query in parallelo per ottimizzare le performance
  const [feedback, total] = await Promise.all([
    prisma.feedbackReport.findMany({
      where: whereClause,
      orderBy,
      skip: query.offset,
      take: query.limit,
    }),
    prisma.feedbackReport.count({
      where: whereClause,
    }),
  ]);

  return { feedback, total };
};

// Trova feedback per ID
export const findFeedbackById = async (
  feedback_id: string
): Promise<FeedbackReport | null> => {
  return prisma.feedbackReport.findUnique({
    where: { feedback_id },
  });
};

// PUT /feedback/{id} - Aggiorna status feedback (solo operatori)
export const updateFeedbackStatus = async (
  feedback_id: string,
  status: string
): Promise<FeedbackReport> => {
  return prisma.feedbackReport.update({
    where: { feedback_id },
    data: {
      status,
    },
  });
};