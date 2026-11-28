import type { User } from "@/domain/user";

export interface NewUser {
  email: string;
  passwordHash: string;
}

/** Persistencia de usuarios. La implementación real usa Prisma; en tests, un doble en memoria. */
export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  /** Lanza EmailAlreadyTakenError si el email ya existe (la base lo garantiza con un índice único). */
  create(data: NewUser): Promise<User>;
}

export class EmailAlreadyTakenError extends Error {
  constructor(email: string) {
    super(`Email already taken: ${email}`);
    this.name = "EmailAlreadyTakenError";
  }
}
