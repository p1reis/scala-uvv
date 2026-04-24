# Scala UVV

Plataforma para gestao e reserva de salas da Universidade Vila Velha. O projeto esta organizado em duas aplicacoes:

- `backend`: API em NestJS responsavel pelas regras de negocio, persistencia e integracoes de infraestrutura.
- `scala-ui`: interface web em Next.js para login, dashboard e futuras telas da plataforma.

## Estrutura

```txt
.
├── backend/   # API NestJS
└── scala-ui/  # Frontend Next.js
```

## Tecnologias

- Node.js
- TypeScript
- NestJS
- Next.js
- React
- Tailwind CSS
- PostgreSQL
- Redis
- TypeORM
- BullMQ

## Pre-requisitos

- Node.js 20+
- pnpm
- Docker e Docker Compose para a infraestrutura do backend

## Como rodar

### Backend

```bash
cd backend
pnpm install
docker compose up -d
pnpm start:dev
```

Por padrao, a API usa a porta definida em `PORT` ou `3000` quando a variavel nao estiver configurada.

### Frontend

```bash
cd scala-ui
pnpm install
pnpm dev
```

O frontend roda em `http://localhost:3000` quando a porta estiver livre.

## Variaveis de ambiente

O backend le variaveis via `@nestjs/config`. Para desenvolvimento local, crie um arquivo `.env` dentro de `backend/`:

```env
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=scala_uvv
REDIS_HOST=localhost
REDIS_PORT=6379
NODE_ENV=development
```

> Se backend e frontend forem executados ao mesmo tempo, use portas diferentes, por exemplo backend em `3001` e frontend em `3000`.

## Validacao

### Backend

```bash
cd backend
pnpm lint
pnpm test
pnpm build
```

### Frontend

```bash
cd scala-ui
pnpm lint
pnpm build
```

## Status atual

- Backend com NestJS, TypeORM, PostgreSQL, Redis e entidades de dominio configuradas.
- Frontend com tela de login em `/login`, dashboard inicial em `/` e autenticacao integrada ao backend.

## Contas de acesso para teste

O backend cria estes usuarios automaticamente via seeder quando a tabela `usuarios` esta vazia:

| Perfil | Email | Senha |
| --- | --- | --- |
| Organizador | `norminda@uvv.br` | `senha123` |
| Professor | `edgar@uvv.br` | `senha123` |
