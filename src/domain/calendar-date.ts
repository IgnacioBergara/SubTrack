/**
 * Aritmética de fechas de calendario en formato ISO (YYYY-MM-DD), sin hora.
 * Todo se calcula en UTC para que el resultado no dependa de la zona horaria (RNF-08).
 * Como el formato es fijo, dos fechas ISO se pueden comparar directamente con < y >.
 */

const MS_PER_DAY = 86_400_000;

interface CalendarDate {
  year: number;
  month: number; // 1-12
  day: number;
}

/** Días transcurridos de `from` a `to` (negativo si `to` es anterior). */
export function daysBetween(from: string, to: string): number {
  return toEpochDay(to) - toEpochDay(from);
}

/** Meses de calendario de `from` a `to`, ignorando el día. */
export function monthsBetween(from: string, to: string): number {
  const a = parseIsoDate(from);
  const b = parseIsoDate(to);
  return (b.year - a.year) * 12 + (b.month - a.month);
}

export function addDays(isoDate: string, days: number): string {
  const date = new Date((toEpochDay(isoDate) + days) * MS_PER_DAY);
  return formatIsoDate({
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  });
}

/** RN-03: si el día original no existe en el mes destino, usa el último día de ese mes. */
export function addMonthsClamped(isoDate: string, months: number): string {
  const { year, month, day } = parseIsoDate(isoDate);
  const totalMonths = year * 12 + (month - 1) + months;
  const targetYear = Math.floor(totalMonths / 12);
  const targetMonth = (totalMonths % 12) + 1;
  return formatIsoDate({
    year: targetYear,
    month: targetMonth,
    day: Math.min(day, daysInMonth(targetYear, targetMonth)),
  });
}

function parseIsoDate(isoDate: string): CalendarDate {
  const [year, month, day] = isoDate.split("-").map(Number) as [number, number, number];
  return { year, month, day };
}

function formatIsoDate({ year, month, day }: CalendarDate): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${year}-${pad(month)}-${pad(day)}`;
}

function daysInMonth(year: number, month: number): number {
  // Día 0 del mes siguiente = último día del mes pedido.
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function toEpochDay(isoDate: string): number {
  const { year, month, day } = parseIsoDate(isoDate);
  return Date.UTC(year, month - 1, day) / MS_PER_DAY;
}
