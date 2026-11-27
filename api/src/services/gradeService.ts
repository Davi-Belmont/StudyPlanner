import { gradeRepository } from "../repositories/gradeRepository";
import { disciplineRepository } from "../repositories/disciplineRepository";
import { AppError } from "../utils/AppError";
import { isValidDate, optionalText } from "../utils/validators";

interface GradeData {
  value?: unknown;
  description?: unknown;
  date?: unknown;
  disciplineId?: unknown;
}

function isValidGrade(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= 10
  );
}

// A disciplina precisa existir E ser do usuário
async function assertDisciplineOwned(disciplineId: string, userId: string) {
  const discipline = await disciplineRepository.findById(disciplineId, userId);

  if (!discipline) {
    throw new AppError("Disciplina não encontrada.", 404);
  }
}

export const gradeService = {
  async create(userId: string, data: GradeData) {
    if (!isValidGrade(data.value)) {
      throw new AppError("A nota deve estar entre 0 e 10.");
    }

    if (typeof data.disciplineId !== "string" || !data.disciplineId) {
      throw new AppError("A disciplina é obrigatória.");
    }

    let date: Date | undefined;

    if (data.date !== undefined) {
      if (!isValidDate(data.date)) {
        throw new AppError("Data da nota inválida.");
      }
      date = new Date(data.date);
    }

    const description = optionalText(data.description, "A descrição");

    await assertDisciplineOwned(data.disciplineId, userId);

    return gradeRepository.create({
      value: data.value,
      description,
      date,
      disciplineId: data.disciplineId
    });
  },

  async findAll(userId: string, disciplineId?: string) {
    return gradeRepository.findAll(userId, disciplineId);
  },

  async update(id: string, userId: string, data: GradeData) {
    const existing = await gradeRepository.findById(id, userId);

    if (!existing) {
      throw new AppError("Nota não encontrada.", 404);
    }

    const payload: {
      value?: number;
      description?: string | null;
      date?: Date;
      disciplineId?: string;
    } = {};

    if (data.value !== undefined) {
      if (!isValidGrade(data.value)) {
        throw new AppError("A nota deve estar entre 0 e 10.");
      }
      payload.value = data.value;
    }

    if (data.date !== undefined) {
      if (!isValidDate(data.date)) {
        throw new AppError("Data da nota inválida.");
      }
      payload.date = new Date(data.date);
    }

    const description = optionalText(data.description, "A descrição");
    if (description !== undefined) payload.description = description;

    if (data.disciplineId !== undefined) {
      if (typeof data.disciplineId !== "string" || !data.disciplineId) {
        throw new AppError("A disciplina é inválida.");
      }
      // Impede mover a nota para a disciplina de outro usuário
      await assertDisciplineOwned(data.disciplineId, userId);
      payload.disciplineId = data.disciplineId;
    }

    return gradeRepository.update(id, payload);
  },

  async delete(id: string, userId: string) {
    const existing = await gradeRepository.findById(id, userId);

    if (!existing) {
      throw new AppError("Nota não encontrada.", 404);
    }

    return gradeRepository.delete(id);
  }
};