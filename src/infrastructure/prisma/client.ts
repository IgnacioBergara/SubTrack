import { PrismaClient } from "@prisma/client";

/**
 * Una sola instancia de PrismaClient por proceso. En desarrollo Next recarga los módulos
 * en cada cambio, así que se guarda en globalThis para no abrir conexiones nuevas cada vez.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
