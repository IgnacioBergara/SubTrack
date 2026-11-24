import type { Clock } from "@/application/ports/clock";

/** Clock real (RNF-08): el único lugar de la app que lee la hora del sistema. */
export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}
