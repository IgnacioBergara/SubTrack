# SubTrack

SaaS para registrar suscripciones (streaming, software, hosting, gimnasio), ver cuánto se gasta por mes y cuándo se renueva cada una. Desarrollado con **TDD** y **GitFlow**.

## Estado

| Release | Contenido                                                   | Estado       |
| ------- | ----------------------------------------------------------- | ------------ |
| v0.1    | Dominio puro: próxima renovación, costo mensual, validación | ✅ Publicada |
| v0.2    | Cuentas: registro, login y sesión                           | Pendiente    |
| v0.3    | CRUD de suscripciones                                       | Pendiente    |
| v0.4    | Categorías y panel de gastos                                | Pendiente    |
| v0.5    | Planes Free/Pro y pagos con Stripe (modo test)              | Pendiente    |
| v0.6    | Avisos de renovación                                        | Pendiente    |
| v1.0    | Exportar CSV y eliminar cuenta                              | Pendiente    |

Detalle en el [CHANGELOG](CHANGELOG.md).

## Stack

TypeScript (strict) · Next.js (App Router) · PostgreSQL + Prisma · Vitest · Playwright · GitHub Actions · Stripe (modo test)

## Arquitectura

```
src/
├── domain/          Reglas de negocio como funciones puras. Sin framework, base de datos ni red.
│   ├── billing-cycle.ts            Ciclos de cobro (RN-01)
│   ├── calendar-date.ts            Aritmética de fechas ISO en UTC
│   ├── next-renewal.ts             Próxima renovación (RN-02, RN-03)
│   ├── monthly-cost.ts             Costo mensual equivalente (RN-04)
│   └── subscription-validation.ts  Validación de suscripciones (RN-05)
└── app/             Next.js (UI y endpoints)
```

- El dominio no puede importar Next, React, Prisma ni Stripe: una regla de ESLint lo bloquea.
- Las fechas son strings `YYYY-MM-DD` y "hoy" se recibe como parámetro, nunca se lee del sistema.
- Los importes son enteros en centavos.

## Decisiones (ADR)

1. [Dominio puro, independiente del framework y la base de datos](docs/adr/0001-dominio-puro-independiente.md)
2. [Fechas como strings ISO de calendario y "hoy" inyectado](docs/adr/0002-fechas-iso-de-calendario.md)
3. [Importes en centavos enteros](docs/adr/0003-importes-en-centavos.md)
4. [GitFlow con merge commits](docs/adr/0004-gitflow-con-merge-commits.md)

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

| Tipo        | Cantidad | Cobertura del dominio |
| ----------- | -------- | --------------------- |
| Unitarios   | 41       | 100 % líneas y ramas  |
| Integración | 0        | —                     |
| E2E         | 0        | —                     |

## Flujo de trabajo

- **GitFlow**: `main` (releases con tag), `develop` (integración), `feature/*`, `release/*`, `hotfix/*`.
- **Merge**: merge commit (`--no-ff`) para conservar los commits del ciclo TDD.
- **Commits**: Conventional Commits. Cada comportamiento nace de un `test:` en rojo, seguido de `feat:` en verde y opcionalmente `refactor:`.
