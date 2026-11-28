import { describe, expect, it } from "vitest";
import { CryptoSessionTokens } from "./crypto-session-tokens";

const tokens = new CryptoSessionTokens();

describe("CryptoSessionTokens", () => {
  describe("generate", () => {
    it("returns 32 random bytes encoded as URL-safe base64, ready for a cookie", () => {
      expect(tokens.generate()).toMatch(/^[A-Za-z0-9_-]{43}$/);
    });

    it("never repeats a token", () => {
      const generated = new Set(Array.from({ length: 1000 }, () => tokens.generate()));

      expect(generated.size).toBe(1000);
    });
  });

  describe("hash", () => {
    it("is the SHA-256 of the token in hex", () => {
      expect(tokens.hash("abc")).toBe(
        "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
      );
    });

    it("is deterministic, so a token can be looked up by its hash", () => {
      const token = tokens.generate();

      expect(tokens.hash(token)).toBe(tokens.hash(token));
    });

    it("gives different hashes for different tokens", () => {
      expect(tokens.hash(tokens.generate())).not.toBe(tokens.hash(tokens.generate()));
    });
  });
});
