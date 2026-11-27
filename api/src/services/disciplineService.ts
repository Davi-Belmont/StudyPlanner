import { disciplineRepository } from "../repositories/disciplineRepository";
import { AppError } from "../utils/AppError";
import { optionalText, requiredText } from "../utils/validators";

export const disciplineService = {
  async create(userId: string, data: { name?: unknown; description?: unknown }) {
    const name = requiredText(data.name, "O nome da disciplina é obrigatório.");
    const description = optionalText(data.description, "A descrição");

    return disciplineRepository.create(userId, { name, description });
  },

  async findAll(userId: string) {
    const disciplines = await disciplineRepository.findAll(userId);

    return disciplines.map((discipline) => {
      const average =
        discipline.grades.length > 0
          ? discipline.grades.reduce((sum, grade) => sum + grade.value, 0) /
            discipline.grades.length
          : null;

      return {
        id: discipline.id,
        name: discipline.name,
        description: discipline.description,
        createdAt: discipline.createdAt,
        average
      };
    });
  },

  async findById(id: string, userId: string) {
    const discipline = await disciplineRepository.findById(id, userId);

    // Disciplina de outro usuário também responde 404
    if (!discipline) {
      throw new AppError("Disciplina não encontrada.", 404);
    }

    return discipline;
  },

  async update(
    id: string,
    userId: string,
    data: { name?: unknown; description?: unknown }
  ) {
    await this.findById(id, userId);

    const payload: { name?: string; description?: string | null } = {};

    if (data.name !== undefined) {
      payload.name = requiredText(data.name, "O nome da disciplina não pode ser vazio.");
    }

    const description = optionalText(data.description, "A descrição");
    if (description !== undefined) payload.description = description;

    return disciplineRepository.update(id, payload);
  },

  async delete(id: string, userId: string) {
    await this.findById(id, userId);

    return disciplineRepository.delete(id);
  }
};