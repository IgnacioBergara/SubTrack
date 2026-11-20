import type { BillingCycle } from "./billing-cycle";
import { addDays, addMonthsClamped, daysBetween, monthsBetween } from "./calendar-date";

const DAYS_PER_WEEK = 7;

const MONTHS_PER_CYCLE: Record<Exclude<BillingCycle, "weekly">, number> = {
  monthly: 1,
  quarterly: 3,
  yearly: 12,
};

/**
 * RN-02 / RN-03: devuelve la primera fecha del ciclo estrictamente posterior a `today`,
 * contando desde `startDate`. Fechas en formato ISO de calendario (YYYY-MM-DD), sin hora,
 * para que el resultado no dependa de la zona horaria ni del reloj del sistema (RNF-08).
 */
export function nextRenewal(startDate: string, cycle: BillingCycle, today: string): string {
  if (startDate > today) return startDate;

  if (cycle === "weekly") {
    const weeks = Math.floor(daysBetween(startDate, today) / DAYS_PER_WEEK) + 1;
    return addDays(startDate, weeks * DAYS_PER_WEEK);
  }

  const step = MONTHS_PER_CYCLE[cycle];
  // Primer candidato: el último ciclo que cae en el mes actual o antes.
  let cycles = Math.floor(monthsBetween(startDate, today) / step);
  let candidate = addMonthsClamped(startDate, cycles * step);
  while (candidate <= today) {
    cycles += 1;
    candidate = addMonthsClamped(startDate, cycles * step);
  }
  return candidate;
}
