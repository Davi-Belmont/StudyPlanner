// Tipos espelhando os modelos do Prisma / respostas da API (datas chegam como string ISO).

export type ActivityType = "TASK" | "EXAM" | "ASSIGNMENT";
export type ActivityStatus = "PENDING" | "COMPLETED";

export interface Discipline {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
}

export interface Activity {
  id: string;
  title: string;
  description: string | null;
  type: ActivityType;
  status: ActivityStatus;
  dueDate: string;
  disciplineId: string;
  createdAt: string;
}

export interface ActivityWithDiscipline extends Activity {
  discipline: Discipline;
}

export interface Grade {
  id: string;
  value: number;
  description: string | null;
  date: string;
  disciplineId: string;
}

// GET /disciplines
export interface DisciplineSummary extends Discipline {
  average: number | null;
}

// GET /disciplines/:id
export interface DisciplineDetail extends Discipline {
  activities: Activity[];
  grades: Grade[];
}

// GET /dashboard
export interface DisciplineAverage {
  disciplineId: string;
  disciplineName: string;
  average: number | null;
}

export interface Dashboard {
  disciplineCount: number;
  pendingActivities: number;
  upcomingActivities: ActivityWithDiscipline[];
  averages: DisciplineAverage[];
}

// GET /me
export interface Usuario {
  id: string;
  nome: string;
  email: string;
  createdAt: string;
}

// Corpos de requisição
export interface DisciplineInput {
  name: string;
  description?: string | null;
}

export interface ActivityInput {
  title: string;
  description?: string | null;
  type: ActivityType;
  status?: ActivityStatus;
  dueDate: string; // ISO
  disciplineId: string;
}

export interface GradeInput {
  value: number;
  description?: string | null;
  date?: string; // ISO
  disciplineId: string;
}

export interface ActivityFilters {
  disciplineId?: string;
  status?: ActivityStatus;
  type?: ActivityType;
  from?: string;
  to?: string;
}

// Opção simples para <select> de disciplinas
export type DisciplineOption = Pick<Discipline, "id" | "name">;
