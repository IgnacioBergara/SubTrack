import { describe, expect, it } from "vitest";
import { BcryptPasswordHasher } from "./bcrypt-password-hasher";

// Costo mínimo de bcrypt para que los tests no tarden; el de producción se prueba aparte.
const hasher = new BcryptPasswordHasher(4);

describe("BcryptPasswordHasher", () => {
  describe("hash (RNF-04)", () => {
    it("produces a bcrypt hash instead of the plain password", async () => {
      const hash = await hasher.hash("s3cret-pass");

      expect(hash).not.toContain("s3cret-pass");
      expect(hash).toMatch(/^\$2[aby]\$04\$/);
    });

    it("produces a different hash each time thanks to the random salt", async () => {
      expect(await hasher.hash("s3cret-pass")).not.toBe(await hasher.hash("s3cret-pass"));
    });

    it("uses a cost of 12 by default", async () => {
      const hash = await new BcryptPasswordHasher().hash("s3cret-pass");

      expect(hash).toMatch(/^\$2[aby]\$12\$/);
    });
  });

  describe("verify", () => {
    it("accepts the password that produced the hash", async () => {
      const hash = await hasher.hash("s3cret-pass");

      expect(await hasher.verify("s3cret-pass", hash)).toBe(true);
    });

    it("rejects a different password", async () => {
      const hash = await hasher.hash("s3cret-pass");

      expect(await hasher.verify("wrong-pass", hash)).toBe(false);
    });

    it("rejects a password that differs only in case", async () => {
      const hash = await hasher.hash("s3cret-pass");

      expect(await hasher.verify("S3CRET-PASS", hash)).toBe(false);
    });
  });
});
