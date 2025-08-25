import { ListTemplatesQuery, CreateTemplateInput, UpdateTemplateInput } from "../../api/validators/template.validator";
import { PrismaClient, Template, Prisma } from "@prisma/client";
const prisma = new PrismaClient();

export const findActiveTemplateById = async (
  id: string
): Promise<Template | null> => {
  return prisma.template.findUnique({
    where: { template_id: id, is_active: true },
  });
};

export const findTemplateById = async (
  id: string
): Promise<Template | null> => {
  return prisma.template.findUnique({
    where: { template_id: id },
  });
};

// GET /templates - Lista con filtri e paginazione
export const findAllTemplatesWithFilters = async (
  query: ListTemplatesQuery
): Promise<{
  templates: Template[];
  total: number;
}> => {
  // Costruisce il filtro WHERE dinamicamente
  const whereClause: Prisma.TemplateWhereInput = {};

  if (query.active_only) {
    whereClause.is_active = true;
  }

  // Costruisce l'ordinamento dinamico
  let orderBy: Prisma.TemplateOrderByWithRelationInput = { updated_at: "desc" };
  
  if (query.sort_by) {
    switch (query.sort_by) {
      case "name":
        orderBy = { name: query.sort_order };
        break;
      case "created_at":
        orderBy = { created_at: query.sort_order };
        break;
      case "updated_at":
        orderBy = { updated_at: query.sort_order };
        break;
      default:
        orderBy = { updated_at: "desc" };
    }
  }

  // Esegue le query in parallelo per ottimizzare le performance
  const [templates, total] = await Promise.all([
    prisma.template.findMany({
      where: whereClause,
      orderBy,
      skip: query.offset,
      take: query.limit,
    }),
    prisma.template.count({
      where: whereClause,
    }),
  ]);

  return { templates, total };
};

// POST /templates - Crea nuovo template
export const createTemplate = async (
  data: CreateTemplateInput
): Promise<Template> => {
  return prisma.template.create({
    data: {
      name: data.name,
      description: data.description,
      structure_definition: data.structure_definition as Prisma.InputJsonValue,
      is_active: data.is_active,
      available_languages: data.available_languages,
    },
  });
};

// PUT /templates/{id} - Aggiornamento completo
export const updateTemplateComplete = async (
  id: string,
  data: CreateTemplateInput
): Promise<Template> => {
  return prisma.template.update({
    where: { template_id: id },
    data: {
      name: data.name,
      description: data.description,
      structure_definition: data.structure_definition as Prisma.InputJsonValue,
      is_active: data.is_active,
      available_languages: data.available_languages,
      updated_at: new Date(),
    },
  });
};

// PATCH /templates/{id} - Aggiornamento parziale
export const updateTemplatePartial = async (
  id: string,
  data: UpdateTemplateInput
): Promise<Template> => {
  // Costruisce i dati da aggiornare dinamicamente
  const updateData: any = {
    updated_at: new Date(),
  };

  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.structure_definition !== undefined) {
    updateData.structure_definition = data.structure_definition as Prisma.InputJsonValue;
  }
  if (data.is_active !== undefined) updateData.is_active = data.is_active;
  if (data.available_languages !== undefined) {
    updateData.available_languages = data.available_languages;
  }

  return prisma.template.update({
    where: { template_id: id },
    data: updateData,
  });
};

// DELETE /templates/{id} - Hard delete (solo se nessuna submission associata)
export const deleteTemplate = async (id: string): Promise<void> => {
  await prisma.template.delete({
    where: { template_id: id },
  });
};

// Conta submission associate a un template
export const countSubmissionsByTemplateId = async (
  template_id: string
): Promise<number> => {
  return prisma.submission.count({
    where: { template_id },
  });
};