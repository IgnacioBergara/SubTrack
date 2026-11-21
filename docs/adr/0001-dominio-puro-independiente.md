# ADR 0001: Dominio puro, independiente del framework y la base de datos

- **Estado:** aceptada
- **Fecha:** 2026-11-20

## Contexto

Las reglas de negocio (RN-01 a RN-10) son el núcleo de SubTrack y deben probarse primero, rápido y sin infraestructura (RNF-07). Si el dominio importa Next.js, Prisma o Stripe, cada test necesita levantar esas piezas y el TDD se vuelve lento y frágil.

## Decisión

- Todo el dominio vive en `src/domain/` como funciones puras de TypeScript.
- Una regla de ESLint (`no-restricted-imports`) prohíbe importar Next, React, Prisma, Stripe o capas externas desde `src/domain/`. El lint falla en CI si alguien la rompe.
- Las dependencias externas (reloj, email, Stripe, persistencia) se definen como interfaces y se inyectan desde afuera.
- Los tests de dominio están junto al código (`*.test.ts`) y corren sin base de datos ni red.

## Consecuencias

- Los 41 tests de dominio de v0.1 corren en menos de un segundo.
- Hace falta una capa de aplicación que traduzca entre HTTP/Prisma y el dominio; se agrega en v0.2 y v0.3.
