# SubTrack

SaaS para registrar suscripciones (streaming, software, hosting, gimnasio), ver cuánto se gasta por mes y cuándo se renueva cada una. Desarrollado con **TDD** y **GitFlow**.

## Stack

TypeScript (strict) · Next.js (App Router) · PostgreSQL + Prisma · Vitest · Playwright · GitHub Actions · Stripe (modo test)

## Cómo correrlo

```bash
npm install
npm run dev            # http://localhost:3000
```

## Tests y calidad

```bash
npm test               # tests unitarios
npm run test:watch     # modo TDD
npm run test:coverage  # cobertura (dominio >= 90 %, global >= 80 %)
npm run lint
npm run typecheck
npm run format:check
```

## Flujo de trabajo

- **GitFlow**: `main` (releases con tag), `develop` (integración), `feature/*`, `release/*`, `hotfix/*`.
- **Merge**: `--no-ff` para conservar los commits del ciclo TDD.
- **Commits**: Conventional Commits. Cada comportamiento nace de un `test:` en rojo, seguido de `feat:` en verde y opcionalmente `refactor:`.
