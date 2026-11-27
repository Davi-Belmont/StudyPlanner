import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { Prisma } from "@prisma/client";

import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";

import { AppError } from "./utils/AppError";
import { asyncHandler } from "./utils/asyncHandler";
import { authMiddleware } from "./middlewares/authMiddleware";
import { authController } from "./controllers/authController";

import authRoutes from "./routes/authRoutes";
import disciplineRoutes from "./routes/disciplineRoutes";
import activityRoutes from "./routes/activityRoutes";
import gradeRoutes from "./routes/gradeRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";

const app = express();

// CORS restrito às origens configuradas (padrão: Vite em desenvolvimento)
const allowedOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// Documentação Swagger
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get("/health", (req: Request, res: Response) => {
  return res.json({
    status: "ok",
    message: "StudyPlanner API funcionando"
  });
});

// Rotas públicas
app.use("/auth", authRoutes);

// Rotas protegidas (exigem token JWT)
app.get("/me", authMiddleware, asyncHandler(authController.me));
app.use("/disciplines", authMiddleware, disciplineRoutes);
app.use("/activities", authMiddleware, activityRoutes);
app.use("/grades", authMiddleware, gradeRoutes);
app.use("/dashboard", authMiddleware, dashboardRoutes);

// Rota inexistente
app.use((req: Request, res: Response) => {
  return res.status(404).json({ error: "Rota não encontrada." });
});

// Tratamento centralizado de erros (precisa dos 4 parâmetros)
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // JSON malformado no body
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({ error: "JSON inválido." });
  }

  // Registro não encontrado no Prisma (update/delete)
  if (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === "P2025"
  ) {
    return res.status(404).json({ error: "Registro não encontrado." });
  }

  console.error(err);
  return res.status(500).json({ error: "Erro interno do servidor." });
});

export default app;
