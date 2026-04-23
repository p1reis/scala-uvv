# Scala UVV Frontend

Interface web do Scala UVV, construida com Next.js e React. O frontend contem a tela de login, protecao mockada no client e uma tela inicial com sidebar para a futura plataforma.

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- ESLint
- pnpm

## Estrutura

```txt
scala-ui/
├── app/
│   ├── components/
│   ├── login/page.tsx
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
├── public/
│   ├── logo-scala.JPG
│   └── logo-uvv.png
├── package.json
└── next.config.ts
```

## Rotas

- `/login`: tela de login institucional.
- `/`: dashboard inicial protegido por uma verificacao simples no front end.

## Login mockado

A autenticacao atual e apenas um mock no navegador usando `localStorage`.

Credenciais:

- Email: `exemplo@gmail.com`
- Senha: `123456`

Ao autenticar, o frontend grava:

```txt
scala:isAuthenticated=true
```

Ao sair, essa chave e removida.

## Pre-requisitos

- Node.js 20+
- pnpm

## Instalacao

```bash
pnpm install
```

## Desenvolvimento

```bash
pnpm dev
```

Abra `http://localhost:3000`.

## Build

```bash
pnpm build
pnpm start
```

## Qualidade

```bash
pnpm lint
```

## Componentes principais

- `app/components/login-form.tsx`: formulario de login com validacao mockada.
- `app/components/login-hero.tsx`: painel visual da tela de login.
- `app/components/logo-lockup.tsx`: composicao das logos Scala e UVV.
- `app/components/dashboard-home.tsx`: dashboard inicial com sidebar e verificacao de sessao.

## Observacoes

- A protecao atual acontece somente no front end e nao deve ser usada como seguranca real em producao.
- Quando o backend de autenticacao estiver pronto, substitua o mock do `localStorage` por chamadas a API e uma estrategia de sessao adequada.
