import bcrypt from "bcryptjs";
import type { PasswordHasher } from "@/application/ports/password-hasher";

/** Costo por defecto de bcrypt: unos 250 ms por hash, lento a propósito contra fuerza bruta. */
export const DEFAULT_BCRYPT_COST = 12;

/** PasswordHasher con bcrypt (RNF-04). El costo se baja solo en tests para que sean rápidos. */
export class BcryptPasswordHasher implements PasswordHasher {
  /** Hash descartable del mismo costo, para comparar cuando el email no existe. */
  private dummyHash: Promise<string> | undefined;

  constructor(private readonly cost: number = DEFAULT_BCRYPT_COST) {}

  hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.cost);
  }

  async verify(plain: string, hash: string | null): Promise<boolean> {
    if (hash === null) {
      // Misma comparación que con un usuario real, para que el tiempo no revele si el email existe.
      this.dummyHash ??= bcrypt.hash("dummy-password-for-timing", this.cost);
      await bcrypt.compare(plain, await this.dummyHash);
      return false;
    }
    // bcrypt.compare compara en tiempo constante.
    return bcrypt.compare(plain, hash);
  }
}
