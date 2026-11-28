# ADR 0005: Capas, ports y composition root

- **Estado:** aceptada
- **Fecha:** 2026-11-28

## Contexto

Con v0.2 entran la base de datos, bcrypt y las cookies. Los casos de uso, como registrarse o iniciar sesión, combinan reglas del dominio con esos servicios externos. Si importaran Prisma o bcrypt directamente, cada test necesitaría una base de datos levantada y tardaría unos 250 ms por cada hash. Además, las reglas quedarían atadas a una librería concreta.

## Decisión

El código se organiza en cuatro capas, y cada una solo puede depender de las que tiene adentro:

```
app  →  infrastructure  →  application  →  domain
```

- **`domain`**: reglas puras (ADR 0001).
- **`application`**: casos de uso como fábricas `makeX(deps)` que devuelven una función. Declaran lo que necesitan del exterior como **ports**, que son interfaces en `application/ports/`: `UserRepository`, `PasswordHasher`, `SessionRepository`, `SessionTokens` y `Clock`.
- **`infrastructure`**: adaptadores que implementan esos ports con Prisma, bcrypt, `node:crypto` y el reloj del sistema.
- **`app`**: route handlers de Next. Validan la forma del request, llaman al caso de uso y traducen el resultado a HTTP.

Las conexiones se hacen en un único **composition root**, `infrastructure/container.ts`, que crea los adaptadores reales y se los pasa a los casos de uso. Los route handlers importan los casos de uso ya armados desde ahí, nunca los adaptadores.

ESLint bloquea las importaciones en la dirección equivocada: `domain` no puede importar `application` ni `infrastructure`, y `application` no puede importar Prisma, bcrypt ni `infrastructure`.

Los casos de uso devuelven uniones discriminadas (`{ ok: true, ... } | { ok: false, error }`) con códigos de error, no excepciones ni mensajes. El mensaje para el usuario lo decide la capa `app`.

## Consecuencias

- Los casos de uso se prueban con dobles en memoria (`application/testing/`), sin base de datos y en milisegundos.
- Cada adaptador tiene tests propios: los de Prisma son de integración, contra un schema `test` de Postgres.
- Cambiar una librería, por ejemplo bcrypt por argon2, toca un adaptador y el container, no los casos de uso.
- Hay más archivos y más indirección que llamando a Prisma desde la ruta. Es un costo aceptado a cambio de tests rápidos y reglas independientes.
