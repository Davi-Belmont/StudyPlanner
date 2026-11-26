
import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  extendZodWithOpenApi,
} from "@asteasolutions/zod-to-openapi";

import { z, type ZodType } from "zod";

extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

// -------------------------------------------------------------
// 1. Schemas
// -------------------------------------------------------------

const idParam = z.object({
  id: z.string().openapi({
    example: "clx123abc",
    description: "ID do registro",
  }),
});

const disciplineSchema = z.object({
  name: z.string().min(1).openapi({ example: "Banco de Dados" }),
  description: z.string().optional().openapi({
    example: "Estudos sobre bancos relacionais",
  }),
});

const activitySchema = z.object({
  title: z.string().min(1).openapi({ example: "Prova de SQL" }),
  description: z.string().optional(),
  type: z.enum(["TASK", "EXAM", "ASSIGNMENT"]),
  status: z.enum(["PENDING", "COMPLETED"]).optional(),
  dueDate: z.string().datetime().openapi({
    example: "2026-12-10T14:00:00.000Z",
  }),
  disciplineId: z.string().openapi({ example: "clx123abc" }),
});

const gradeSchema = z.object({
  value: z.number().min(0).max(10).openapi({ example: 8.5 }),
  description: z.string().optional(),
  date: z.string().datetime().optional(),
  disciplineId: z.string().openapi({ example: "clx123abc" }),
});

// -------------------------------------------------------------
// 2. Helpers
// -------------------------------------------------------------

const jsonBody = (schema: ZodType) => ({
  content: {
    "application/json": { schema },
  },
});

const jsonResponse = (description: string, schema?: ZodType) => ({
  description,
  ...(schema ? jsonBody(schema) : {}),
});

// -------------------------------------------------------------
// 3. Modelos
// -------------------------------------------------------------

const disciplineModel = registry.register(
  "Discipline",
  disciplineSchema.extend({
    id: z.string(),
    createdAt: z.string().datetime(),
  })
);

const activityModel = registry.register(
  "Activity",
  activitySchema.extend({
    id: z.string(),
    status: z.enum(["PENDING", "COMPLETED"]),
    createdAt: z.string().datetime(),
  })
);

const gradeModel = registry.register(
  "Grade",
  gradeSchema.extend({
    id: z.string(),
    date: z.string().datetime(),
  })
);

const registerSchema = z.object({
  nome: z.string().min(2).openapi({ example: "Maria Silva" }),
  email: z.string().email().openapi({ example: "maria@email.com" }),
  senha: z.string().min(8).openapi({ example: "minhasenha123" }),
});

const loginSchema = z.object({
  email: z.string().email().openapi({ example: "maria@email.com" }),
  senha: z.string().openapi({ example: "minhasenha123" }),
});

const usuarioModel = registry.register(
  "Usuario",
  z.object({
    id: z.string(),
    nome: z.string(),
    email: z.string(),
    createdAt: z.string().datetime(),
  })
);

const authResponse = z.object({ usuario: usuarioModel, token: z.string() });

registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

registry.registerPath({
  method: "post",
  path: "/register",
  summary: "Cadastrar usuário",
  tags: ["Autenticação"],
  request: { body: jsonBody(registerSchema) },
  responses: {
    201: jsonResponse("Usuário criado", authResponse),
    400: jsonResponse("Dados inválidos"),
    409: jsonResponse("E-mail já cadastrado"),
  },
});

registry.registerPath({
  method: "post",
  path: "/login",
  summary: "Fazer login",
  tags: ["Autenticação"],
  request: { body: jsonBody(loginSchema) },
  responses: {
    200: jsonResponse("Login realizado", authResponse),
    400: jsonResponse("Dados inválidos"),
    401: jsonResponse("E-mail ou senha incorretos"),
  },
});

registry.registerPath({
  method: "get",
  path: "/me",
  summary: "Dados do usuário autenticado",
  tags: ["Autenticação"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: jsonResponse("Usuário autenticado", usuarioModel),
    401: jsonResponse("Token inválido ou ausente"),
  },
});

// -------------------------------------------------------------
// 4. Disciplinas
// -------------------------------------------------------------

registry.registerPath({
  method: "post",
  path: "/disciplines",
  summary: "Criar disciplina",
  tags: ["Disciplinas"],
  request: { body: jsonBody(disciplineSchema) },
  responses: {
    201: jsonResponse("Disciplina criada", disciplineModel),
    400: jsonResponse("Dados inválidos"),
  },
});

registry.registerPath({
  method: "get",
  path: "/disciplines",
  summary: "Listar disciplinas",
  tags: ["Disciplinas"],
  responses: {
    200: jsonResponse("Lista de disciplinas", z.array(disciplineModel)),
  },
});

registry.registerPath({
  method: "get",
  path: "/disciplines/{id}",
  summary: "Buscar disciplina por ID",
  tags: ["Disciplinas"],
  request: { params: idParam },
  responses: {
    200: jsonResponse("Disciplina encontrada", disciplineModel),
    404: jsonResponse("Disciplina não encontrada"),
  },
});

registry.registerPath({
  method: "put",
  path: "/disciplines/{id}",
  summary: "Atualizar disciplina",
  tags: ["Disciplinas"],
  request: {
    params: idParam,
    body: jsonBody(disciplineSchema.partial()),
  },
  responses: {
    200: jsonResponse("Disciplina atualizada", disciplineModel),
    404: jsonResponse("Disciplina não encontrada"),
  },
});

registry.registerPath({
  method: "delete",
  path: "/disciplines/{id}",
  summary: "Excluir disciplina",
  tags: ["Disciplinas"],
  request: { params: idParam },
  responses: {
    200: jsonResponse("Disciplina excluída"),
    404: jsonResponse("Disciplina não encontrada"),
  },
});

// -------------------------------------------------------------
// 5. Atividades
// -------------------------------------------------------------

registry.registerPath({
  method: "post",
  path: "/activities",
  summary: "Criar atividade",
  tags: ["Atividades"],
  request: { body: jsonBody(activitySchema) },
  responses: {
    201: jsonResponse("Atividade criada", activityModel),
    400: jsonResponse("Dados inválidos"),
  },
});

registry.registerPath({
  method: "get",
  path: "/activities",
  summary: "Listar atividades",
  tags: ["Atividades"],
  request: {
    query: z.object({
      disciplineId: z.string().optional(),
      status: z.enum(["PENDING", "COMPLETED"]).optional(),
      type: z.enum(["TASK", "EXAM", "ASSIGNMENT"]).optional(),
      from: z.string().datetime().optional(),
      to: z.string().datetime().optional(),
    }),
  },
  responses: {
    200: jsonResponse("Lista de atividades", z.array(activityModel)),
  },
});

registry.registerPath({
  method: "put",
  path: "/activities/{id}",
  summary: "Atualizar atividade",
  tags: ["Atividades"],
  request: {
    params: idParam,
    body: jsonBody(activitySchema.partial()),
  },
  responses: {
    200: jsonResponse("Atividade atualizada", activityModel),
    404: jsonResponse("Atividade não encontrada"),
  },
});

registry.registerPath({
  method: "delete",
  path: "/activities/{id}",
  summary: "Excluir atividade",
  tags: ["Atividades"],
  request: { params: idParam },
  responses: {
    200: jsonResponse("Atividade excluída"),
    404: jsonResponse("Atividade não encontrada"),
  },
});

// -------------------------------------------------------------
// 6. Notas
// -------------------------------------------------------------

registry.registerPath({
  method: "post",
  path: "/grades",
  summary: "Cadastrar nota",
  tags: ["Notas"],
  request: { body: jsonBody(gradeSchema) },
  responses: {
    201: jsonResponse("Nota cadastrada", gradeModel),
    400: jsonResponse("Dados inválidos"),
  },
});

registry.registerPath({
  method: "get",
  path: "/grades",
  summary: "Listar notas",
  tags: ["Notas"],
  request: {
    query: z.object({
      disciplineId: z.string().optional(),
    }),
  },
  responses: {
    200: jsonResponse("Lista de notas", z.array(gradeModel)),
  },
});

registry.registerPath({
  method: "put",
  path: "/grades/{id}",
  summary: "Atualizar nota",
  tags: ["Notas"],
  request: {
    params: idParam,
    body: jsonBody(gradeSchema.partial()),
  },
  responses: {
    200: jsonResponse("Nota atualizada", gradeModel),
    404: jsonResponse("Nota não encontrada"),
  },
});

registry.registerPath({
  method: "delete",
  path: "/grades/{id}",
  summary: "Excluir nota",
  tags: ["Notas"],
  request: { params: idParam },
  responses: {
    200: jsonResponse("Nota excluída"),
    404: jsonResponse("Nota não encontrada"),
  },
});

// -------------------------------------------------------------
// 7. Dashboard
// -------------------------------------------------------------

registry.registerPath({
  method: "get",
  path: "/dashboard",
  summary: "Consultar indicadores do dashboard",
  tags: ["Dashboard"],
  responses: {
    200: {
      description: "Indicadores do dashboard",
      content: {
        "application/json": {
          schema: z.object({
            disciplineCount: z.number(),
            pendingActivityCount: z.number(),
            upcomingActivities: z.array(activityModel),
            averages: z.array(
              z.object({
                disciplineId: z.string(),
                disciplineName: z.string(),
                average: z.number().nullable(),
              })
            ),
          }),
        },
      },
    },
  },
});

// -------------------------------------------------------------
// 8. Geração do documento OpenAPI
// -------------------------------------------------------------

const generator = new OpenApiGeneratorV3(registry.definitions);

export const swaggerSpec = generator.generateDocument({
  openapi: "3.0.0",
  info: {
    title: "StudyPlanner API",
    version: "1.0.0",
    description: "Documentação da API do StudyPlanner",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Servidor local",
    },
  ],
});
