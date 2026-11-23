import { beforeEach, describe, expect, it } from "vitest";
import { makeLogout } from "./logout";
import { FakeSessionTokens } from "./testing/fake-session-tokens";
import { InMemorySessionRepository } from "./testing/in-memory-session-repository";

const EXPIRES_AT = new Date("2026-12-23T12:00:00.000Z");

describe("logout (RF-05)", () => {
  let sessions: InMemorySessionRepository;
  let logout: ReturnType<typeof makeLogout>;

  beforeEach(async () => {
    sessions = new InMemorySessionRepository();
    logout = makeLogout({ sessions, tokens: new FakeSessionTokens() });

    await sessions.create({ userId: "user-1", tokenHash: "sha256:token-1", expiresAt: EXPIRES_AT });
    await sessions.create({ userId: "user-1", tokenHash: "sha256:token-2", expiresAt: EXPIRES_AT });
  });

  it("deletes the session identified by the token", async () => {
    await logout("token-1");

    expect(await sessions.findByTokenHash("sha256:token-1")).toBeNull();
  });

  it("keeps the user's other sessions open", async () => {
    await logout("token-1");

    expect(sessions.all()).toEqual([
      { userId: "user-1", tokenHash: "sha256:token-2", expiresAt: EXPIRES_AT },
    ]);
  });

  it("does not fail for an unknown or already closed session", async () => {
    await logout("token-1");

    await expect(logout("token-1")).resolves.toBeUndefined();
    await expect(logout("never-issued")).resolves.toBeUndefined();
  });
});
