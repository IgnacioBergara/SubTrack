import { describe, expect, it } from "vitest";
import { BILLING_CYCLES } from "./billing-cycle";
import { type SubscriptionInput, validateSubscription } from "./subscription-validation";

const validInput: SubscriptionInput = { name: "Netflix", amountCents: 1_099, cycle: "monthly" };

function errorsFor(overrides: Partial<SubscriptionInput>) {
  const result = validateSubscription({ ...validInput, ...overrides });
  return result.ok ? [] : result.errors;
}

describe("validateSubscription", () => {
  describe("valid input", () => {
    it("accepts a subscription with name, positive amount and known cycle", () => {
      expect(validateSubscription(validInput)).toEqual({
        ok: true,
        value: { name: "Netflix", amountCents: 1_099, cycle: "monthly" },
      });
    });

    it.each(BILLING_CYCLES)("accepts the %s cycle (RN-01)", (cycle) => {
      expect(validateSubscription({ ...validInput, cycle }).ok).toBe(true);
    });

    it("trims surrounding whitespace from the name", () => {
      const result = validateSubscription({ ...validInput, name: "  Spotify  " });
      expect(result.ok && result.value.name).toBe("Spotify");
    });
  });

  describe("name (RN-05)", () => {
    it("rejects an empty name", () => {
      expect(errorsFor({ name: "" })).toEqual(["NAME_REQUIRED"]);
    });

    it("rejects a name made only of whitespace", () => {
      expect(errorsFor({ name: "   " })).toEqual(["NAME_REQUIRED"]);
    });
  });

  describe("amount (RN-05)", () => {
    it("rejects an amount of zero", () => {
      expect(errorsFor({ amountCents: 0 })).toEqual(["AMOUNT_NOT_POSITIVE"]);
    });

    it("rejects a negative amount", () => {
      expect(errorsFor({ amountCents: -500 })).toEqual(["AMOUNT_NOT_POSITIVE"]);
    });

    it("rejects an amount with fractions of a cent", () => {
      expect(errorsFor({ amountCents: 10.99 })).toEqual(["AMOUNT_NOT_INTEGER"]);
    });

    it("rejects an amount that is not a number", () => {
      expect(errorsFor({ amountCents: Number.NaN })).toEqual(["AMOUNT_NOT_INTEGER"]);
    });
  });

  describe("cycle (RN-01)", () => {
    it("rejects an unknown cycle", () => {
      expect(errorsFor({ cycle: "daily" })).toEqual(["CYCLE_INVALID"]);
    });

    it("rejects a cycle with different casing", () => {
      expect(errorsFor({ cycle: "Monthly" })).toEqual(["CYCLE_INVALID"]);
    });
  });

  it("reports every error at once when several fields are invalid", () => {
    expect(errorsFor({ name: "", amountCents: 0, cycle: "daily" })).toEqual([
      "NAME_REQUIRED",
      "AMOUNT_NOT_POSITIVE",
      "CYCLE_INVALID",
    ]);
  });
});
