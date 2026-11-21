import type { BillingCycle } from "./billing-cycle";

/**
 * RN-04 / RF-02: normaliza el importe de cualquier ciclo a su equivalente mensual.
 * Los importes se manejan en centavos enteros para evitar errores de punto flotante;
 * redondear a 2 decimales equivale a redondear al centavo más cercano.
 */
export function monthlyEquivalentCents(_amountCents: number, _cycle: BillingCycle): number {
  throw new Error("Not implemented");
}
