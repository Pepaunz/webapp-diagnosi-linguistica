// src/core/repositories/operator.repository.ts
import { PrismaClient, Operator } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Trova un operatore nel database tramite il suo indirizzo email.
 * @param email L'email dell'operatore da cercare.
 * @returns Una promise che si risolve con l'oggetto Operator se trovato, altrimenti null.
 */
export const findOperatorByEmail = async (
  email: string
): Promise<Operator | null> => {
  return prisma.operator.findUnique({
    where: {
      email: email.toLowerCase(), // Cerca sempre l'email in minuscolo per consistenza
    },
  });
};

// export const createOperator = async (...) => { ... };
// export const findOperatorById = async (...) => { ... };
