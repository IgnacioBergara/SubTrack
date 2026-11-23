import { describe, expect, it } from "vitest";
import { type RegistrationInput, validateRegistration } from "./registration-validation";

const validInput: RegistrationInput = { email: "ana@example.com", password: "s3cret-pass" };

function errorsFor(overrides: Partial<RegistrationInput>) {
  const result = validateRegistration({ ...validInput, ...overrides });
  return result.ok ? [] : result.errors;
}

describe("validateRegistration", () => {
  describe("valid input", () => {
    it("accepts a well-formed email and a long enough password", () => {
      expect(validateRegistration(validInput)).toEqual({
        ok: true,
        value: { email: "ana@example.com", password: "s3cret-pass" },
      });
    });

    it("normalizes the email to lowercase without surrounding whitespace", () => {
      const result = validateRegistration({ ...validInput, email: "  Ana.Perez@Example.COM " });
      expect(result.ok && result.value.email).toBe("ana.perez@example.com");
    });

    it("keeps the password exactly as typed", () => {
      const result = validateRegistration({ ...validInput, password: "  Mixed Case  " });
      expect(result.ok && result.value.password).toBe("  Mixed Case  ");
    });
  });

  describe("email", () => {
    it("rejects an empty email", () => {
      expect(errorsFor({ email: "" })).toEqual(["EMAIL_INVALID"]);
    });

    it("rejects an email without @", () => {
      expect(errorsFor({ email: "ana.example.com" })).toEqual(["EMAIL_INVALID"]);
    });

    it("rejects an email without a domain extension", () => {
      expect(errorsFor({ email: "ana@example" })).toEqual(["EMAIL_INVALID"]);
    });

    it("rejects an email with spaces inside", () => {
      expect(errorsFor({ email: "ana perez@example.com" })).toEqual(["EMAIL_INVALID"]);
    });
  });

  describe("password (RF-04)", () => {
    it("accepts a password of exactly 8 characters", () => {
      expect(errorsFor({ password: "12345678" })).toEqual([]);
    });

    it("rejects a password of 7 characters", () => {
      expect(errorsFor({ password: "1234567" })).toEqual(["PASSWORD_TOO_SHORT"]);
    });

    it("accepts a password of exactly 72 bytes", () => {
      expect(errorsFor({ password: "a".repeat(72) })).toEqual([]);
    });

    it("rejects a password longer than 72 bytes", () => {
      expect(errorsFor({ password: "a".repeat(73) })).toEqual(["PASSWORD_TOO_LONG"]);
    });

    it("measures the length limit in bytes, not characters", () => {
      // "ñ" ocupa 2 bytes en UTF-8: 37 caracteres = 74 bytes.
      expect(errorsFor({ password: "ñ".repeat(37) })).toEqual(["PASSWORD_TOO_LONG"]);
    });
  });

  it("reports every error at once when both fields are invalid", () => {
    expect(errorsFor({ email: "not-an-email", password: "short" })).toEqual([
      "EMAIL_INVALID",
      "PASSWORD_TOO_SHORT",
    ]);
  });
});
