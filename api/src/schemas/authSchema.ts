import { z } from "zod";

export const registerSchema = z.object({
  nome: z
    .string({ error: "O nome é obrigatório." })
    .trim()
    .min(2, "O nome deve ter pelo menos 2 caracteres.")
    .max(100, "O nome deve ter no máximo 100 caracteres."),
  email: z
    .string({ error: "O e-mail é obrigatório." })
    .trim()
    .toLowerCase()
    .email("E-mail inválido."),
  senha: z
    .string({ error: "A senha é obrigatória." })
    .min(8, "A senha deve ter pelo menos 8 caracteres.")
    .max(72, "A senha deve ter no máximo 72 caracteres.") // limite do bcrypt
});

export const loginSchema = z.object({
  email: z
    .string({ error: "O e-mail é obrigatório." })
    .trim()
    .toLowerCase()
    .email("E-mail inválido."),
  senha: z
    .string({ error: "A senha é obrigatória." })
    .min(1, "A senha é obrigatória.")
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;