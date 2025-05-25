import express, { Request, Response } from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3001; // Usa una porta diversa se il client React è su 3000

app.use(cors()); // Configurazione CORS base
app.use(express.json()); // Per parsare JSON body

app.get("/api/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "UP", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
