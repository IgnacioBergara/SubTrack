import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { BcryptPasswordHasher } from "@/infrastructure/bcrypt-password-hasher";
import { CryptoSessionTokens } from "@/infrastructure/crypto-session-tokens";
import { prisma } from "@/infrastructure/prisma/client";
import { SESSION_COOKIE } from "../session-cookie";
import { POST } from "./route";

const INVALID_CREDENTIALS = { errors: ["INVALID_CREDENTIALS"] };
const INVALID_BODY = { errors: ["INVALID_BODY"] };

function login(body: unknown): Promise<Response> {
  return POST(
    new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

/** Separa "nombre=valor; Attr; Attr=x" en el valor y sus atributos. */
function parseSetCookie(header: string | null) {
  const [pair = "", ...attributes] = (header ?? "").split(";").map((part) => part.trim());
  const [name, ...value] = pair.split("=");
  return { name, value: value.join("="), attributes };
}

beforeEach(async () => {
  // Borrar los usuarios arrastra sus sesiones.
  await prisma.user.deleteMany();
  await prisma.user.create({
    data: {
      email: "ana@example.com",
      // Costo bajo para el test; verify usa el costo que trae el hash.
      passwordHash: await new BcryptPasswordHasher(4).hash("s3cret-pass"),
    },
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("POST /api/auth/login", () => {
  describe("valid credentials (RF-05)", () => {
    it("responds 200 with the session expiration", async () => {
      const response = await login({ email: "ana@example.com", password: "s3cret-pass" });

      expect(response.status).toBe(200);
      const session = await prisma.session.findFirstOrThrow();
      expect(await response.json()).toEqual({ expiresAt: session.expiresAt.toISOString() });
    });

    it("sets the session token in an HttpOnly, Secure, SameSite=Lax cookie for the whole site", async () => {
      const response = await login({ email: "ana@example.com", password: "s3cret-pass" });

      const cookie = parseSetCookie(response.headers.get("set-cookie"));
      expect(cookie.name).toBe(SESSION_COOKIE);
      expect(cookie.attributes).toEqual(
        expect.arrayContaining(["HttpOnly", "Secure", "SameSite=Lax", "Path=/"]),
      );
    });

    it("makes the cookie expire together with the session", async () => {
      const response = await login({ email: "ana@example.com", password: "s3cret-pass" });

      const cookie = parseSetCookie(response.headers.get("set-cookie"));
      const expires = cookie.attributes.find((a) => a.startsWith("Expires="))?.slice(8);
      const session = await prisma.session.findFirstOrThrow();
      expect(expires).toBe(session.expiresAt.toUTCString());
    });

    it("stores only the hash of the token sent in the cookie", async () => {
      const response = await login({ email: "ana@example.com", password: "s3cret-pass" });

      const { value: token } = parseSetCookie(response.headers.get("set-cookie"));
      const session = await prisma.session.findFirstOrThrow();
      expect(session.tokenHash).toBe(new CryptoSessionTokens().hash(token));
      expect(session.tokenHash).not.toBe(token);
    });

    it("never exposes the token in the response body", async () => {
      const response = await login({ email: "ana@example.com", password: "s3cret-pass" });

      const { value: token } = parseSetCookie(response.headers.get("set-cookie"));
      expect(token).not.toBe("");
      expect(await response.text()).not.toContain(token);
    });
  });

  describe("invalid credentials (RF-05)", () => {
    it("responds 401 for a wrong password", async () => {
      const response = await login({ email: "ana@example.com", password: "wrong-pass" });

      expect(response.status).toBe(401);
      expect(await response.json()).toEqual(INVALID_CREDENTIALS);
    });

    it("responds exactly the same for an unknown email", async () => {
      const response = await login({ email: "nobody@example.com", password: "s3cret-pass" });

      expect(response.status).toBe(401);
      expect(await response.json()).toEqual(INVALID_CREDENTIALS);
    });

    it("sets no cookie and creates no session", async () => {
      const wrongPassword = await login({ email: "ana@example.com", password: "wrong-pass" });
      const unknownEmail = await login({ email: "nobody@example.com", password: "s3cret-pass" });

      expect(wrongPassword.headers.get("set-cookie")).toBeNull();
      expect(unknownEmail.headers.get("set-cookie")).toBeNull();
      expect(await prisma.session.count()).toBe(0);
    });
  });

  describe("request body validation (RNF-04)", () => {
    it.each([
      ["is not valid JSON", "{ not json"],
      ["is missing a field", { email: "ana@example.com" }],
      ["has a non-string field", { email: "ana@example.com", password: 12345678 }],
      ["is not an object", ["ana@example.com", "s3cret-pass"]],
    ])("responds 400 when the body %s", async (_case, body) => {
      const response = await login(body);

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual(INVALID_BODY);
    });
  });
});
