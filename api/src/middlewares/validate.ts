import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";
import { AppError } from "../utils/AppError";

// Valida o body com um schema Zod antes de chegar ao controller
export function validateBody(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      throw new AppError(result.error.issues[0].message, 400);
    }

    req.body = result.data;

    return next();
  };
}