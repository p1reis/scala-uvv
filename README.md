# Scala UVV - Gerenciamento de Escalas e Espaços

Serviço centralizado para automatizar a organização semestral de salas e laboratórios da UVV, substituindo processos manuais via planilhas e eliminando conflitos de alocação.

## 🚀 Problema e Solução

Atualmente, a organização de espaços físicos é feita manualmente, o que consome semanas de trabalho e gera erros de alocação. O **Scala UVV** oferece uma plataforma centralizada para que organizadores gerenciem a grade semestral com agilidade e professores consultem e solicitem espaços especiais com visibilidade total.

## 🛠 Stack Tecnológica

- **Runtime:** Node.js (v20+)
- **Framework:** [NestJS](https://nestjs.com/)
- **Linguagem:** TypeScript
- **Banco de Dados:** PostgreSQL (Persistência) & Redis (Filas/Cache)
- **ORM:** TypeORM
- **Validação:** Zod & nestjs-zod
- **Filas/Jobs:** BullMQ
- **Qualidade de Código:** Biome (Linting & Formatting)
- **Testes:** Jest

## 🏗 Arquitetura

O projeto segue um modelo de **MVC Estendido** com separação clara de responsabilidades em camadas:

- **`src/domain`**: Entidades centrais e regras de negócio puras (ex: detecção de conflitos).
- **`src/application`**: Casos de uso do sistema e processamento de jobs assíncronos.
- **`src/infrastructure`**: Implementações técnicas (Controllers, Repositories, Migrations, Configurações de Framework).

## ⚙️ Como Rodar

### Pré-requisitos
- Docker e Docker Compose
- Node.js e npm

### Passo a passo

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Subir infraestrutura (DB & Redis):**
   ```bash
   docker-compose up -d
   ```

3. **Rodar em modo desenvolvimento:**
   ```bash
   npm run start:dev
   ```

4. **Verificar qualidade do código:**
   ```bash
   npm run lint
   ```

## 📅 Próximos Passos

- [ ] Implementação das Entidades de Domínio (Turma, Espaço, Alocação).
- [ ] Desenvolvimento do motor de detecção de conflitos de horários.
- [ ] Criação de Seeds para carga inicial de dados acadêmicos.
- [ ] Fluxo de solicitações de espaços especiais para professores.
