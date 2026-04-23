# Scala UVV Backend

API do Scala UVV, responsavel pela base de dados, regras de dominio e servicos de infraestrutura da plataforma de gestao e reserva de salas.

## Stack

- Node.js 20+
- NestJS
- TypeScript
- PostgreSQL
- Redis
- TypeORM
- BullMQ
- Biome
- Jest

## Estrutura atual

```txt
backend/
├── src/
│   ├── app.module.ts
│   ├── main.ts
│   └── domain/entity/
├── docker-compose.yml
├── package.json
└── tsconfig.json
```

## Pre-requisitos

- Node.js 20+
- pnpm
- Docker e Docker Compose

## Instalacao

```bash
pnpm install
```

## Ambiente

Crie um arquivo `.env` na raiz de `backend/`:

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

## Infraestrutura local

Suba PostgreSQL e Redis:

```bash
docker compose up -d
```

Servicos expostos:

- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

Para parar:

```bash
docker compose down
```

## Desenvolvimento

```bash
pnpm start:dev
```

A API sobe na porta definida por `PORT`. Se `PORT` nao estiver definida, o Nest usa `3000`.

## Scripts

```bash
pnpm build        # gera a build em dist/
pnpm start        # inicia a aplicacao
pnpm start:dev    # inicia com watch
pnpm start:debug  # inicia com debug e watch
pnpm start:prod   # executa dist/main
pnpm lint         # aplica verificacoes do Biome
pnpm format       # formata o projeto com Biome
pnpm test         # executa testes
pnpm test:watch   # executa testes em watch mode
pnpm test:cov     # executa testes com cobertura
```

## Banco de dados

O projeto usa TypeORM com entidades carregadas em `src/app.module.ts`.

Em desenvolvimento, `synchronize` fica habilitado quando `NODE_ENV=development`. Use essa configuracao apenas localmente.

Scripts de migration disponiveis:

```bash
pnpm migration:generate
pnpm migration:run
```

## Observacoes

- `app.enableCors()` esta habilitado em `src/main.ts`.
- As configuracoes sao lidas com `@nestjs/config`.
- Redis e BullMQ ja estao configurados para futuros fluxos assíncronos.
