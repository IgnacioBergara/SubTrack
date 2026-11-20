import { describe, expect, it } from "vitest";
import { nextRenewal } from "./next-renewal";

describe("nextRenewal", () => {
  describe("monthly cycle (RN-02)", () => {
    it("returns the next monthly date after today counting from the start date", () => {
      expect(nextRenewal("2026-01-15", "monthly", "2026-11-20")).toBe("2026-12-15");
    });

    it("returns this month's date when the renewal day has not arrived yet", () => {
      expect(nextRenewal("2026-01-15", "monthly", "2026-11-14")).toBe("2026-11-15");
    });

    it("skips to the next cycle when today is the renewal day", () => {
      expect(nextRenewal("2026-01-15", "monthly", "2026-11-15")).toBe("2026-12-15");
    });

    it("rolls over into the next year", () => {
      expect(nextRenewal("2026-01-15", "monthly", "2026-12-20")).toBe("2027-01-15");
    });

    it("skips to the next cycle when the subscription starts today", () => {
      expect(nextRenewal("2026-11-20", "monthly", "2026-11-20")).toBe("2026-12-20");
    });

    it("returns the start date when the subscription starts in the future", () => {
      expect(nextRenewal("2026-12-05", "monthly", "2026-11-20")).toBe("2026-12-05");
    });
  });

  describe("month-end handling (RN-03)", () => {
    it("uses the last day of February when the start day does not exist", () => {
      expect(nextRenewal("2026-01-31", "monthly", "2026-02-01")).toBe("2026-02-28");
    });

    it("uses February 29 in a leap year", () => {
      expect(nextRenewal("2028-01-31", "monthly", "2028-02-01")).toBe("2028-02-29");
    });

    it("uses the last day of a 30-day month", () => {
      expect(nextRenewal("2026-03-31", "monthly", "2026-04-01")).toBe("2026-04-30");
    });

    it("returns to the original start day after a short month", () => {
      expect(nextRenewal("2026-01-31", "monthly", "2026-03-01")).toBe("2026-03-31");
    });
  });

  describe("weekly cycle", () => {
    it("returns the next date seven days apart from the start date", () => {
      expect(nextRenewal("2026-11-02", "weekly", "2026-11-20")).toBe("2026-11-23");
    });

    it("crosses month and year boundaries", () => {
      expect(nextRenewal("2026-12-28", "weekly", "2026-12-30")).toBe("2027-01-04");
    });
  });

  describe("quarterly cycle", () => {
    it("returns the next date three months apart from the start date", () => {
      expect(nextRenewal("2026-01-15", "quarterly", "2026-11-20")).toBe("2027-01-15");
    });

    it("uses the last day of the month when the start day does not exist", () => {
      expect(nextRenewal("2025-11-30", "quarterly", "2025-12-01")).toBe("2026-02-28");
    });
  });

  describe("yearly cycle", () => {
    it("returns this year's anniversary when it has not passed yet", () => {
      expect(nextRenewal("2025-12-01", "yearly", "2026-11-20")).toBe("2026-12-01");
    });

    it("returns next year's anniversary when this year's has passed", () => {
      expect(nextRenewal("2020-03-10", "yearly", "2026-11-20")).toBe("2027-03-10");
    });

    it("uses February 28 for a February 29 start in a non-leap year", () => {
      expect(nextRenewal("2024-02-29", "yearly", "2024-03-01")).toBe("2025-02-28");
    });

    it("returns to February 29 in the next leap year", () => {
      expect(nextRenewal("2024-02-29", "yearly", "2027-03-01")).toBe("2028-02-29");
    });
  });
});
