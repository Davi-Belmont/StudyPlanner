import { Request, Response } from "express";
import { activityService } from "../services/activityService";

export const activityController = {
  async create(req: Request, res: Response) {
    const userId = res.locals.userId as string;
    const activity = await activityService.create(userId, req.body ?? {});

    return res.status(201).json(activity);
  },

  async findAll(req: Request, res: Response) {
    const userId = res.locals.userId as string;

    const filters = {
      disciplineId: req.query.disciplineId as string | undefined,
      status: req.query.status as string | undefined,
      type: req.query.type as string | undefined,
      from: req.query.from as string | undefined,
      to: req.query.to as string | undefined
    };

    const activities = await activityService.findAll(userId, filters);

    return res.json(activities);
  },

  async update(req: Request, res: Response) {
    const userId = res.locals.userId as string;
    const activity = await activityService.update(
      req.params.id,
      userId,
      req.body ?? {}
    );

    return res.json(activity);
  },

  async delete(req: Request, res: Response) {
    const userId = res.locals.userId as string;
    await activityService.delete(req.params.id, userId);

    return res.status(204).send();
  }
};