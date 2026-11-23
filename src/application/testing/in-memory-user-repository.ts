import type { User } from "@/domain/user";
import {
  EmailAlreadyTakenError,
  type NewUser,
  type UserRepository,
} from "../ports/user-repository";

/** Doble de UserRepository para tests: guarda en un Map y respeta el email único. */
export class InMemoryUserRepository implements UserRepository {
  private readonly users = new Map<string, User>();
  private nextId = 1;

  async findByEmail(email: string): Promise<User | null> {
    return [...this.users.values()].find((user) => user.email === email) ?? null;
  }

  async create(data: NewUser): Promise<User> {
    if (await this.findByEmail(data.email)) throw new EmailAlreadyTakenError(data.email);
    const user: User = { id: `user-${this.nextId++}`, ...data };
    this.users.set(user.id, user);
    return user;
  }

  /** Solo para aserciones en tests. */
  all(): User[] {
    return [...this.users.values()];
  }
}
