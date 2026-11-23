import { gradeRepository } from "../repositories/gradeRepository";
import { disciplineRepository } from "../repositories/disciplineRepository";
import { AppError } from "../utils/AppError";

interface GradeData {
  value: number;
  description?: string;
  date?: string;
  disciplineId: string;
}

function isValidGrade(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= 10
  );
}

export const gradeService = {
  async create(data: GradeData) {
    if (!isValidGrade(data.value)) {
      throw new AppError("A nota deve estar entre 0 e 10.");
    }

    if (!data.disciplineId) {
      throw new AppError("A disciplina é obrigatória.");
    }

    const discipline = await disciplineRepository.findById(
      data.disciplineId
    );

    if (!discipline) {
      throw new AppError("Disciplina não encontrada.", 404);
    }

    if (data.date && isNaN(Date.parse(data.date))) {
      throw new AppError("Data da nota inválida.");
    }

    return gradeRepository.create({
      value: data.value,
      description: data.description,
      date: data.date ? new Date(data.date) : undefined,
      disciplineId: data.disciplineId
    });
  },

  async findAll(disciplineId?: string) {
    return gradeRepository.findAll(disciplineId);
  },

  async update(
    id: string,
    data: {
      value?: number;
      description?: string | null;
      date?: string;
      disciplineId?: string;
    }
  ) {
    const existing = await gradeRepository.findById(id);

    if (!existing) {
      throw new AppError("Nota não encontrada.", 404);
    }

    if (data.value !== undefined && !isValidGrade(data.value)) {
      throw new AppError("A nota deve estar entre 0 e 10.");
    }

    if (data.date && isNaN(Date.parse(data.date))) {
      throw new AppError("Data da nota inválida.");
    }

    if (data.disciplineId) {
      const discipline = await disciplineRepository.findById(
        data.disciplineId
      );

      if (!discipline) {
        throw new AppError("Disciplina não encontrada.", 404);
      }
    }

    return gradeRepository.update(id, {
      ...data,
      date: data.date ? new Date(data.date) : undefined
    });
  },

  async delete(id: string) {
    const existing = await gradeRepository.findById(id);

    if (!existing) {
      throw new AppError("Nota não encontrada.", 404);
    }

    return gradeRepository.delete(id);
  }
};