# StudyPlanner

Organizador acadêmico para controlar disciplinas, tarefas/provas/trabalhos e notas.

## Funcionalidades

- Cadastro e login de usuário
- Disciplinas (criar, editar, excluir) com média das notas
- Atividades (tarefa, prova ou trabalho) com data de entrega e status
- Notas de 0 a 10 por disciplina
- Tela inicial com próximas entregas, semáforo de prazos e médias

## Tecnologias

- **Backend:** Node.js, Express, TypeScript, Prisma, PostgreSQL, JWT
- **Frontend:** React, TypeScript, Vite
- **Banco:** PostgreSQL via Docker

## Estrutura

```
StudyPlanner-FullStack/
├── api/                 # Backend (API REST)
│   ├── prisma/          # Schema e migrations
│   └── src/             # routes, controllers, services, repositories
├── frontend/            # Interface React
└── docker-compose.yml   # Banco PostgreSQL
```

## Pré-requisitos

- Node.js 18 ou superior
- Docker e Docker Compose

## Como rodar

### 1. Banco de dados

Na raiz do projeto:

```bash
docker compose up -d
```

### 2. Backend

```bash
cd api
npm install
cp .env.example .env
```

Abra o arquivo `.env` e troque o valor de `JWT_SECRET` por uma chave aleatória
(por exemplo, gerada com `openssl rand -hex 32`). Depois:

```bash
npx prisma migrate deploy
npx prisma generate
npm run dev
```

A API sobe em `http://localhost:3000`.
A documentação Swagger fica em `http://localhost:3000/docs`.

### 3. Frontend

Em outro terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Acesse `http://localhost:5173`, clique em **Criar conta** e comece a usar.

## Variáveis de ambiente

**api/.env**

| Variável | Descrição | Exemplo |
|---|---|---|
| `PORT` | Porta da API | `3000` |
| `DATABASE_URL` | Conexão com o PostgreSQL | `postgresql://postgres:postgres@localhost:5432/studyplanner?schema=public` |
| `JWT_SECRET` | Chave usada para assinar os tokens | string longa e aleatória |
| `CORS_ORIGIN` | Origens permitidas (separadas por vírgula) | `http://localhost:5173` |

**frontend/.env**

| Variável | Descrição | Exemplo |
|---|---|---|
| `VITE_API_URL` | URL da API | `http://localhost:3000` |
