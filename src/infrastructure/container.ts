import { makeGetSessionUser } from "@/application/get-session-user";
import { makeLogin } from "@/application/login";
import { makeLogout } from "@/application/logout";
import { makeRegisterUser } from "@/application/register-user";
import { BcryptPasswordHasher } from "./bcrypt-password-hasher";
import { CryptoSessionTokens } from "./crypto-session-tokens";
import { prisma } from "./prisma/client";
import { PrismaSessionRepository } from "./prisma-session-repository";
import { PrismaUserRepository } from "./prisma-user-repository";
import { SystemClock } from "./system-clock";

/**
 * Composition root: el único lugar donde los casos de uso se conectan con las
 * implementaciones reales. Los route handlers importan de acá, nunca de los adaptadores.
 */
const users = new PrismaUserRepository(prisma);
const hasher = new BcryptPasswordHasher();
const sessions = new PrismaSessionRepository(prisma);
const tokens = new CryptoSessionTokens();
const clock = new SystemClock();

export const registerUser = makeRegisterUser({ users, hasher });
export const login = makeLogin({ users, hasher, sessions, tokens, clock });
export const logout = makeLogout({ sessions, tokens });
export const getSessionUser = makeGetSessionUser({ sessions, tokens, clock });
