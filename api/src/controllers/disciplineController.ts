import { Request, Response } from "express";
import { disciplineService } from "../services/disciplineService";

export const disciplineController = {
  async create(req: Request, res: Response) {
    const userId = res.locals.userId as string;
    const discipline = await disciplineService.create(userId, req.body ?? {});

    return res.status(201).json(discipline);
  },

  async findAll(req: Request, res: Response) {
    const userId = res.locals.userId as string;
    const disciplines = await disciplineService.findAll(userId);

    return res.json(disciplines);
  },

  async findById(req: Request, res: Response) {
    const userId = res.locals.userId as string;
    const discipline = await disciplineService.findById(req.params.id, userId);

    return res.json(discipline);
  },

  async update(req: Request, res: Response) {
    const userId = res.locals.userId as string;
    const discipline = await disciplineService.update(
      req.params.id,
      userId,
      req.body ?? {}
    );

    return res.json(discipline);
  },

  async delete(req: Request, res: Response) {
    const userId = res.locals.userId as string;
    await disciplineService.delete(req.params.id, userId);

    return res.status(204).send();
  }
};