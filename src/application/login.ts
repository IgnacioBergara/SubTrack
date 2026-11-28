import { normalizeEmail } from "@/domain/registration-validation";
import type { Clock } from "./ports/clock";
import type { PasswordHasher } from "./ports/password-hasher";
import type { SessionRepository } from "./ports/session-repository";
import type { SessionTokens } from "./ports/session-tokens";
import type { UserRepository } from "./ports/user-repository";

/** Una sesión dura 30 días desde el login. */
export const SESSION_TTL_DAYS = 30;
const MS_PER_DAY = 86_400_000;

export interface LoginInput {
  email: string;
  password: string;
}

/** RF-05: un único error para email inexistente y contraseña incorrecta. */
export type LoginResult =
  | { ok: true; token: string; expiresAt: Date }
  | { ok: false; error: "INVALID_CREDENTIALS" };

export interface LoginDeps {
  users: UserRepository;
  hasher: PasswordHasher;
  sessions: SessionRepository;
  tokens: SessionTokens;
  clock: Clock;
}

/** RF-05: con credenciales válidas crea una sesión y devuelve su token. */
export function makeLogin({ users, hasher, sessions, tokens, clock }: LoginDeps) {
  return async function login(input: LoginInput): Promise<LoginResult> {
    const user = await users.findByEmail(normalizeEmail(input.email));

    // Se verifica siempre, aunque el email no exista, para que el tiempo de respuesta
    // no revele qué emails están registrados.
    const passwordMatches = await hasher.verify(input.password, user?.passwordHash ?? null);
    if (!user || !passwordMatches) return { ok: false, error: "INVALID_CREDENTIALS" };

    const token = tokens.generate();
    const expiresAt = new Date(clock.now().getTime() + SESSION_TTL_DAYS * MS_PER_DAY);
    await sessions.create({ userId: user.id, tokenHash: tokens.hash(token), expiresAt });

    return { ok: true, token, expiresAt };
  };
}
