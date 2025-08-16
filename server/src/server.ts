// src/server.ts
import dotenv from "dotenv";

// IMPORTANTE: Carica le variabili d'ambiente PRIMA di importare qualsiasi altro file
// che potrebbe dipendere da esse (come jwt.utils.ts o app.ts).
dotenv.config();

// Ora importa il resto dell'applicazione
import app from "./app";

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

// Gestione della chiusura pulita (opzionale ma consigliato)
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
  });
});
