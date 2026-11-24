/** RNF-08: nadie lee la hora del sistema directamente; se inyecta un reloj. */
export interface Clock {
  now(): Date;
}
