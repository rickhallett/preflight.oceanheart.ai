# Repository Guidelines

This document provides concise, practical guidance for contributing to this repository. It applies to the entire repo unless a more specific AGENTS.md exists in a subfolder.

## Project Structure & Module Organization
- `apps/preflight-web/` — Next.js 15 frontend application
  - `app/` — App Router pages and layouts
  - `components/` — Reusable React components  
  - `lib/` — Utilities and configurations
- `apps/preflight-api/` — FastAPI backend application
  - `app/` — API routes and services
  - `alembic/` — Database migrations
- `package.json`, `bun.lock`, `tsconfig.json` — Bun/TypeScript tooling
- `node_modules/` — Managed by Bun; do not edit

## Build, Test, and Development Commands
- Frontend setup: `cd apps/preflight-web && bun install` — install dependencies
- Frontend dev: `bun run dev` — Next.js dev server on port 3002
- Frontend build: `bun run build` — production build
- Linting: `bun run lint` — Biome linting
- Formatting: `bun run format` — Biome formatting
- Backend setup: `cd apps/preflight-api && pip install -r requirements.txt`
- Backend dev: `uvicorn app.main:app --reload --port 8002`

## Coding Style & Naming Conventions
- TypeScript: 2-space indent, `strict` types (per `tsconfig.json`).
  - Naming: `camelCase` for variables/functions, `PascalCase` for types/classes, kebab-case for filenames unless exporting a React/TSX component (then `PascalCase.tsx`).
- Python: PEP 8, 4-space indent, use type hints. Module and function names in `snake_case`.
- Imports: prefer relative within a feature; promote to shared only when used by 2+ areas.

## Testing Guidelines
- JS/TS: place tests next to sources as `*.test.ts` or in `tests/`. Use `bun:test` APIs (`test`, `expect`). Run with `bun test`.
- Python: use `pytest` with files named `test_*.py`. Keep unit tests fast and deterministic.
- Aim to cover critical paths (form parsing, request handlers, LLM adapters) and add regression tests for fixed bugs.

## Commit & Pull Request Guidelines
- Use Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`.
- Branches: short, kebab-case (`feat-form-dsl-v2`). One topic per PR.
- PRs must include: concise description, linked issue(s), test plan (`bun test`/`pytest` output), screenshots for UI, and notes on migration or config changes.

## Security & Configuration Tips
- Never commit secrets. Use `.env` locally (Bun auto-loads). Document required env vars in README.
- Validate and sanitize inputs on any new API or CLI surfaces.

