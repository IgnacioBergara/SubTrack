import {
  type RegistrationInput,
  type RegistrationValidationError,
  validateRegistration,
} from "@/domain/registration-validation";
import type { PublicUser } from "@/domain/user";
import type { PasswordHasher } from "./ports/password-hasher";
import { EmailAlreadyTakenError, type UserRepository } from "./ports/user-repository";

export type RegisterUserError = RegistrationValidationError | "EMAIL_TAKEN";

export type RegisterUserResult =
  | { ok: true; user: PublicUser }
  | { ok: false; errors: RegisterUserError[] };

export interface RegisterUserDeps {
  users: UserRepository;
  hasher: PasswordHasher;
}

const EMAIL_TAKEN: RegisterUserResult = { ok: false, errors: ["EMAIL_TAKEN"] };

/** RF-04: registra un usuario con email único y contraseña guardada como hash. */
export function makeRegisterUser({ users, hasher }: RegisterUserDeps) {
  return async function registerUser(input: RegistrationInput): Promise<RegisterUserResult> {
    const validation = validateRegistration(input);
    if (!validation.ok) return validation;

    const { email, password } = validation.value;
    if (await users.findByEmail(email)) return EMAIL_TAKEN;

    try {
      const user = await users.create({ email, passwordHash: await hasher.hash(password) });
      return { ok: true, user: { id: user.id, email: user.email } };
    } catch (error) {
      // Otra petición registró el mismo email entre findByEmail y create.
      if (error instanceof EmailAlreadyTakenError) return EMAIL_TAKEN;
      throw error;
    }
  };
}
