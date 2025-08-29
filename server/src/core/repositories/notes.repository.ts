// src/core/repositories/notes.repository.ts
import { PrismaClient, OperatorNote, Prisma } from "@prisma/client";
import { AddNoteRequest, UpdateNoteRequest } from "@bilinguismo/shared";

const prisma = new PrismaClient();

// Type per note con operator info
type OperatorNoteWithOperator = OperatorNote & {
  operator: {
    full_name: string | null;
  };
};

// GET /submissions/{id}/notes - Lista note per submission
export const findNotesBySubmissionId = async (
  submission_id: string
): Promise<OperatorNoteWithOperator[]> => {
  return prisma.operatorNote.findMany({
    where: { submission_id },
    include: {
      operator: {
        select: {
          full_name: true,
        },
      },
    },
    orderBy: { created_at: "desc" },
  });
};

// POST /submissions/{id}/notes - Crea nuova nota
export const createNote = async (
  submission_id: string,
  operator_id: string,
  data: AddNoteRequest
): Promise<OperatorNoteWithOperator> => {
  return prisma.operatorNote.create({
    data: {
      submission_id,
      operator_id,
      note_text: data.note_text,
      question_identifier: data.question_identifier,
    },
    include: {
      operator: {
        select: {
          full_name: true,
        },
      },
    },
  });
};

// Trova nota per ID (con info operatore)
export const findNoteById = async (
  note_id: string
): Promise<OperatorNoteWithOperator | null> => {
  return prisma.operatorNote.findUnique({
    where: { note_id },
    include: {
      operator: {
        select: {
          full_name: true,
        },
      },
    },
  });
};

// PUT /submissions/{id}/notes/{noteId} - Aggiorna nota
export const updateNote = async (
  note_id: string,
  data: UpdateNoteRequest
): Promise<OperatorNoteWithOperator> => {
  return prisma.operatorNote.update({
    where: { note_id },
    data: {
      note_text: data.note_text,
      updated_at: new Date(),
    },
    include: {
      operator: {
        select: {
          full_name: true,
        },
      },
    },
  });
};

// DELETE /submissions/{id}/notes/{noteId} - Elimina nota
export const deleteNote = async (note_id: string): Promise<void> => {
  await prisma.operatorNote.delete({
    where: { note_id },
  });
};