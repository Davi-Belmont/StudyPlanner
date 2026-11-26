import type { Dashboard } from "../types/api";
import { http } from "./http";

export const dashboardService = {
  get: () => http.get<Dashboard>("/dashboard")
};
