import { NextFunction, Request, Response } from "express";
import { authService } from "../services/authService";
import { AppError } from "../utils/AppError";

// Exige "Authorization: Bearer <token>" e guarda o id do usuário em res.locals.userId
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    throw new AppError("Token não informado.", 401);
  }

  let userId: string;

  try {
    userId = authService.verifyToken(header.slice(7));
  } catch {
    throw new AppError("Token inválido ou expirado.", 401);
  }

  res.locals.userId = userId;
  next();
}
