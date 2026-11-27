import prisma from "../config/prisma";

export const userRepository = {
  create(data: { nome: string; email: string; senhaHash: string }) {
    return prisma.user.create({ data });
  },

  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }
};
