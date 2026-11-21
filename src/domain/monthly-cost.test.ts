import { describe, expect, it } from "vitest";
import { monthlyEquivalentCents } from "./monthly-cost";

describe("monthlyEquivalentCents", () => {
  describe("normalization by cycle (RN-04)", () => {
    it("keeps a monthly amount unchanged", () => {
      expect(monthlyEquivalentCents(999, "monthly")).toBe(999);
    });

    it("divides a yearly amount by 12", () => {
      expect(monthlyEquivalentCents(12_000, "yearly")).toBe(1_000);
    });

    it("divides a quarterly amount by 3", () => {
      expect(monthlyEquivalentCents(3_000, "quarterly")).toBe(1_000);
    });

    it("multiplies a weekly amount by 52 and divides it by 12", () => {
      expect(monthlyEquivalentCents(1_200, "weekly")).toBe(5_200);
    });
  });

  describe("rounding to 2 decimals (RF-02)", () => {
    it("rounds down when the fraction of a cent is below one half", () => {
      expect(monthlyEquivalentCents(1_000, "quarterly")).toBe(333);
    });

    it("rounds up when the fraction of a cent is above one half", () => {
      expect(monthlyEquivalentCents(2_000, "quarterly")).toBe(667);
    });

    it("rounds up when the fraction of a cent is exactly one half", () => {
      expect(monthlyEquivalentCents(1_806, "yearly")).toBe(151);
    });

    it("rounds a weekly amount that does not divide evenly", () => {
      expect(monthlyEquivalentCents(1_000, "weekly")).toBe(4_333);
    });
  });
});
