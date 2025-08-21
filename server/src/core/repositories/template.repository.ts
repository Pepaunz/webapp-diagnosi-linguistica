import { PrismaClient, Template } from "@prisma/client";
const prisma = new PrismaClient();

export const findActiveTemplateById = async (
  id: string
): Promise<Template | null> => {
  return prisma.template.findUnique({
    where: { template_id: id, is_active: true },
  });
};
