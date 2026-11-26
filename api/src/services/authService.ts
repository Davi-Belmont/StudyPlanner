import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { Prisma, Usuario } from "@prisma/client";

import prisma from "../config/prisma";
import { AppError } from "../utils/AppError";
import { LoginInput, RegisterInput } from "../schemas/authSchema";

const SALT_ROUNDS = 10;

// Hash falso para manter o tempo de resposta parecido quando o e-mail não
// existe (dificulta descobrir quais e-mails estão cadastrados).
const DUMMY_HASH = bcrypt.hashSync("senha-invalida-para-timing", SALT_ROUNDS);

function getJwtConfig() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET não está definido no .env");
  }

  return {
    secret,
    expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as SignOptions["expiresIn"]
  };
}

function signToken(usuarioId: string) {
  const { secret, expiresIn } = getJwtConfig();

  return jwt.sign({}, secret, { subject: usuarioId, expiresIn });
}

// Nunca devolver o hash da senha para o cliente
function toPublicUser(usuario: Usuario) {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    createdAt: usuario.createdAt
  };
}

export const authService = {
  async register(data: RegisterInput) {
    const existing = await prisma.usuario.findUnique({
      where: { email: data.email }
    });

    if (existing) {
      throw new AppError("Este e-mail já está cadastrado.", 409);
    }

    const senhaHash = await bcrypt.hash(data.senha, SALT_ROUNDS);

    try {
      const usuario = await prisma.usuario.create({
        data: { nome: data.nome, email: data.email, senha: senhaHash }
      });

      return { usuario: toPublicUser(usuario), token: signToken(usuario.id) };
    } catch (err) {
      // Duas requisições simultâneas com o mesmo e-mail
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        throw new AppError("Este e-mail já está cadastrado.", 409);
      }
      throw err;
    }
  },

  async login(data: LoginInput) {
    const usuario = await prisma.usuario.findUnique({
      where: { email: data.email }
    });

    const senhaCorreta = await bcrypt.compare(
      data.senha,
      usuario ? usuario.senha : DUMMY_HASH
    );

    // Mensagem genérica: não revela se o e-mail existe ou se a senha está errada
    if (!usuario || !senhaCorreta) {
      throw new AppError("E-mail ou senha incorretos.", 401);
    }

    return { usuario: toPublicUser(usuario), token: signToken(usuario.id) };
  },

  async me(usuarioId: string) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId }
    });

    if (!usuario) {
      throw new AppError("Usuário não encontrado.", 404);
    }

    return toPublicUser(usuario);
  },

  verifyToken(token: string): string {
    const { secret } = getJwtConfig();

    try {
      const payload = jwt.verify(token, secret);

      if (typeof payload === "string" || !payload.sub) {
        throw new Error("payload inválido");
      }

      return payload.sub;
    } catch {
      throw new AppError("Token inválido ou expirado.", 401);
    }
  }
};