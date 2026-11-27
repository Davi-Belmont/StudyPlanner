import type { Grade, GradeInput } from "../types/api";
import { http } from "./http";

// GET /grades devolve cada nota com a disciplina incluída
export type GradeWithDiscipline = Grade & {
  discipline?: { id: string; name: string };
};

export const gradeService = {
  list: (disciplineId?: string) =>
    http.get<GradeWithDiscipline[]>("/grades", { disciplineId }),
  create: (data: GradeInput) => http.post<Grade>("/grades", data),
  update: (id: string, data: Partial<GradeInput>) => http.put<Grade>(`/grades/${id}`, data),
  remove: (id: string) => http.delete(`/grades/${id}`)
};
