import type { Clock } from "../ports/clock";

/** Reloj de tests: marca la hora que se le diga y solo avanza a pedido. */
export class FixedClock implements Clock {
  private current: Date;

  constructor(isoInstant: string) {
    this.current = new Date(isoInstant);
  }

  now(): Date {
    return new Date(this.current);
  }

  advanceDays(days: number): void {
    this.current = new Date(this.current.getTime() + days * 86_400_000);
  }
}
