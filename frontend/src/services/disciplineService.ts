import type {
  Discipline,
  DisciplineDetail,
  DisciplineInput,
  DisciplineSummary
} from "../types/api";
import { http } from "./http";

export const disciplineService = {
  list: () => http.get<DisciplineSummary[]>("/disciplines"),
  get: (id: string) => http.get<DisciplineDetail>(`/disciplines/${id}`),
  create: (data: DisciplineInput) => http.post<Discipline>("/disciplines", data),
  update: (id: string, data: Partial<DisciplineInput>) =>
    http.put<Discipline>(`/disciplines/${id}`, data),
  remove: (id: string) => http.delete(`/disciplines/${id}`)
};
