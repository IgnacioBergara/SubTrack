import type { BillingCycle } from "./billing-cycle";

/**
 * RN-02 / RN-03: devuelve la primera fecha del ciclo estrictamente posterior a `today`,
 * contando desde `startDate`. Fechas en formato ISO de calendario (YYYY-MM-DD), sin hora,
 * para que el resultado no dependa de la zona horaria ni del reloj del sistema (RNF-08).
 */
export function nextRenewal(_startDate: string, _cycle: BillingCycle, _today: string): string {
  throw new Error("Not implemented");
}
