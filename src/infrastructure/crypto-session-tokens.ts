import type { SessionTokens } from "@/application/ports/session-tokens";

/** Bytes aleatorios por token: 256 bits, imposible de adivinar por fuerza bruta. */
export const SESSION_TOKEN_BYTES = 32;

/** SessionTokens con node:crypto: token aleatorio en base64url y hash SHA-256 en hex. */
export class CryptoSessionTokens implements SessionTokens {
  generate(): string {
    throw new Error("Not implemented");
  }

  hash(_token: string): string {
    throw new Error("Not implemented");
  }
}
