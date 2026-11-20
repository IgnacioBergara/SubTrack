// RN-01: cada suscripción tiene un ciclo de cobro.
export const BILLING_CYCLES = ["weekly", "monthly", "quarterly", "yearly"] as const;

export type BillingCycle = (typeof BILLING_CYCLES)[number];
