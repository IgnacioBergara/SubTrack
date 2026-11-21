import type { BillingCycle } from "./billing-cycle";

/** Factor para llevar cada ciclo a un mes: importe × multiplier ÷ divisor (RN-04). */
const MONTHLY_FACTOR: Record<BillingCycle, { multiplier: number; divisor: number }> = {
  weekly: { multiplier: 52, divisor: 12 },
  monthly: { multiplier: 1, divisor: 1 },
  quarterly: { multiplier: 1, divisor: 3 },
  yearly: { multiplier: 1, divisor: 12 },
};

/**
 * RN-04 / RF-02: normaliza el importe de cualquier ciclo a su equivalente mensual.
 * Los importes se manejan en centavos enteros para evitar errores de punto flotante;
 * redondear a 2 decimales equivale a redondear al centavo más cercano.
 */
export function monthlyEquivalentCents(amountCents: number, cycle: BillingCycle): number {
  const { multiplier, divisor } = MONTHLY_FACTOR[cycle];
  // Multiplicar primero mantiene el valor entero hasta la única división.
  return Math.round((amountCents * multiplier) / divisor);
}
