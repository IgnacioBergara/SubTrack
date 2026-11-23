import type { PrismaClient } from "@prisma/client";
import type { NewUser, UserRepository } from "@/application/ports/user-repository";
import type { User } from "@/domain/user";

/** UserRepository sobre Postgres con Prisma. */
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByEmail(_email: string): Promise<User | null> {
    throw new Error("Not implemented");
  }

  async create(_data: NewUser): Promise<User> {
    throw new Error("Not implemented");
  }
}
