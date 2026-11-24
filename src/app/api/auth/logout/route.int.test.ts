import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { CryptoSessionTokens } from "@/infrastructure/crypto-session-tokens";
import { prisma } from "@/infrastructure/prisma/client";
import { SESSION_COOKIE } from "../session-cookie";
import { POST } from "./route";

const tokens = new CryptoSessionTokens();
const EXPIRES_AT = new Date("2026-12-23T12:00:00.000Z");

function logout(cookie?: string): Promise<Response> {
  return POST(
    new Request("http://localhost/api/auth/logout", {
      method: "POST",
      headers: cookie ? { Cookie: cookie } : {},
    }),
  );
}

let anaId: string;

/** Abre una sesión directamente en la base y devuelve su token. */
async function openSession(): Promise<string> {
  const token = tokens.generate();
  await prisma.session.create({
    data: { userId: anaId, tokenHash: tokens.hash(token), expiresAt: EXPIRES_AT },
  });
  return token;
}

beforeEach(async () => {
  // Borrar los usuarios arrastra sus sesiones.
  await prisma.user.deleteMany();
  const ana = await prisma.user.create({
    data: { email: "ana@example.com", passwordHash: "hash-1" },
  });
  anaId = ana.id;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("POST /api/auth/logout (RF-05)", () => {
  it("responds 204 and deletes the session of the cookie", async () => {
    const token = await openSession();

    const response = await logout(`${SESSION_COOKIE}=${token}`);

    expect(response.status).toBe(204);
    expect(await prisma.session.count()).toBe(0);
  });

  it("finds the session cookie among other cookies", async () => {
    const token = await openSession();

    await logout(`theme=dark; ${SESSION_COOKIE}=${token}; lang=es`);

    expect(await prisma.session.count()).toBe(0);
  });

  it("keeps the user's other sessions open", async () => {
    const token = await openSession();
    const otherToken = await openSession();

    await logout(`${SESSION_COOKIE}=${token}`);

    const remaining = await prisma.session.findMany();
    expect(remaining.map((s) => s.tokenHash)).toEqual([tokens.hash(otherToken)]);
  });

  it("tells the browser to delete the cookie with the same attributes it was set with", async () => {
    const token = await openSession();

    const response = await logout(`${SESSION_COOKIE}=${token}`);

    const header = response.headers.get("set-cookie") ?? "";
    expect(header.startsWith(`${SESSION_COOKIE}=;`)).toBe(true);
    expect(header).toContain("Max-Age=0");
    for (const attribute of ["HttpOnly", "Secure", "SameSite=Lax", "Path=/"]) {
      expect(header).toContain(attribute);
    }
  });

  it.each([
    ["there is no cookie", undefined],
    ["the session no longer exists", `${SESSION_COOKIE}=already-closed`],
  ])("still responds 204 and clears the cookie when %s", async (_case, cookie) => {
    const response = await logout(cookie);

    expect(response.status).toBe(204);
    expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
  });
});
