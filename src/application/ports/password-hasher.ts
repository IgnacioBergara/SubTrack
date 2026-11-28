/** Hash de contraseñas. La implementación real usa bcrypt (RNF-04). */
export interface PasswordHasher {
  hash(plain: string): Promise<string>;
  /**
   * Con `hash: null` (el email no existe) igual gasta el mismo tiempo y devuelve false,
   * para que medir cuánto tarda el login no revele qué emails están registrados.
   */
  verify(plain: string, hash: string | null): Promise<boolean>;
}
