import { Request, Response } from "express";
import { dashboardService } from "../services/dashboardService";

export const dashboardController = {
  async getDashboard(req: Request, res: Response) {
    const userId = res.locals.userId as string;
    const dashboard = await dashboardService.getDashboard(userId);

    return res.json(dashboard);
  }
};