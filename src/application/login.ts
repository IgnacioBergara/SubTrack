import type { Clock } from "./ports/clock";
import type { PasswordHasher } from "./ports/password-hasher";
import type { SessionRepository } from "./ports/session-repository";
import type { SessionTokens } from "./ports/session-tokens";
import type { UserRepository } from "./ports/user-repository";

/** Una sesión dura 30 días desde el login. */
export const SESSION_TTL_DAYS = 30;

export interface LoginInput {
  email: string;
  password: string;
}

/** RF-05: un único error para email inexistente y contraseña incorrecta. */
export type LoginResult =
  | { ok: true; token: string; expiresAt: Date }
  | { ok: false; error: "INVALID_CREDENTIALS" };

export interface LoginDeps {
  users: UserRepository;
  hasher: PasswordHasher;
  sessions: SessionRepository;
  tokens: SessionTokens;
  clock: Clock;
}

/** RF-05: con credenciales válidas crea una sesión y devuelve su token. */
export function makeLogin(_deps: LoginDeps) {
  return async function login(_input: LoginInput): Promise<LoginResult> {
    throw new Error("Not implemented");
  };
}
