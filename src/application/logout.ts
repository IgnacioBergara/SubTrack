import type { SessionRepository } from "./ports/session-repository";
import type { SessionTokens } from "./ports/session-tokens";

export interface LogoutDeps {
  sessions: SessionRepository;
  tokens: SessionTokens;
}

/** RF-05: invalida la sesión del token. Cerrar una sesión inexistente no es un error. */
export function makeLogout(_deps: LogoutDeps) {
  return async function logout(_token: string): Promise<void> {
    throw new Error("Not implemented");
  };
}
