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
    this.advanceMilliseconds(days * 86_400_000);
  }

  /** Acepta negativos, para probar el instante justo antes de un límite. */
  advanceMilliseconds(ms: number): void {
    this.current = new Date(this.current.getTime() + ms);
  }
}
