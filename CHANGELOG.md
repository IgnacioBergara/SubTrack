# Changelog

Todos los cambios relevantes de SubTrack se documentan en este archivo.
El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y el proyecto usa [versionado semántico](https://semver.org/lang/es/).

## [0.2.0] - 2026-11-28

Cuentas de usuario: registro, login y logout con sesiones en PostgreSQL.

### Added

- `POST /api/auth/register`: registro con email y contraseña. El email se guarda en minúsculas y sin espacios, y es único aunque dos registros lleguen a la vez (RF-04).
- Contraseñas guardadas con bcrypt de costo 12 y como máximo 72 bytes, para que bcrypt no las trunque sin avisar (RNF-04).
- `POST /api/auth/login`: crea una sesión de 30 días y manda su token en una cookie `HttpOnly`, `Secure` y `SameSite=Lax` (RF-05).
- `POST /api/auth/logout`: cierra la sesión de la cookie y borra la cookie. Las demás sesiones del usuario siguen abiertas (RF-05).
- Un único `401 INVALID_CREDENTIALS` para un email inexistente y para una contraseña incorrecta, con el mismo tiempo de respuesta en los dos casos (RF-05).
- Las sesiones se guardan con el hash SHA-256 del token, nunca con el token. Vencen a los 30 días y se borran solas al consultarlas vencidas (RF-05).
- PostgreSQL con Prisma, levantado con Docker Compose. Migraciones `create_users` y `create_sessions`.
- Tests de integración contra un schema `test` propio, también en el CI con un servicio de Postgres.
- Arquitectura en capas `domain`, `application` e `infrastructure`, con ports y un composition root. ESLint bloquea las dependencias en la dirección equivocada.
- ADRs 0005 (capas y ports) y 0006 (sesiones en la base).

## [0.1.0] - 2026-11-21

Primera release: el núcleo del dominio como funciones puras, sin framework ni base de datos.

### Added

- Cálculo de la próxima renovación para ciclos semanal, mensual, trimestral y anual, con ajuste a fin de mes y años bisiestos (RF-01, RN-02, RN-03).
- Costo mensual equivalente de cualquier ciclo, en centavos y redondeado al centavo (RF-02, RN-04).
- Validación de suscripciones: nombre obligatorio, importe entero mayor que 0 y ciclo conocido, con todos los errores juntos (RF-03, RN-01, RN-05).
- Proyecto base: Next.js con TypeScript estricto, ESLint, Prettier, Vitest con umbrales de cobertura y CI en GitHub Actions.
- ADRs iniciales en `docs/adr/`.

[0.2.0]: https://github.com/IgnacioBergara/SubTrack/releases/tag/v0.2.0
[0.1.0]: https://github.com/IgnacioBergara/SubTrack/releases/tag/v0.1.0
