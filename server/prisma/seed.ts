// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt"; // Importiamo direttamente 'hash' da bcrypt

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

  // Aggiungi qui altri dati di seed se necessario...

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
