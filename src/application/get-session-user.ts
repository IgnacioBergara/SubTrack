import type { Clock } from "./ports/clock";
import type { SessionRepository } from "./ports/session-repository";
import type { SessionTokens } from "./ports/session-tokens";

/** Los endpoints protegidos solo necesitan saber de quién es la sesión. */
export type GetSessionUserResult =
  | { ok: true; userId: string }
  | { ok: false; error: "UNAUTHENTICATED" };

export interface GetSessionUserDeps {
  sessions: SessionRepository;
  tokens: SessionTokens;
  clock: Clock;
}

/** RF-05: resuelve el usuario de un token de sesión vigente. */
export function makeGetSessionUser(_deps: GetSessionUserDeps) {
  return async function getSessionUser(_token: string): Promise<GetSessionUserResult> {
    throw new Error("Not implemented");
  };
}
