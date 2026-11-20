import type { BillingCycle } from "./billing-cycle";

const MS_PER_DAY = 86_400_000;
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

  if (cycle === "weekly") return nextWeeklyRenewal(startDate, today);

  const step = MONTHS_PER_CYCLE[cycle];
  const start = parseIsoDate(startDate);
  const now = parseIsoDate(today);
  const monthsElapsed = (now.year - start.year) * 12 + (now.month - start.month);

  // Primer candidato: el último ciclo que cae en el mes actual o antes.
  let cycles = Math.floor(monthsElapsed / step);
  let candidate = addMonthsClamped(startDate, cycles * step);
  while (candidate <= today) {
    cycles += 1;
    candidate = addMonthsClamped(startDate, cycles * step);
  }
  return candidate;
}

function nextWeeklyRenewal(startDate: string, today: string): string {
  const daysElapsed = toEpochDay(today) - toEpochDay(startDate);
  const weeks = Math.floor(daysElapsed / DAYS_PER_WEEK) + 1;
  return fromEpochDay(toEpochDay(startDate) + weeks * DAYS_PER_WEEK);
}

/** RN-03: si el día original no existe en el mes destino, usa el último día de ese mes. */
function addMonthsClamped(isoDate: string, months: number): string {
  const { year, month, day } = parseIsoDate(isoDate);
  const totalMonths = year * 12 + (month - 1) + months;
  const targetYear = Math.floor(totalMonths / 12);
  const targetMonth = (totalMonths % 12) + 1;
  const targetDay = Math.min(day, daysInMonth(targetYear, targetMonth));
  return formatIsoDate(targetYear, targetMonth, targetDay);
}

interface CalendarDate {
  year: number;
  month: number; // 1-12
  day: number;
}

function parseIsoDate(isoDate: string): CalendarDate {
  const [year, month, day] = isoDate.split("-").map(Number) as [number, number, number];
  return { year, month, day };
}

function formatIsoDate(year: number, month: number, day: number): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${year}-${pad(month)}-${pad(day)}`;
}

function daysInMonth(year: number, month: number): number {
  // Día 0 del mes siguiente = último día del mes pedido. UTC evita saltos por zona horaria.
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function toEpochDay(isoDate: string): number {
  const { year, month, day } = parseIsoDate(isoDate);
  return Date.UTC(year, month - 1, day) / MS_PER_DAY;
}

function fromEpochDay(epochDay: number): string {
  const date = new Date(epochDay * MS_PER_DAY);
  return formatIsoDate(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
}
