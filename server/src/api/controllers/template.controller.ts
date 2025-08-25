// src/api/controllers/template.controller.ts
import { Request, Response, NextFunction } from "express";
import { 
  CreateTemplateInput,
  UpdateTemplateInput,
  ListTemplatesQuery,
  TemplateParams
} from "../validators/template.validator";
import { UuidParam } from "../validators";
import * as templateService from "../../core/services/template.service";

// GET /templates - Lista template con filtri
export const getTemplates = async (
  req: Request<{},{},{},any>,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = req.query as ListTemplatesQuery;
    const result = await templateService.getTemplates(query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// GET /templates/:id - Dettagli singolo template
export const getTemplateById = async (
  req: Request<UuidParam>,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await templateService.getTemplateById(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// POST /templates - Crea nuovo template (solo admin)
export const createTemplate = async (
  req: Request<{}, {}, CreateTemplateInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await templateService.createTemplate(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

// PUT /templates/:id - Aggiornamento completo (solo admin)
export const updateTemplateComplete = async (
  req: Request<UuidParam, {}, CreateTemplateInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await templateService.updateTemplateComplete(req.params.id, req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// PATCH /templates/:id - Aggiornamento parziale (operator + admin)
export const updateTemplatePartial = async (
  req: Request<UuidParam, {}, UpdateTemplateInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await templateService.updateTemplatePartial(req.params.id, req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// DELETE /templates/:id - Hard delete (solo admin)
export const deleteTemplate = async (
  req: Request<UuidParam>,
  res: Response,
  next: NextFunction
) => {
  try {
    await templateService.deleteTemplate(req.params.id);
    res.status(204).send(); // No content on successful deletion
  } catch (error) {
    next(error);
  }
};