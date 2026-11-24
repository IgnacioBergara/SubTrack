import type { PrismaClient } from "@prisma/client";
import type { SessionRepository } from "@/application/ports/session-repository";
import type { Session } from "@/domain/session";

/** Solo las columnas que el dominio conoce; id y createdAt quedan en la base. */
const SESSION_FIELDS = { userId: true, tokenHash: true, expiresAt: true } as const;

/** SessionRepository sobre Postgres con Prisma. */
export class PrismaSessionRepository implements SessionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(session: Session): Promise<void> {
    await this.prisma.session.create({ data: session });
  }

  findByTokenHash(tokenHash: string): Promise<Session | null> {
    return this.prisma.session.findUnique({ where: { tokenHash }, select: SESSION_FIELDS });
  }

  async deleteByTokenHash(tokenHash: string): Promise<void> {
    // deleteMany no falla si no hay filas, a diferencia de delete.
    await this.prisma.session.deleteMany({ where: { tokenHash } });
  }
}
