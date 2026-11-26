import { Request, Response, NextFunction } from "express";
import { authService } from "../services/authService";
import { AppError } from "../utils/AppError";

// Exige o header:  Authorization: Bearer <token>
export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header) {
    throw new AppError("Token não informado.", 401);
  }

  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new AppError("Formato do token inválido. Use: Bearer <token>.", 401);
  }

  req.usuarioId = authService.verifyToken(token);

  return next();
}