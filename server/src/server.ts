import app from "./app";
import dotenv from "dotenv";

//Carica le variabili d'ambiente dal file .env
dotenv.config();

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log("Press CTRL-C to stop");
});

// Gestione della chiusura pulita del server (opzionale ma buona pratica)
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
  });
});
