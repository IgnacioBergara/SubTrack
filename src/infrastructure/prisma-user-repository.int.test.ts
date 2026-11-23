import { PrismaClient } from "@prisma/client";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { EmailAlreadyTakenError } from "@/application/ports/user-repository";
import { PrismaUserRepository } from "./prisma-user-repository";

const prisma = new PrismaClient();
const users = new PrismaUserRepository(prisma);

beforeEach(async () => {
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("PrismaUserRepository", () => {
  describe("findByEmail", () => {
    it("returns null when no user has that email", async () => {
      expect(await users.findByEmail("nobody@example.com")).toBeNull();
    });

    it("returns the stored user with its id, email and password hash", async () => {
      const created = await users.create({ email: "ana@example.com", passwordHash: "hash-1" });

      expect(await users.findByEmail("ana@example.com")).toEqual({
        id: created.id,
        email: "ana@example.com",
        passwordHash: "hash-1",
      });
    });
  });

  describe("create", () => {
    it("persists the user and returns it with a generated id", async () => {
      const user = await users.create({ email: "ana@example.com", passwordHash: "hash-1" });

      expect(user).toEqual({
        id: expect.any(String),
        email: "ana@example.com",
        passwordHash: "hash-1",
      });
      expect(await prisma.user.count()).toBe(1);
    });

    it("throws EmailAlreadyTakenError when the email already exists", async () => {
      await users.create({ email: "ana@example.com", passwordHash: "hash-1" });

      await expect(
        users.create({ email: "ana@example.com", passwordHash: "hash-2" }),
      ).rejects.toBeInstanceOf(EmailAlreadyTakenError);
    });

    it("keeps a single row when two creations race for the same email", async () => {
      const results = await Promise.allSettled([
        users.create({ email: "ana@example.com", passwordHash: "hash-1" }),
        users.create({ email: "ana@example.com", passwordHash: "hash-2" }),
      ]);

      expect(results.map((r) => r.status).sort()).toEqual(["fulfilled", "rejected"]);
      expect(await prisma.user.count()).toBe(1);
    });
  });
});
