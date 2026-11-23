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
export function makeGetSessionUser({ sessions, tokens, clock }: GetSessionUserDeps) {
  return async function getSessionUser(token: string): Promise<GetSessionUserResult> {
    const tokenHash = tokens.hash(token);
    const session = await sessions.findByTokenHash(tokenHash);
    if (!session) return { ok: false, error: "UNAUTHENTICATED" };

    // Vence en el instante exacto de expiresAt; de paso se limpia de la base.
    if (clock.now().getTime() >= session.expiresAt.getTime()) {
      await sessions.deleteByTokenHash(tokenHash);
      return { ok: false, error: "UNAUTHENTICATED" };
    }

    return { ok: true, userId: session.userId };
  };
}
