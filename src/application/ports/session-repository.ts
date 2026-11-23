import type { Session } from "@/domain/session";

/** Persistencia de sesiones, siempre buscadas por el hash del token. */
export interface SessionRepository {
  create(session: Session): Promise<void>;
  findByTokenHash(tokenHash: string): Promise<Session | null>;
  /** No falla si la sesión no existe: cerrar sesión dos veces es válido. */
  deleteByTokenHash(tokenHash: string): Promise<void>;
}
