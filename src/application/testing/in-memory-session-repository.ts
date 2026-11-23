import type { Session } from "@/domain/session";
import type { SessionRepository } from "../ports/session-repository";

/** Doble de SessionRepository para tests. */
export class InMemorySessionRepository implements SessionRepository {
  private readonly sessions = new Map<string, Session>();

  async create(session: Session): Promise<void> {
    this.sessions.set(session.tokenHash, { ...session });
  }

  async findByTokenHash(tokenHash: string): Promise<Session | null> {
    return this.sessions.get(tokenHash) ?? null;
  }

  async deleteByTokenHash(tokenHash: string): Promise<void> {
    this.sessions.delete(tokenHash);
  }

  /** Solo para aserciones en tests. */
  all(): Session[] {
    return [...this.sessions.values()];
  }
}
