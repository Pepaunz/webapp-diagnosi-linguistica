// src/core/services/template.service.ts
import * as templateRepo from "../repositories/template.repository";
import { ApiError } from "../../api/middlewares/errorHandler.middleware";
import { 
  ListTemplatesQuery, 
  CreateTemplateInput, 
  UpdateTemplateInput 
} from "../../api/validators/template.validator";
import { Template as PrismaTemplate } from "@prisma/client";

// GET /templates - Lista template con filtri
export const getTemplates = async (
  query: ListTemplatesQuery
): Promise<{
  templates: PrismaTemplate[];
  total: number;
  pagination: {
    limit: number;
    offset: number;
    has_more: boolean;
  };
}> => {
  const { templates, total } = await templateRepo.findAllTemplatesWithFilters(query);

  const hasMore = query.offset + query.limit < total;

  return {
    templates,
    total,
    pagination: {
      limit: query.limit,
      offset: query.offset,
      has_more: hasMore,
    },
  };
};

// GET /templates/{id} - Dettagli singolo template  
export const getTemplateById = async (
  template_id: string
): Promise<PrismaTemplate> => {
  const template = await templateRepo.findTemplateById(template_id);
  
  if (!template) {
    throw new ApiError(404, "Template not found");
  }

  return template;
};

// POST /templates - Crea nuovo template (solo admin)
export const createTemplate = async (
  data: CreateTemplateInput
): Promise<PrismaTemplate> => {
  try {
    return await templateRepo.createTemplate(data);
  } catch (error: any) {
    // Gestisce errore di nome duplicato (constraint unique)
    if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
      throw new ApiError(409, "Template name already exists");
    }
    throw error;
  }
};

// PUT /templates/{id} - Aggiornamento completo (solo admin)
export const updateTemplateComplete = async (
  template_id: string,
  data: CreateTemplateInput
): Promise<PrismaTemplate> => {
  // Verifica che il template esista
  const existingTemplate = await templateRepo.findTemplateById(template_id);
  if (!existingTemplate) {
    throw new ApiError(404, "Template not found");
  }

  try {
    return await templateRepo.updateTemplateComplete(template_id, data);
  } catch (error: any) {
    // Gestisce errore di nome duplicato
    if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
      throw new ApiError(409, "Template name already exists");
    }
    throw error;
  }
};

// PATCH /templates/{id} - Aggiornamento parziale (operator + admin)
export const updateTemplatePartial = async (
  template_id: string,
  data: UpdateTemplateInput
): Promise<PrismaTemplate> => {
  // Verifica che il template esista
  const existingTemplate = await templateRepo.findTemplateById(template_id);
  if (!existingTemplate) {
    throw new ApiError(404, "Template not found");
  }

  try {
    return await templateRepo.updateTemplatePartial(template_id, data);
  } catch (error: any) {
    // Gestisce errore di nome duplicato se viene aggiornato il nome
    if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
      throw new ApiError(409, "Template name already exists");
    }
    throw error;
  }
};

// DELETE /templates/{id} - Hard delete (solo admin, con controlli)
export const deleteTemplate = async (
  template_id: string
): Promise<void> => {
  // 1. Verifica che il template esista
  const template = await templateRepo.findTemplateById(template_id);
  if (!template) {
    throw new ApiError(404, "Template not found");
  }

  // 2. Verifica che non ci siano submission associate
  const submissionCount = await templateRepo.countSubmissionsByTemplateId(template_id);
  if (submissionCount > 0) {
    throw new ApiError(
      400, 
      `Cannot delete template with associated submissions. Found ${submissionCount} linked submissions.`
    );
  }

  // 3. Procedi con l'eliminazione fisica
  await templateRepo.deleteTemplate(template_id);
};