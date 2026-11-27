import { Request, Response } from "express";
import { gradeService } from "../services/gradeService";

export const gradeController = {
  async create(req: Request, res: Response) {
    const userId = res.locals.userId as string;
    const grade = await gradeService.create(userId, req.body ?? {});

    return res.status(201).json(grade);
  },

  async findAll(req: Request, res: Response) {
    const userId = res.locals.userId as string;
    const disciplineId = req.query.disciplineId as string | undefined;

    const grades = await gradeService.findAll(userId, disciplineId);

    return res.json(grades);
  },

  async update(req: Request, res: Response) {
    const userId = res.locals.userId as string;
    const grade = await gradeService.update(
      req.params.id,
      userId,
      req.body ?? {}
    );

    return res.json(grade);
  },

  async delete(req: Request, res: Response) {
    const userId = res.locals.userId as string;
    await gradeService.delete(req.params.id, userId);

    return res.status(204).send();
  }
};