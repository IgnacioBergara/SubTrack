import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/infrastructure/prisma/client";
import { POST } from "./route";

function register(body: unknown): Promise<Response> {
  return POST(
    new Request("http://localhost/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

beforeEach(async () => {
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("POST /api/auth/register", () => {
  describe("valid registration (RF-04)", () => {
    it("responds 201 with the new user's id and normalized email", async () => {
      const response = await register({ email: " Ana@Example.com ", password: "s3cret-pass" });

      expect(response.status).toBe(201);
      expect(await response.json()).toEqual({
        user: { id: expect.any(String), email: "ana@example.com" },
      });
    });

    it("stores the password as a bcrypt hash", async () => {
      await register({ email: "ana@example.com", password: "s3cret-pass" });

      const stored = await prisma.user.findUniqueOrThrow({ where: { email: "ana@example.com" } });
      expect(stored.passwordHash).toMatch(/^\$2[aby]\$/);
      expect(stored.passwordHash).not.toContain("s3cret-pass");
    });

    it("never includes the password or its hash in the response", async () => {
      const response = await register({ email: "ana@example.com", password: "s3cret-pass" });

      const body = await response.text();
      expect(body).not.toContain("s3cret-pass");
      expect(body).not.toContain("passwordHash");
      expect(body).not.toContain("$2");
    });
  });

  describe("rejected registration", () => {
    it("responds 400 with every validation error", async () => {
      const response = await register({ email: "not-an-email", password: "short" });

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ errors: ["EMAIL_INVALID", "PASSWORD_TOO_SHORT"] });
    });

    it("responds 409 when the email is already registered", async () => {
      await register({ email: "ana@example.com", password: "s3cret-pass" });

      const response = await register({ email: "ANA@example.com", password: "other-pass" });

      expect(response.status).toBe(409);
      expect(await response.json()).toEqual({ errors: ["EMAIL_TAKEN"] });
    });
  });

  describe("request body validation (RNF-04)", () => {
    it("responds 400 when the body is not valid JSON", async () => {
      const response = await register("{ not json");

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ errors: ["INVALID_BODY"] });
    });

    it("responds 400 when a field is missing", async () => {
      const response = await register({ email: "ana@example.com" });

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ errors: ["INVALID_BODY"] });
    });

    it("responds 400 when a field is not a string", async () => {
      const response = await register({ email: "ana@example.com", password: 12345678 });

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ errors: ["INVALID_BODY"] });
    });

    it("responds 400 when the body is not an object", async () => {
      const response = await register(["ana@example.com", "s3cret-pass"]);

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ errors: ["INVALID_BODY"] });
    });

    it("does not store anything for a rejected request", async () => {
      await register({ email: "not-an-email", password: "short" });

      expect(await prisma.user.count()).toBe(0);
    });
  });
});
