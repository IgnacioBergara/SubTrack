import { describe, expect, it } from "vitest";
import { SystemClock } from "./system-clock";

describe("SystemClock (RNF-08)", () => {
  it("returns the current instant", () => {
    const before = Date.now();
    const now = new SystemClock().now().getTime();
    const after = Date.now();

    expect(now).toBeGreaterThanOrEqual(before);
    expect(now).toBeLessThanOrEqual(after);
  });
});
