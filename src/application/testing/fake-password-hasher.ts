import type { PasswordHasher } from "../ports/password-hasher";

/** Doble de PasswordHasher para tests: determinista e instantáneo, sin bcrypt. */
export class FakePasswordHasher implements PasswordHasher {
  async hash(plain: string): Promise<string> {
    return `hashed:${plain}`;
  }

  async verify(plain: string, hash: string | null): Promise<boolean> {
    return hash !== null && hash === `hashed:${plain}`;
  }
}
