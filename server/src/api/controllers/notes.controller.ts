// src/api/controllers/notes.controller.ts
import { Request, Response, NextFunction } from "express";
import { AddNoteRequest, UpdateNoteRequest, NoteParams } from "@bilinguismo/shared";
import { UuidParam } from "@bilinguismo/shared";
import * as notesService from "../../core/services/notes.service";


interface AuthenticatedRequest<TParams = {}, TBody = {}> extends Request<TParams, any, TBody> {
  operator?: {
    operator_id: string;
    role: string;
  };
}

// GET /submissions/:id/notes - Lista note per submission
export const getNotesBySubmissionId = async (
  req: AuthenticatedRequest<UuidParam>,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await notesService.getNotesBySubmissionId(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// POST /submissions/:id/notes - Crea nuova nota
export const createNote = async (
  req: AuthenticatedRequest<UuidParam, AddNoteRequest>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.operator) {
      throw new Error("Operator information missing from request");
    }

    const result = await notesService.createNote(
      req.params.id,
      req.operator,
      req.body
    );
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

// PUT /submissions/:submissionId/notes/:noteId - Aggiorna nota
export const updateNote = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const operator = (req as any).operator;
    if (!operator) {
      throw new Error("Operator information missing from request");
    }

    // Estrai i parametri dalla URL manualmente
    const submissionId = req.params.submissionId;
    const noteId = req.params.noteId;
    
    const result = await notesService.updateNote(
      submissionId,
      noteId,
      operator,
      req.body as UpdateNoteRequest
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// DELETE /submissions/:submissionId/notes/:noteId - Elimina nota
export const deleteNote = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const operator = (req as any).operator;
    if (!operator) {
      throw new Error("Operator information missing from request");
    }

    // Estrai i parametri dalla URL manualmente
    const submissionId = req.params.submissionId;
    const noteId = req.params.noteId;

    await notesService.deleteNote(submissionId, noteId, operator);
    res.status(204).send(); // No content on successful deletion
  } catch (error) {
    next(error);
  }
};