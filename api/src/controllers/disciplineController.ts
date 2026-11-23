import { Request, Response } from "express";
import { disciplineService } from "../services/disciplineService";

export const disciplineController = {
  async create(req: Request, res: Response) {
    const discipline = await disciplineService.create(req.body);

    return res.status(201).json(discipline);
  },

  async findAll(req: Request, res: Response) {
    const disciplines = await disciplineService.findAll();

    return res.json(disciplines);
  },

  async findById(req: Request, res: Response) {
    const discipline = await disciplineService.findById(req.params.id);

    return res.json(discipline);
  },

  async update(req: Request, res: Response) {
    const discipline = await disciplineService.update(
      req.params.id,
      req.body
    );

    return res.json(discipline);
  },

  async delete(req: Request, res: Response) {
    await disciplineService.delete(req.params.id);

    return res.status(204).send();
  }
};