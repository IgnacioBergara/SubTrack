import type {
  RegistrationInput,
  RegistrationValidationError,
} from "@/domain/registration-validation";
import type { PublicUser } from "@/domain/user";
import type { PasswordHasher } from "./ports/password-hasher";
import type { UserRepository } from "./ports/user-repository";

export type RegisterUserError = RegistrationValidationError | "EMAIL_TAKEN";

export type RegisterUserResult =
  | { ok: true; user: PublicUser }
  | { ok: false; errors: RegisterUserError[] };

export interface RegisterUserDeps {
  users: UserRepository;
  hasher: PasswordHasher;
}

/** RF-04: registra un usuario con email único y contraseña guardada como hash. */
export function makeRegisterUser(_deps: RegisterUserDeps) {
  return async function registerUser(_input: RegistrationInput): Promise<RegisterUserResult> {
    throw new Error("Not implemented");
  };
}
