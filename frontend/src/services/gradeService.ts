import type { Grade, GradeInput } from "../types/api";
import { http } from "./http";

export const gradeService = {
  create: (data: GradeInput) => http.post<Grade>("/grades", data),
  update: (id: string, data: Partial<GradeInput>) => http.put<Grade>(`/grades/${id}`, data),
  remove: (id: string) => http.delete(`/grades/${id}`)
};
