import type { BillingCycle } from "./billing-cycle";

/** Datos sin validar, tal como llegan desde afuera del dominio. */
export interface SubscriptionInput {
  name: string;
  amountCents: number;
  cycle: string;
}

export interface ValidSubscription {
  name: string;
  amountCents: number;
  cycle: BillingCycle;
}

export type SubscriptionValidationError =
  | "NAME_REQUIRED"
  | "AMOUNT_NOT_POSITIVE"
  | "AMOUNT_NOT_INTEGER"
  | "CYCLE_INVALID";

export type SubscriptionValidationResult =
  | { ok: true; value: ValidSubscription }
  | { ok: false; errors: SubscriptionValidationError[] };

/** RF-03 / RN-05: valida nombre, importe y ciclo, y devuelve todos los errores juntos. */
export function validateSubscription(_input: SubscriptionInput): SubscriptionValidationResult {
  throw new Error("Not implemented");
}
