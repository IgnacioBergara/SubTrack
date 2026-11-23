import { beforeEach, describe, expect, it, vi } from "vitest";
import { EmailAlreadyTakenError, type UserRepository } from "./ports/user-repository";
import { makeRegisterUser } from "./register-user";
import { FakePasswordHasher } from "./testing/fake-password-hasher";
import { InMemoryUserRepository } from "./testing/in-memory-user-repository";

describe("registerUser", () => {
  let users: InMemoryUserRepository;
  let hasher: FakePasswordHasher;
  let registerUser: ReturnType<typeof makeRegisterUser>;

  beforeEach(() => {
    users = new InMemoryUserRepository();
    hasher = new FakePasswordHasher();
    registerUser = makeRegisterUser({ users, hasher });
  });

  describe("new email", () => {
    it("registers the user and returns its id and normalized email", async () => {
      const result = await registerUser({ email: " Ana@Example.com ", password: "s3cret-pass" });

      expect(result).toEqual({ ok: true, user: { id: "user-1", email: "ana@example.com" } });
    });

    it("stores the hashed password, never the plain text", async () => {
      await registerUser({ email: "ana@example.com", password: "s3cret-pass" });

      expect(users.all()).toEqual([
        { id: "user-1", email: "ana@example.com", passwordHash: "hashed:s3cret-pass" },
      ]);
    });

    it("does not expose the password hash in the result", async () => {
      const result = await registerUser({ email: "ana@example.com", password: "s3cret-pass" });

      expect(result.ok && Object.keys(result.user)).toEqual(["id", "email"]);
    });
  });

  describe("email already registered (RF-04)", () => {
    beforeEach(async () => {
      await registerUser({ email: "ana@example.com", password: "first-pass" });
    });

    it("rejects the registration with EMAIL_TAKEN", async () => {
      const result = await registerUser({ email: "ana@example.com", password: "other-pass" });

      expect(result).toEqual({ ok: false, errors: ["EMAIL_TAKEN"] });
    });

    it("detects the existing email regardless of case", async () => {
      const result = await registerUser({ email: "ANA@example.com", password: "other-pass" });

      expect(result).toEqual({ ok: false, errors: ["EMAIL_TAKEN"] });
    });

    it("keeps the original user untouched", async () => {
      await registerUser({ email: "ana@example.com", password: "other-pass" });

      expect(users.all()).toHaveLength(1);
      expect(users.all()[0]?.passwordHash).toBe("hashed:first-pass");
    });
  });

  describe("concurrent registration", () => {
    it("returns EMAIL_TAKEN when another request creates the same email first", async () => {
      // findByEmail no lo ve, pero el índice único de la base rechaza el insert.
      const racingUsers: UserRepository = {
        findByEmail: async () => null,
        create: async ({ email }) => {
          throw new EmailAlreadyTakenError(email);
        },
      };
      const register = makeRegisterUser({ users: racingUsers, hasher });

      const result = await register({ email: "ana@example.com", password: "s3cret-pass" });

      expect(result).toEqual({ ok: false, errors: ["EMAIL_TAKEN"] });
    });

    it("rethrows unexpected repository errors", async () => {
      const brokenUsers: UserRepository = {
        findByEmail: async () => null,
        create: async () => {
          throw new Error("connection lost");
        },
      };
      const register = makeRegisterUser({ users: brokenUsers, hasher });

      await expect(register({ email: "ana@example.com", password: "s3cret-pass" })).rejects.toThrow(
        "connection lost",
      );
    });
  });

  describe("invalid input", () => {
    it("returns the validation errors", async () => {
      const result = await registerUser({ email: "not-an-email", password: "short" });

      expect(result).toEqual({ ok: false, errors: ["EMAIL_INVALID", "PASSWORD_TOO_SHORT"] });
    });

    it("does not hash or store anything", async () => {
      const hash = vi.spyOn(hasher, "hash");

      await registerUser({ email: "not-an-email", password: "short" });

      expect(hash).not.toHaveBeenCalled();
      expect(users.all()).toEqual([]);
    });
  });
});
