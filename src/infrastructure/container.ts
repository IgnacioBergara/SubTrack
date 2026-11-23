import { makeRegisterUser } from "@/application/register-user";
import { BcryptPasswordHasher } from "./bcrypt-password-hasher";
import { prisma } from "./prisma/client";
import { PrismaUserRepository } from "./prisma-user-repository";

/**
 * Composition root: el único lugar donde los casos de uso se conectan con las
 * implementaciones reales. Los route handlers importan de acá, nunca de los adaptadores.
 */
const users = new PrismaUserRepository(prisma);
const hasher = new BcryptPasswordHasher();

export const registerUser = makeRegisterUser({ users, hasher });
