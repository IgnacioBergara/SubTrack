import { type BillingCycle, isBillingCycle } from "./billing-cycle";

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
export function validateSubscription(input: SubscriptionInput): SubscriptionValidationResult {
  const errors: SubscriptionValidationError[] = [];
  const name = input.name.trim();

  if (name === "") errors.push("NAME_REQUIRED");

  if (!Number.isInteger(input.amountCents)) errors.push("AMOUNT_NOT_INTEGER");
  else if (input.amountCents <= 0) errors.push("AMOUNT_NOT_POSITIVE");

  const cycle = isBillingCycle(input.cycle) ? input.cycle : undefined;
  if (cycle === undefined) errors.push("CYCLE_INVALID");

  if (cycle === undefined || errors.length > 0) return { ok: false, errors };

  return { ok: true, value: { name, amountCents: input.amountCents, cycle } };
}
