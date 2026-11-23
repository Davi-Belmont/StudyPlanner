import { ActivityStatus, ActivityType } from "@prisma/client";
import { activityRepository } from "../repositories/activityRepository";
import { disciplineRepository } from "../repositories/disciplineRepository";

interface ActivityData {
  title: string;
  description?: string;
  type: ActivityType;
  status?: ActivityStatus;
  dueDate: string;
  disciplineId: string;
}

export const activityService = {
  async create(data: ActivityData) {
    if (!data.title?.trim()) {
      throw new Error("O título da atividade é obrigatório.");
    }

    if (!data.dueDate || isNaN(Date.parse(data.dueDate))) {
      throw new Error("Data da atividade inválida.");
    }

    const discipline = await disciplineRepository.findById(
      data.disciplineId
    );

    if (!discipline) {
      throw new Error("Disciplina não encontrada.");
    }

    return activityRepository.create({
      title: data.title.trim(),
      description: data.description,
      type: data.type,
      dueDate: new Date(data.dueDate),
      disciplineId: data.disciplineId
    });
  },

  async findAll(filters: {
    disciplineId?: string;
    status?: string;
    type?: string;
    from?: string;
    to?: string;
    
  }) {
    const validStatuses = Object.values(ActivityStatus);
    const validTypes = Object.values(ActivityType);

    if (filters.status && !validStatuses.includes(filters.status as ActivityStatus)) {
      throw new Error("Status de atividade inválido.");
    }

    if (filters.type && !validTypes.includes(filters.type as ActivityType)) {
      throw new Error("Tipo de atividade inválido.");
    }

    if (filters.from && isNaN(Date.parse(filters.from))) {
      throw new Error("Data inicial inválida.");
    }

    if (filters.to && isNaN(Date.parse(filters.to))) {
      throw new Error("Data final inválida.");
    }

    const from = filters.from ? new Date(filters.from) : undefined;
    const to = filters.to ? new Date(filters.to) : undefined;

    if (from && to && from > to) {
      throw new Error("A data inicial não pode ser posterior à data final.");
    }

    return activityRepository.findAll({
      disciplineId: filters.disciplineId,
      status: filters.status as ActivityStatus | undefined,
      type: filters.type as ActivityType | undefined,
      from,
      to
    });
  },

  async update(
    id: string,
    data: {
      title?: string;
      description?: string | null;
      type?: ActivityType;
      status?: ActivityStatus;
      dueDate?: string;
      disciplineId?: string;
    }
  ) {
    const existing = await activityRepository.findById(id);

    if (!existing) {
      throw new Error("Atividade não encontrada.");
    }

    if (data.title !== undefined && !data.title.trim()) {
      throw new Error("O título não pode ser vazio.");
    }

    if (data.dueDate && isNaN(Date.parse(data.dueDate))) {
      throw new Error("Data da atividade inválida.");
    }

    if (data.disciplineId) {
      const discipline = await disciplineRepository.findById(
        data.disciplineId
      );

      if (!discipline) {
        throw new Error("Disciplina não encontrada.");
      }
    }

    return activityRepository.update(id, {
      ...data,
      title: data.title?.trim(),
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined
    });
  },

  async delete(id: string) {
    const existing = await activityRepository.findById(id);

    if (!existing) {
      throw new Error("Atividade não encontrada.");
    }

    return activityRepository.delete(id);
  }
};