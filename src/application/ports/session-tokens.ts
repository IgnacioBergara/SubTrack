/** Generación y hash de tokens de sesión. La implementación real usa node:crypto. */
export interface SessionTokens {
  /** Token aleatorio e impredecible; es lo que viaja en la cookie. */
  generate(): string;
  /** Hash determinista del token; es lo que se guarda en la base. */
  hash(token: string): string;
}
