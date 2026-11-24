import { createHash, randomBytes } from "node:crypto";
import type { SessionTokens } from "@/application/ports/session-tokens";

/** Bytes aleatorios por token: 256 bits, imposible de adivinar por fuerza bruta. */
export const SESSION_TOKEN_BYTES = 32;

/**
 * SessionTokens con node:crypto: token aleatorio en base64url y hash SHA-256 en hex.
 * Alcanza un hash rápido porque el token ya tiene 256 bits de entropía; bcrypt es para contraseñas.
 */
export class CryptoSessionTokens implements SessionTokens {
  generate(): string {
    return randomBytes(SESSION_TOKEN_BYTES).toString("base64url");
  }

  hash(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }
}
