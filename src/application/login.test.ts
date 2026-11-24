import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeLogin } from "./login";
import { FakePasswordHasher } from "./testing/fake-password-hasher";
import { FakeSessionTokens } from "./testing/fake-session-tokens";
import { FixedClock } from "./testing/fixed-clock";
import { InMemorySessionRepository } from "./testing/in-memory-session-repository";
import { InMemoryUserRepository } from "./testing/in-memory-user-repository";

const INVALID_CREDENTIALS = { ok: false, error: "INVALID_CREDENTIALS" };

describe("login", () => {
  let users: InMemoryUserRepository;
  let hasher: FakePasswordHasher;
  let sessions: InMemorySessionRepository;
  let login: ReturnType<typeof makeLogin>;
  let anaId: string;

  beforeEach(async () => {
    users = new InMemoryUserRepository();
    hasher = new FakePasswordHasher();
    sessions = new InMemorySessionRepository();
    login = makeLogin({
      users,
      hasher,
      sessions,
      tokens: new FakeSessionTokens(),
      clock: new FixedClock("2026-11-23T12:00:00.000Z"),
    });

    const ana = await users.create({
      email: "ana@example.com",
      passwordHash: await hasher.hash("s3cret-pass"),
    });
    anaId = ana.id;
  });

  describe("valid credentials (RF-05)", () => {
    it("returns a session token and its expiration", async () => {
      const result = await login({ email: "ana@example.com", password: "s3cret-pass" });

      expect(result).toEqual({
        ok: true,
        token: "token-1",
        expiresAt: new Date("2026-12-23T12:00:00.000Z"),
      });
    });

    it("stores the session linked to the user with the token hash, not the token", async () => {
      await login({ email: "ana@example.com", password: "s3cret-pass" });

      expect(sessions.all()).toEqual([
        {
          userId: anaId,
          tokenHash: "sha256:token-1",
          expiresAt: new Date("2026-12-23T12:00:00.000Z"),
        },
      ]);
    });

    it("accepts the email with different case and surrounding whitespace", async () => {
      const result = await login({ email: "  ANA@Example.com ", password: "s3cret-pass" });

      expect(result.ok).toBe(true);
    });

    it("creates an independent session on every login", async () => {
      const first = await login({ email: "ana@example.com", password: "s3cret-pass" });
      const second = await login({ email: "ana@example.com", password: "s3cret-pass" });

      expect(first.ok && first.token).not.toBe(second.ok && second.token);
      expect(sessions.all()).toHaveLength(2);
    });
  });

  describe("invalid credentials (RF-05)", () => {
    it("rejects an unknown email with INVALID_CREDENTIALS", async () => {
      const result = await login({ email: "nobody@example.com", password: "s3cret-pass" });

      expect(result).toEqual(INVALID_CREDENTIALS);
    });

    it("rejects a wrong password with the same INVALID_CREDENTIALS", async () => {
      const result = await login({ email: "ana@example.com", password: "wrong-pass" });

      expect(result).toEqual(INVALID_CREDENTIALS);
    });

    it("does not create a session", async () => {
      await login({ email: "ana@example.com", password: "wrong-pass" });
      await login({ email: "nobody@example.com", password: "s3cret-pass" });

      expect(sessions.all()).toEqual([]);
    });

    it("still verifies a password when the email does not exist, to keep timing even", async () => {
      const verify = vi.spyOn(hasher, "verify");

      await login({ email: "nobody@example.com", password: "s3cret-pass" });

      expect(verify).toHaveBeenCalledExactlyOnceWith("s3cret-pass", null);
    });
  });
});
