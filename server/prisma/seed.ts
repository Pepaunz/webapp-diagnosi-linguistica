// prisma/seed.ts
import { PrismaClient, Prisma} from "@prisma/client";
import { hash } from "bcrypt"; // Importiamo direttamente 'hash' da bcrypt
import {structureDefinitionSchema, QuestionnaireData} from '@bilinguismo/shared'
import {bilingualismQuestionnaireData} from '../mock-template' //IMPORTANTE: Sostituire con template iniziale (completo)

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // La logica di hashing è ora DENTRO lo script.
  // Assicurati che saltRounds sia lo stesso che usi nella tua app.
  const saltRounds = 10;
  const passwordAdmin = await hash("password123", saltRounds);
  const passwordOperator = await hash("password456", saltRounds);

  console.log("Passwords hashed successfully.");

  // Creiamo l'operatore admin
  const admin = await prisma.operator.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      password_hash: passwordAdmin,
      full_name: "Admin User",
      role: "admin",
    },
  });

  // Creiamo l'operatore standard
  const operator = await prisma.operator.upsert({
    where: { email: "operator@example.com" },
    update: {},
    create: {
      email: "operator@example.com",
      password_hash: passwordOperator,
      full_name: "Standard Operator",
      role: "operator",
    },
  });

  console.log(`Upserted admin user: ${admin.email}`);
  console.log(`Upserted operator user: ${operator.email}`);

  console.log('Seeding questionnaire templates...');
  
  const validatedStructure: QuestionnaireData = structureDefinitionSchema.parse(bilingualismQuestionnaireData);
  
  const template = await prisma.template.upsert({
    // Usiamo 'name' come chiave univoca per l'upsert
    where: { name: 'Questionario Bilinguismo Base' }, 
    // Se il template esiste già, non facciamo nulla (ma potremmo aggiornarlo se volessimo)
    update: {}, 
    // Se non esiste, lo creiamo
    create: {
      name: 'Questionario Bilinguismo Base',
      description: 'Questionario standard per la valutazione iniziale del bilinguismo.',
      // Inseriamo l'intero oggetto JSON del questionario qui
      structure_definition: validatedStructure,
      // Definiamo le lingue disponibili basandoci sulle chiavi dell'oggetto title
      available_languages: ['it', 'en', 'es', 'ar'], // Potresti derivarlo dinamicamente se vuoi
      is_active: true,
    },
  });

  console.log(`Upserted template: ${template.name} with ID: ${template.template_id}`);

  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("An error occurred during seeding:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
