import prisma from "../config/prisma";
import { ActivityStatus, ActivityType, Prisma } from "@prisma/client";

interface ActivityFilters {
  disciplineId?: string;
  status?: ActivityStatus;
  type?: ActivityType;
  from?: Date;
  to?: Date;
}

export const activityRepository = {
  create(data: Prisma.ActivityUncheckedCreateInput) {
    return prisma.activity.create({ data });
  },

  findAll(userId: string, filters: ActivityFilters = {}) {
    return prisma.activity.findMany({
      where: {
        discipline: { userId },
        disciplineId: filters.disciplineId,
        status: filters.status,
        type: filters.type,
        dueDate: {
          gte: filters.from,
          lte: filters.to
        }
      },
      include: { discipline: true },
      orderBy: { dueDate: "asc" }
    });
  },

  // Só devolve se a atividade pertencer a uma disciplina do usuário
  findById(id: string, userId: string) {
    return prisma.activity.findFirst({
      where: { id, discipline: { userId } }
    });
  },

  // update/delete só são chamados depois de findById(id, userId) no service
  update(id: string, data: Prisma.ActivityUncheckedUpdateInput) {
    return prisma.activity.update({
      where: { id },
      data
    });
  },

  delete(id: string) {
    return prisma.activity.delete({
      where: { id }
    });
  },

  countPending(userId: string) {
    return prisma.activity.count({
      where: { status: "PENDING", discipline: { userId } }
    });
  },

  // Pendentes por data de entrega. Inclui atrasadas (aparecem primeiro).
  findUpcoming(userId: string) {
    return prisma.activity.findMany({
      where: {
        status: "PENDING",
        discipline: { userId }
      },
      include: { discipline: true },
      orderBy: { dueDate: "asc" },
      take: 5
    });
  }
};