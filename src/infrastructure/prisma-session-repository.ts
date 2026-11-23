import type { PrismaClient } from "@prisma/client";
import type { SessionRepository } from "@/application/ports/session-repository";
import type { Session } from "@/domain/session";

/** SessionRepository sobre Postgres con Prisma. */
export class PrismaSessionRepository implements SessionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(_session: Session): Promise<void> {
    throw new Error("Not implemented");
  }

  async findByTokenHash(_tokenHash: string): Promise<Session | null> {
    throw new Error("Not implemented");
  }

  async deleteByTokenHash(_tokenHash: string): Promise<void> {
    throw new Error("Not implemented");
  }
}
