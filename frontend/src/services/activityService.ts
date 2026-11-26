import type {
  Activity,
  ActivityFilters,
  ActivityInput,
  ActivityWithDiscipline
} from "../types/api";
import { http } from "./http";

export const activityService = {
  list: (filters: ActivityFilters = {}) =>
    http.get<ActivityWithDiscipline[]>("/activities", { ...filters }),
  create: (data: ActivityInput) => http.post<Activity>("/activities", data),
  update: (id: string, data: Partial<ActivityInput>) =>
    http.put<Activity>(`/activities/${id}`, data),
  remove: (id: string) => http.delete(`/activities/${id}`)
};
