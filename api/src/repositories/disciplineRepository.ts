import prisma from "../config/prisma";

export const disciplineRepository = {
  create(data: {
    name: string;
    description?: string;
  }) {
    return prisma.discipline.create({ data });
  },

  findAll() {
    return prisma.discipline.findMany({
      include: { grades: true },
      orderBy: { createdAt: "desc" }
    });
  },

  findById(id: string) {
    return prisma.discipline.findUnique({
      where: { id },
      include: {
        activities: true,
        grades: true
      }
    });
  },

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

  count() {
    return prisma.discipline.count();
  }
};