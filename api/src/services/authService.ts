import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "@prisma/client";
import { userRepository } from "../repositories/userRepository";
import { AppError } from "../utils/AppError";
import { requiredText } from "../utils/validators";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

function getSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET não definido.");
  }

  return secret;
}

// Nunca devolve o hash da senha
function toPublicUser(user: User) {
  return {
    id: user.id,
    nome: user.nome,
    email: user.email,
    createdAt: user.createdAt
  };
}

function signToken(userId: string) {
  return jwt.sign({ sub: userId }, getSecret(), { expiresIn: "7d" });
}

export const authService = {
  async register(data: { nome?: unknown; email?: unknown; senha?: unknown }) {
    const nome = requiredText(data.nome, "O nome é obrigatório.", 120);

    if (typeof data.email !== "string" || !EMAIL_REGEX.test(data.email.trim())) {
      throw new AppError("E-mail inválido.");
    }

    if (typeof data.senha !== "string" || data.senha.length < MIN_PASSWORD_LENGTH) {
      throw new AppError(`A senha deve ter no mínimo ${MIN_PASSWORD_LENGTH} caracteres.`);
    }

    const email = data.email.trim().toLowerCase();

    if (await userRepository.findByEmail(email)) {
      throw new AppError("Já existe uma conta com este e-mail.", 409);
    }

    const senhaHash = await bcrypt.hash(data.senha, 10);
    const user = await userRepository.create({ nome, email, senhaHash });

    return { usuario: toPublicUser(user), token: signToken(user.id) };
  },

  async login(data: { email?: unknown; senha?: unknown }) {
    if (typeof data.email !== "string" || typeof data.senha !== "string") {
      throw new AppError("Informe e-mail e senha.");
    }

    const user = await userRepository.findByEmail(data.email.trim().toLowerCase());
    const valid = user ? await bcrypt.compare(data.senha, user.senhaHash) : false;

    // Mesma mensagem para e-mail inexistente e senha errada
    if (!user || !valid) {
      throw new AppError("E-mail ou senha inválidos.", 401);
    }

    return { usuario: toPublicUser(user), token: signToken(user.id) };
  },

  async me(userId: string) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new AppError("Usuário não encontrado.", 401);
    }

    return toPublicUser(user);
  },

  verifyToken(token: string): string {
    const payload = jwt.verify(token, getSecret());

    if (typeof payload === "string" || typeof payload.sub !== "string") {
      throw new Error("Token inválido.");
    }

    return payload.sub;
  }
};
