# SubTrack

SaaS para registrar suscripciones (streaming, software, hosting, gimnasio), ver cuánto se gasta por mes y cuándo se renueva cada una. Desarrollado con **TDD** y **GitFlow**.

## Estado

| Release | Contenido                                                   | Estado       |
| ------- | ----------------------------------------------------------- | ------------ |
| v0.1    | Dominio puro: próxima renovación, costo mensual, validación | ✅ Publicada |
| v0.2    | Cuentas: registro, login y sesión                           | ✅ Publicada |
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
app  →  infrastructure  →  application  →  domain
```

```
src/
├── domain/          Reglas de negocio como funciones puras. Sin framework, base de datos ni red.
│   ├── next-renewal.ts             Próxima renovación (RN-02, RN-03)
│   ├── monthly-cost.ts             Costo mensual equivalente (RN-04)
│   ├── subscription-validation.ts  Validación de suscripciones (RN-05)
│   └── registration-validation.ts  Email y contraseña al registrarse (RF-04)
├── application/     Casos de uso (registro, login, logout, sesión) y los ports que necesitan.
│   ├── ports/                      Interfaces: repositorios, hasher, tokens, reloj
│   └── testing/                    Dobles en memoria para los tests unitarios
├── infrastructure/  Adaptadores: Prisma, bcrypt, node:crypto, reloj del sistema.
│   └── container.ts                Composition root: conecta casos de uso y adaptadores
└── app/             Next.js: UI y route handlers en api/
```

- Cada capa solo depende de las de adentro: ESLint bloquea las importaciones en la dirección equivocada.
- Las fechas de calendario son strings `YYYY-MM-DD` y "hoy" se recibe como parámetro. Los instantes vienen del `Clock` inyectado.
- Los importes son enteros en centavos.

### API

| Endpoint                  | Respuestas                                                  |
| ------------------------- | ----------------------------------------------------------- |
| `POST /api/auth/register` | 201 `{ user }` · 400 `{ errors }` · 409 `EMAIL_TAKEN`       |
| `POST /api/auth/login`    | 200 `{ expiresAt }` + cookie de sesión · 400 · 401 genérico |
| `POST /api/auth/logout`   | 204 y cookie borrada, haya o no una sesión abierta          |

La sesión viaja en la cookie `subtrack_session` (`HttpOnly`, `Secure`, `SameSite=Lax`), y en la base se guarda solo el hash del token.

## Decisiones (ADR)

1. [Dominio puro, independiente del framework y la base de datos](docs/adr/0001-dominio-puro-independiente.md)
2. [Fechas como strings ISO de calendario y "hoy" inyectado](docs/adr/0002-fechas-iso-de-calendario.md)
3. [Importes en centavos enteros](docs/adr/0003-importes-en-centavos.md)
4. [GitFlow con merge commits](docs/adr/0004-gitflow-con-merge-commits.md)
5. [Capas, ports y composition root](docs/adr/0005-capas-ports-y-composition-root.md)
6. [Sesiones en la base de datos con cookie HttpOnly](docs/adr/0006-sesiones-en-base-de-datos.md)

## Cómo correrlo

Requiere Node 20+ y Docker.

```bash
npm install
cp .env.example .env   # DATABASE_URL y TEST_DATABASE_URL apuntan al Postgres de Docker
npm run db:up          # levanta PostgreSQL 17 en el puerto 5432
npm run db:migrate     # aplica las migraciones
npm run dev            # http://localhost:3000
```

`npm run db:down` apaga la base. Los datos quedan en un volumen de Docker.

## Tests y calidad

```bash
npm test                  # tests unitarios, sin base de datos
npm run test:watch        # modo TDD
npm run test:integration  # contra Postgres, en el schema "test" (necesita db:up)
npm run test:coverage     # unitarios + integración con cobertura (dominio >= 90 %, global >= 80 %)
npm run lint
npm run typecheck
npm run format:check
```

Los tests de integración aplican las migraciones al schema `test` antes de correr, así nunca tocan los datos de desarrollo. En el CI corren contra un servicio de Postgres.

| Tipo        | Cantidad | Qué cubren                                                          |
| ----------- | -------- | ------------------------------------------------------------------- |
| Unitarios   | 95       | Dominio (100 % líneas y ramas), casos de uso y adaptadores sin base |
| Integración | 39       | Repositorios de Prisma y endpoints de auth                          |
| E2E         | 0        | —                                                                   |

## Flujo de trabajo

- **GitFlow**: `main` (releases con tag), `develop` (integración), `feature/*`, `release/*`, `hotfix/*`.
- **Merge**: merge commit (`--no-ff`) para conservar los commits del ciclo TDD.
- **Commits**: Conventional Commits. Cada comportamiento nace de un `test:` en rojo, seguido de `feat:` en verde y opcionalmente `refactor:`.
