---
trigger: model_decision
description: Rules for Bidsync project (React/Vite + NestJS)
---

# Bidsync Project Rules

## 6. Language
- Use Spanish for all responses and plans.
- Use English for all code comments and documentation.

## 1. Project Structure
- **Monorepo-style**:
  - `client/`: React 19, Vite, TypeScript.
  - `server/`: NestJS, Prisma, TypeScript.
- **Strict Separation**: Do not mix client and server code.

## 2. Client-Side (React + Vite)
- **Components**: Use Functional Components with Hooks.
- **Styling**: Use Vanilla CSS. Prefer BEM or descriptive class names to avoid conflicts.
- **State**: React Context for global, `useState`/`useReducer` for local.
- **Routing**: React Router v7.
- **Naming**: `kebab-case` for files (e.g., `user-profile.tsx`), `PascalCase` for components.

## 3. Server-Side (NestJS)
- **Architecture**: Modules -> Controllers -> Services.
- **Database**: Prisma ORM. Update `schema.prisma` and run generation for DB changes.
- **DTOs**: Use `class-validator` for input validation.
- **Naming**: `kebab-case` for files (e.g., `auth.service.ts`), `camelCase` for class methods.

## 4. General
- **TypeScript**: Strict typing. No `any`.
- **Async**: Use `async/await`.
- **Comments**: Explain "Why", not "What".