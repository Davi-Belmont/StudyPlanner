import prisma from "../config/prisma";

export const gradeRepository = {
  create(data: {
    value: number;
    description?: string;
    date?: Date;
    disciplineId: string;
  }) {
    return prisma.grade.create({ data });
  },

  findAll(disciplineId?: string) {
    return prisma.grade.findMany({
      where: { disciplineId },
      include: { discipline: true },
      orderBy: { date: "desc" }
    });
  },

  findById(id: string) {
    return prisma.grade.findUnique({
      where: { id }
    });
  },

  update(
    id: string,
    data: {
      value?: number;
      description?: string | null;
      date?: Date;
      disciplineId?: string;
    }
  ) {
    return prisma.grade.update({
      where: { id },
      data
    });
  },

  delete(id: string) {
    return prisma.grade.delete({
      where: { id }
    });
  }
};