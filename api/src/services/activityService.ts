import { ActivityStatus, ActivityType, Prisma } from "@prisma/client";
import { activityRepository } from "../repositories/activityRepository";
import { disciplineRepository } from "../repositories/disciplineRepository";
import { AppError } from "../utils/AppError";
import { isValidDate, optionalText, requiredText } from "../utils/validators";

interface ActivityData {
  title?: unknown;
  description?: unknown;
  type?: unknown;
  status?: unknown;
  dueDate?: unknown;
  disciplineId?: unknown;
}

function isActivityType(value: unknown): value is ActivityType {
  return Object.values(ActivityType).includes(value as ActivityType);
}

function isActivityStatus(value: unknown): value is ActivityStatus {
  return Object.values(ActivityStatus).includes(value as ActivityStatus);
}

// A disciplina precisa existir E ser do usuário
async function assertDisciplineOwned(disciplineId: string, userId: string) {
  const discipline = await disciplineRepository.findById(disciplineId, userId);

  if (!discipline) {
    throw new AppError("Disciplina não encontrada.", 404);
  }
}

export const activityService = {
  async create(userId: string, data: ActivityData) {
    const title = requiredText(data.title, "O título da atividade é obrigatório.");
    const description = optionalText(data.description, "A descrição");

    if (!isValidDate(data.dueDate)) {
      throw new AppError("Data da atividade inválida.");
    }

    if (!isActivityType(data.type)) {
      throw new AppError("Tipo de atividade inválido.");
    }

    let status: ActivityStatus | undefined;

    if (data.status !== undefined) {
      if (!isActivityStatus(data.status)) {
        throw new AppError("Status de atividade inválido.");
      }
      status = data.status;
    }

    if (typeof data.disciplineId !== "string" || !data.disciplineId) {
      throw new AppError("A disciplina é obrigatória.");
    }

    await assertDisciplineOwned(data.disciplineId, userId);

    return activityRepository.create({
      title,
      description,
      type: data.type,
      status,
      dueDate: new Date(data.dueDate),
      disciplineId: data.disciplineId
    });
  },

  async findAll(
    userId: string,
    filters: {
      disciplineId?: string;
      status?: string;
      type?: string;
      from?: string;
      to?: string;
    }
  ) {
    if (filters.status && !isActivityStatus(filters.status)) {
      throw new AppError("Status de atividade inválido.");
    }

    if (filters.type && !isActivityType(filters.type)) {
      throw new AppError("Tipo de atividade inválido.");
    }

    if (filters.from && !isValidDate(filters.from)) {
      throw new AppError("Data inicial inválida.");
    }

    if (filters.to && !isValidDate(filters.to)) {
      throw new AppError("Data final inválida.");
    }

    const from = filters.from ? new Date(filters.from) : undefined;
    const to = filters.to ? new Date(filters.to) : undefined;

    if (from && to && from > to) {
      throw new AppError("A data inicial não pode ser posterior à data final.");
    }

    return activityRepository.findAll(userId, {
      disciplineId: filters.disciplineId,
      status: filters.status as ActivityStatus | undefined,
      type: filters.type as ActivityType | undefined,
      from,
      to
    });
  },

  async update(id: string, userId: string, data: ActivityData) {
    const existing = await activityRepository.findById(id, userId);

    if (!existing) {
      throw new AppError("Atividade não encontrada.", 404);
    }

    const payload: Prisma.ActivityUncheckedUpdateInput = {};

    if (data.title !== undefined) {
      payload.title = requiredText(data.title, "O título não pode ser vazio.");
    }

    const description = optionalText(data.description, "A descrição");
    if (description !== undefined) payload.description = description;

    if (data.dueDate !== undefined) {
      if (!isValidDate(data.dueDate)) {
        throw new AppError("Data da atividade inválida.");
      }
      payload.dueDate = new Date(data.dueDate);
    }

    if (data.type !== undefined) {
      if (!isActivityType(data.type)) {
        throw new AppError("Tipo de atividade inválido.");
      }
      payload.type = data.type;
    }

    if (data.status !== undefined) {
      if (!isActivityStatus(data.status)) {
        throw new AppError("Status de atividade inválido.");
      }
      payload.status = data.status;
    }

    if (data.disciplineId !== undefined) {
      if (typeof data.disciplineId !== "string" || !data.disciplineId) {
        throw new AppError("A disciplina é inválida.");
      }
      // Impede mover a atividade para a disciplina de outro usuário
      await assertDisciplineOwned(data.disciplineId, userId);
      payload.disciplineId = data.disciplineId;
    }

    return activityRepository.update(id, payload);
  },

  async delete(id: string, userId: string) {
    const existing = await activityRepository.findById(id, userId);

    if (!existing) {
      throw new AppError("Atividade não encontrada.", 404);
    }

    return activityRepository.delete(id);
  }
};