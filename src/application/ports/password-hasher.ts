/** Hash de contraseñas. La implementación real usa bcrypt (RNF-04). */
export interface PasswordHasher {
  hash(plain: string): Promise<string>;
  verify(plain: string, hash: string): Promise<boolean>;
}
