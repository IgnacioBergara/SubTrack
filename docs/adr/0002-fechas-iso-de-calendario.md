# ADR 0002: Fechas como strings ISO de calendario y "hoy" inyectado

- **Estado:** aceptada
- **Fecha:** 2026-11-20

## Contexto

Las renovaciones dependen solo del día, no de la hora. Usar `Date` de JavaScript mezcla hora y zona horaria: un `new Date("2026-01-31")` puede convertirse en el 30 de enero según dónde corra el código. Además, RNF-08 exige que nada use la fecha del sistema directamente, para que los tests no dependan del día en que se ejecutan.

## Decisión

- Las fechas del dominio son strings `YYYY-MM-DD`. Como el formato es fijo, se comparan directamente con `<` y `>`.
- La aritmética de fechas está en `src/domain/calendar-date.ts` y se calcula siempre en UTC.
- Las funciones reciben `today` como parámetro (`nextRenewal(startDate, cycle, today)`). El reloj real se inyecta como interfaz `Clock` en la capa de aplicación.
- "Posterior a hoy" (RN-02) es estrictamente posterior: si hoy es el día de renovación, se devuelve la del ciclo siguiente.
- El ajuste de fin de mes (RN-03) se calcula siempre desde el día original de inicio, para que el 31/01 vuelva al 31/03 en vez de quedar fijo en el 28.

## Consecuencias

- Los tests de fechas son deterministas en cualquier zona horaria y en cualquier día.
- En la base de datos las fechas se guardan como `DATE` (sin hora) y se convierten a ISO en el borde.
