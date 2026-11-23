import { Request, Response } from "express";
import { dashboardService } from "../services/dashboardService";

export const dashboardController = {
  async getDashboard(req: Request, res: Response) {
    const dashboard = await dashboardService.getDashboard();

    return res.json(dashboard);
  }
};