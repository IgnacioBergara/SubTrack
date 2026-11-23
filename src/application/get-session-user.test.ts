import { beforeEach, describe, expect, it } from "vitest";
import { makeGetSessionUser } from "./get-session-user";
import { FakeSessionTokens } from "./testing/fake-session-tokens";
import { FixedClock } from "./testing/fixed-clock";
import { InMemorySessionRepository } from "./testing/in-memory-session-repository";

const UNAUTHENTICATED = { ok: false, error: "UNAUTHENTICATED" };

describe("getSessionUser (RF-05)", () => {
  let sessions: InMemorySessionRepository;
  let clock: FixedClock;
  let getSessionUser: ReturnType<typeof makeGetSessionUser>;

  beforeEach(async () => {
    sessions = new InMemorySessionRepository();
    clock = new FixedClock("2026-11-23T12:00:00.000Z");
    getSessionUser = makeGetSessionUser({ sessions, tokens: new FakeSessionTokens(), clock });

    await sessions.create({
      userId: "user-1",
      tokenHash: "sha256:token-1",
      expiresAt: new Date("2026-12-23T12:00:00.000Z"),
    });
  });

  describe("valid session", () => {
    it("returns the id of the user who owns the token", async () => {
      expect(await getSessionUser("token-1")).toEqual({ ok: true, userId: "user-1" });
    });

    it("is still valid one millisecond before it expires", async () => {
      clock.advanceDays(30);
      clock.advanceMilliseconds(-1);

      expect(await getSessionUser("token-1")).toEqual({ ok: true, userId: "user-1" });
    });
  });

  describe("invalid session", () => {
    it("rejects a token that was never issued", async () => {
      expect(await getSessionUser("forged-token")).toEqual(UNAUTHENTICATED);
    });

    it("rejects the session at the exact instant it expires", async () => {
      clock.advanceDays(30);

      expect(await getSessionUser("token-1")).toEqual(UNAUTHENTICATED);
    });

    it("rejects an expired session and removes it from storage", async () => {
      clock.advanceDays(31);

      expect(await getSessionUser("token-1")).toEqual(UNAUTHENTICATED);
      expect(sessions.all()).toEqual([]);
    });

    it("rejects a session that was closed with logout", async () => {
      await sessions.deleteByTokenHash("sha256:token-1");

      expect(await getSessionUser("token-1")).toEqual(UNAUTHENTICATED);
    });
  });
});
