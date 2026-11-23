import { PrismaClient } from "@prisma/client";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaSessionRepository } from "./prisma-session-repository";

const prisma = new PrismaClient();
const sessions = new PrismaSessionRepository(prisma);

const EXPIRES_AT = new Date("2026-12-23T12:00:00.000Z");
let anaId: string;

beforeEach(async () => {
  // Borrar los usuarios arrastra sus sesiones (onDelete: Cascade).
  await prisma.user.deleteMany();
  const ana = await prisma.user.create({
    data: { email: "ana@example.com", passwordHash: "hash-1" },
  });
  anaId = ana.id;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("PrismaSessionRepository", () => {
  describe("create and findByTokenHash", () => {
    it("returns null when no session has that token hash", async () => {
      expect(await sessions.findByTokenHash("unknown-hash")).toBeNull();
    });

    it("returns the stored session with its user, token hash and exact expiration", async () => {
      await sessions.create({ userId: anaId, tokenHash: "hash-a", expiresAt: EXPIRES_AT });

      expect(await sessions.findByTokenHash("hash-a")).toEqual({
        userId: anaId,
        tokenHash: "hash-a",
        expiresAt: EXPIRES_AT,
      });
    });

    it("keeps several sessions for the same user", async () => {
      await sessions.create({ userId: anaId, tokenHash: "hash-a", expiresAt: EXPIRES_AT });
      await sessions.create({ userId: anaId, tokenHash: "hash-b", expiresAt: EXPIRES_AT });

      expect(await sessions.findByTokenHash("hash-a")).not.toBeNull();
      expect(await sessions.findByTokenHash("hash-b")).not.toBeNull();
    });
  });

  describe("deleteByTokenHash", () => {
    it("removes only the session with that token hash", async () => {
      await sessions.create({ userId: anaId, tokenHash: "hash-a", expiresAt: EXPIRES_AT });
      await sessions.create({ userId: anaId, tokenHash: "hash-b", expiresAt: EXPIRES_AT });

      await sessions.deleteByTokenHash("hash-a");

      expect(await sessions.findByTokenHash("hash-a")).toBeNull();
      expect(await sessions.findByTokenHash("hash-b")).not.toBeNull();
    });

    it("does not fail when the session does not exist", async () => {
      await expect(sessions.deleteByTokenHash("unknown-hash")).resolves.toBeUndefined();
    });
  });

  it("deletes the user's sessions when the user is deleted", async () => {
    await sessions.create({ userId: anaId, tokenHash: "hash-a", expiresAt: EXPIRES_AT });

    await prisma.user.delete({ where: { id: anaId } });

    expect(await sessions.findByTokenHash("hash-a")).toBeNull();
  });
});
