import { Request, Response } from "express";
import { gradeService } from "../services/gradeService";

export const gradeController = {
  async create(req: Request, res: Response) {
    const grade = await gradeService.create(req.body);

    return res.status(201).json(grade);
  },

  async findAll(req: Request, res: Response) {
    const disciplineId = req.query.disciplineId as string | undefined;

    const grades = await gradeService.findAll(disciplineId);

    return res.json(grades);
  },

  async update(req: Request, res: Response) {
    const grade = await gradeService.update(
      req.params.id,
      req.body
    );

    return res.json(grade);
  },

  async delete(req: Request, res: Response) {
    await gradeService.delete(req.params.id);

    return res.status(204).send();
  }
};