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

  findAll(filters: ActivityFilters = {}) {
    return prisma.activity.findMany({
      where: {
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

  findById(id: string) {
    return prisma.activity.findUnique({
      where: { id }
    });
  },

  update(id: string, data: Prisma.ActivityUpdateInput) {
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

  countPending() {
    return prisma.activity.count({
      where: { status: "PENDING" }
    });
  },

  findUpcoming() {
    return prisma.activity.findMany({
      where: {
        status: "PENDING",
        dueDate: { gte: new Date() }
      },
      include: { discipline: true },
      orderBy: { dueDate: "asc" },
      take: 5
    });
  }
};