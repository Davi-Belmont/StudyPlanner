import { disciplineRepository } from "../repositories/disciplineRepository";

export const disciplineService = {
  async create(data: {
    name: string;
    description?: string;
  }) {

    if (!data.name?.trim()) {
      throw new Error("O nome da disciplina é obrigatório.");
    }

    return disciplineRepository.create({
      name: data.name.trim(),
      description: data.description
    });
  },

  async findAll() {

    const disciplines = await disciplineRepository.findAll();

    return disciplines.map((discipline) => {
      const average =
        discipline.grades.length > 0
          ? discipline.grades.reduce(
              (sum, grade) => sum + grade.value,
              0
            ) / discipline.grades.length
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

  async findById(id: string) {
    const discipline = await disciplineRepository.findById(id);

    if (!discipline) {
      throw new Error("Disciplina não encontrada.");
    }

    return discipline;
  },

  async update(
    id: string,
    data: {
      name?: string;
      description?: string | null;
    }
  ) {
    await this.findById(id);

    if (data.name !== undefined && !data.name.trim()) {
      throw new Error("O nome da disciplina não pode ser vazio.");
    }

    return disciplineRepository.update(id, {
      ...data,
      name: data.name?.trim()
    });
  },

  async delete(id: string) {
    await this.findById(id);

    return disciplineRepository.delete(id);
  }
};