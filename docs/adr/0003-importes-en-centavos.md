# ADR 0003: Importes en centavos enteros

- **Estado:** aceptada
- **Fecha:** 2026-11-21

## Contexto

RF-02 pide el costo mensual equivalente redondeado a 2 decimales, y el panel (RF-11) suma muchos importes. Con números de punto flotante, `0.1 + 0.2` da `0.30000000000000004`, y las sumas terminan con diferencias de un centavo.

## Decisión

- Todos los importes del dominio son enteros en centavos (`amountCents`): $120 se guarda como `12000`.
- "Redondear a 2 decimales" equivale a redondear al centavo más cercano, con redondeo hacia arriba en la mitad.
- Las normalizaciones multiplican antes de dividir, así hay una sola división y un solo redondeo.
- La validación rechaza importes no enteros (`AMOUNT_NOT_INTEGER`).
- La conversión a pesos con decimales se hace solo al mostrar, en la UI.

## Consecuencias

- Las sumas son exactas.
- En la base de datos los importes son columnas `Int`.
- Los formularios convierten lo que escribe el usuario (`10,99`) a centavos (`1099`) antes de enviarlo.
