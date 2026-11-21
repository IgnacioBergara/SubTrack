# ADR 0004: GitFlow con merge commits

- **Estado:** aceptada
- **Fecha:** 2026-11-20

## Contexto

El proyecto se desarrolla con TDD, y la evidencia es el historial: un commit `test:` en rojo antes del `feat:` que lo pone en verde (RNF-01). Fusionar con squash juntaría esos commits en uno solo y borraría esa evidencia.

## Decisión

- Ramas GitFlow: `main` (solo releases con tag), `develop` (integración), `feature/*`, `release/*` y `hotfix/*`.
- Las ramas se fusionan por Pull Request con **merge commit** (`--no-ff`), nunca con squash.
- Cada feature sigue la secuencia `test:` → `feat:` → `refactor:` opcional, en Conventional Commits.
- Las releases salen de `develop` en una rama `release/x.y.z`, se fusionan en `main` con un tag `vx.y.z` y vuelven a `develop`.

## Consecuencias

- El grafo de `develop` muestra cada feature como una rama con su ciclo rojo, verde y refactor.
- No se pueden corregir commits sueltos con squash: cada commit tiene que ser un cambio lógico completo.
