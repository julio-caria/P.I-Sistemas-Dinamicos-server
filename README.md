# Gestão Universidade Server

Sistema de Gestão de Universidade - Projeto Integrador SENAC.

## Tecnologias

- Node.js
- TypeScript
- Fastify
- Drizzle ORM
- PostgreSQL
- Zod

## Instalação

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Configure o banco de dados PostgreSQL e crie um arquivo `.env` baseado no `.env.example`:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/database_name
   ```

3. Execute o projeto em modo desenvolvimento:
   ```bash
   npm run dev
   ```

4. Para produção, compile e execute:
   ```bash
   npm run build
   npm start
   ```

## Estrutura do Projeto

- `src/`: Código fonte TypeScript
- `dist/`: Código compilado JavaScript
- `package.json`: Dependências e scripts
- `tsconfig.json`: Configuração TypeScript