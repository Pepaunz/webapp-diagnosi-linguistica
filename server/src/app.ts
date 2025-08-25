// src/app.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { globalErrorHandler } from "./api/middlewares/errorHandler.middleware";

const app = express();

// 1. Middleware Essenziali
// Abilita CORS (Cross-Origin Resource Sharing)
// In sviluppo, una configurazione base va bene. Per la produzione, dovresti specificare l'origine del tuo frontend.

app.use(helmet()); // Sicurezza headers HTTP
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true, // Se usi cookies per auth
  })
);

// Rate limiting globale
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: 100, // max 100 richieste per IP ogni 15 min
  message: {
    status_code: 429,
    error: "TooManyRequests",
    message: "Too many requests from this IP, please try again later.",
    timestamp: new Date().toISOString(),
  },
});
app.use(limiter);

app.use(express.json());

//per form html
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "UP", timestamp: new Date().toISOString() });
});

// Qui verranno importate e usate le rotte definite in seguito (es. auth, templates, submissions)
// Esempio:
import authRoutes from "./api/routes/auth.routes";
import submissionRoutes from "./api/routes/submission.routes";
import templateRoutes from "./api/routes/template.routes";
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/submissions", submissionRoutes);
app.use("/api/v1/templates", templateRoutes);
// test err 404

app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// Placeholder per il Middleware di Gestione Errori
// Questo middleware DEVE essere l'ultimo ad essere registrato
// Esempio:
app.use(globalErrorHandler);

export default app;
