import type { PasswordHasher } from "@/application/ports/password-hasher";

/** Costo por defecto de bcrypt: unos 250 ms por hash, lento a propósito contra fuerza bruta. */
export const DEFAULT_BCRYPT_COST = 12;

/** PasswordHasher con bcrypt (RNF-04). El costo se baja solo en tests para que sean rápidos. */
export class BcryptPasswordHasher implements PasswordHasher {
  constructor(private readonly cost: number = DEFAULT_BCRYPT_COST) {}

  async hash(_plain: string): Promise<string> {
    throw new Error("Not implemented");
  }

  async verify(_plain: string, _hash: string): Promise<boolean> {
    throw new Error("Not implemented");
  }
}
