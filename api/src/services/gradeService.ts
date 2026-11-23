import { gradeRepository } from "../repositories/gradeRepository";
import { disciplineRepository } from "../repositories/disciplineRepository";

interface GradeData {
  value: number;
  description?: string;
  date?: string;
  disciplineId: string;
}

export const gradeService = {
  async create(data: GradeData) {
    if (
      typeof data.value !== "number" ||
      !Number.isFinite(data.value) ||
      data.value < 0 ||
      data.value > 10
    ) {
      throw new Error("A nota deve estar entre 0 e 10.");
    }

    if (!data.disciplineId) {
      throw new Error("A disciplina é obrigatória.");
    }

    const discipline = await disciplineRepository.findById(
      data.disciplineId
    );

    if (!discipline) {
      throw new Error("Disciplina não encontrada.");
    }

    if (data.date && isNaN(Date.parse(data.date))) {
      throw new Error("Data da nota inválida.");
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
      throw new Error("Nota não encontrada.");
    }

    if (
      data.value !== undefined &&
      (
        typeof data.value !== "number" ||
        !Number.isFinite(data.value) ||
        data.value < 0 ||
        data.value > 10
      )
    ) {
      throw new Error("A nota deve estar entre 0 e 10.");
    }

    if (data.date && isNaN(Date.parse(data.date))) {
      throw new Error("Data da nota inválida.");
    }

    if (data.disciplineId) {
      const discipline = await disciplineRepository.findById(
        data.disciplineId
      );

      if (!discipline) {
        throw new Error("Disciplina não encontrada.");
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
      throw new Error("Nota não encontrada.");
    }

    return gradeRepository.delete(id);
  }
};