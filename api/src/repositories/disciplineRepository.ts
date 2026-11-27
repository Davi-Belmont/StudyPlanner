import prisma from "../config/prisma";

export const disciplineRepository = {
  create(
    userId: string,
    data: {
      name: string;
      description?: string | null;
    }
  ) {
    return prisma.discipline.create({ data: { ...data, userId } });
  },

  findAll(userId: string) {
    return prisma.discipline.findMany({
      where: { userId },
      include: { grades: true },
      orderBy: { createdAt: "desc" }
    });
  },

  // Só devolve se a disciplina for do usuário
  findById(id: string, userId: string) {
    return prisma.discipline.findFirst({
      where: { id, userId },
      include: {
        activities: true,
        grades: true
      }
    });
  },

  // update/delete só são chamados depois de findById(id, userId) no service
  update(
    id: string,
    data: {
      name?: string;
      description?: string | null;
    }
  ) {
    return prisma.discipline.update({
      where: { id },
      data
    });
  },

  delete(id: string) {
    return prisma.discipline.delete({
      where: { id }
    });
  },

  count(userId: string) {
    return prisma.discipline.count({ where: { userId } });
  }
};