import { Prisma, type PrismaClient } from "@prisma/client";
import {
  EmailAlreadyTakenError,
  type NewUser,
  type UserRepository,
} from "@/application/ports/user-repository";
import type { User } from "@/domain/user";

/** Código de Prisma para violación de un índice único. */
const UNIQUE_CONSTRAINT_VIOLATION = "P2002";

/** Solo las columnas que el dominio conoce; createdAt queda en la base. */
const USER_FIELDS = { id: true, email: true, passwordHash: true } as const;

/** UserRepository sobre Postgres con Prisma. */
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email }, select: USER_FIELDS });
  }

  async create(data: NewUser): Promise<User> {
    try {
      return await this.prisma.user.create({ data, select: USER_FIELDS });
    } catch (error) {
      if (isUniqueViolation(error)) throw new EmailAlreadyTakenError(data.email);
      throw error;
    }
  }
}

function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === UNIQUE_CONSTRAINT_VIOLATION
  );
}
