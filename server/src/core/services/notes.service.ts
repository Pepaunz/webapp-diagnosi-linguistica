// src/core/services/notes.service.ts
import * as notesRepo from "../repositories/notes.repository";
import * as submissionRepo from "../repositories/submission.repository";
import { ApiError } from "../../api/middlewares/errorHandler.middleware";
import { AddNoteRequest, UpdateNoteRequest } from "../../api/validators/note.validator";
import { JwtPayload } from "../../utils/jwt.utils";

// Type per response con operator info
type OperatorNoteWithOperator = {
  note_id: string;
  submission_id: string;
  question_identifier: string | null;
  operator_id: string;
  operator_full_name: string | null;
  note_text: string;
  created_at: Date;
  updated_at: Date;
};

// Trasforma il tipo Prisma in response type
const mapToResponseFormat = (note: any): OperatorNoteWithOperator => ({
  note_id: note.note_id,
  submission_id: note.submission_id,
  question_identifier: note.question_identifier,
  operator_id: note.operator_id,
  operator_full_name: note.operator?.full_name || null,
  note_text: note.note_text,
  created_at: note.created_at,
  updated_at: note.updated_at,
});

// GET /submissions/{id}/notes
export const getNotesBySubmissionId = async (
  submission_id: string
): Promise<{
  notes: OperatorNoteWithOperator[];
  total: number;
}> => {
  // 1. Verifica che la submission esista
  const submission = await submissionRepo.findSubmissionById(submission_id);
  if (!submission) {
    throw new ApiError(404, "Submission not found");
  }

  // 2. Recupera le note
  const notesData = await notesRepo.findNotesBySubmissionId(submission_id);
  
  const notes = notesData.map(mapToResponseFormat);

  return {
    notes,
    total: notes.length,
  };
};

// POST /submissions/{id}/notes
export const createNote = async (
  submission_id: string,
  operator: JwtPayload,
  data: AddNoteRequest
): Promise<OperatorNoteWithOperator> => {
  // 1. Verifica che la submission esista
  const submission = await submissionRepo.findSubmissionById(submission_id);
  if (!submission) {
    throw new ApiError(404, "Submission not found");
  }

  // 2. Crea la nota
  const noteData = await notesRepo.createNote(submission_id, operator.operator_id, data);
  
  return mapToResponseFormat(noteData);
};

// PUT /submissions/{id}/notes/{noteId}
export const updateNote = async (
  submission_id: string,
  note_id: string,
  operator: JwtPayload,
  data: UpdateNoteRequest
): Promise<OperatorNoteWithOperator> => {
  // 1. Verifica che la submission esista
  const submission = await submissionRepo.findSubmissionById(submission_id);
  if (!submission) {
    throw new ApiError(404, "Submission not found");
  }

  // 2. Verifica che la nota esista
  const existingNote = await notesRepo.findNoteById(note_id);
  if (!existingNote) {
    throw new ApiError(404, "Note not found");
  }

  // 3. Verifica che la nota appartenga alla submission corretta
  if (existingNote.submission_id !== submission_id) {
    throw new ApiError(400, "Note does not belong to this submission");
  }

  // 4. **AUTHORIZATION LOGIC**: Solo proprietario o admin
  if (operator.role !== "admin" && existingNote.operator_id !== operator.operator_id) {
    throw new ApiError(403, "You can only edit your own notes");
  }

  // 5. Aggiorna la nota
  const updatedNote = await notesRepo.updateNote(note_id, data);
  
  return mapToResponseFormat(updatedNote);
};

// DELETE /submissions/{id}/notes/{noteId}
export const deleteNote = async (
  submission_id: string,
  note_id: string,
  operator: JwtPayload
): Promise<void> => {
  // 1. Verifica che la submission esista
  const submission = await submissionRepo.findSubmissionById(submission_id);
  if (!submission) {
    throw new ApiError(404, "Submission not found");
  }

  // 2. Verifica che la nota esista
  const existingNote = await notesRepo.findNoteById(note_id);
  if (!existingNote) {
    throw new ApiError(404, "Note not found");
  }

  // 3. Verifica che la nota appartenga alla submission corretta
  if (existingNote.submission_id !== submission_id) {
    throw new ApiError(400, "Note does not belong to this submission");
  }

  // 4. **AUTHORIZATION LOGIC**: Solo proprietario o admin
  if (operator.role !== "admin" && existingNote.operator_id !== operator.operator_id) {
    throw new ApiError(403, "You can only delete your own notes");
  }

  // 5. Elimina la nota
  await notesRepo.deleteNote(note_id);
};