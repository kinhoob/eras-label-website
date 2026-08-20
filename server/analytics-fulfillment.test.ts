import { describe, expect, it } from "vitest";
import { getNextFulfillmentStatus, resolveAnalyticsRange } from "./db";

describe("analytics range resolution", () => {
  const now = Date.UTC(2026, 7, 20, 15, 0, 0);

  it("uses a stable rolling interval for preset periods", () => {
    const range = resolveAnalyticsRange(7, undefined, now);

    expect(range.cutoff).toBe(now - 7 * 24 * 60 * 60 * 1000);
    expect(range.rangeEnd).toBe(now);
    expect(range.effectivePeriodDays).toBe(7);
    expect(range.hasCustomRange).toBe(false);
  });

  it("keeps an inclusive custom date range and calculates its effective days", () => {
    const startAt = Date.UTC(2026, 7, 18, 0, 0, 0);
    const endAt = Date.UTC(2026, 7, 20, 23, 59, 59, 999);
    const range = resolveAnalyticsRange(7, { startAt, endAt }, now);

    expect(range.cutoff).toBe(startAt);
    expect(range.rangeEnd).toBe(now);
    expect(range.effectivePeriodDays).toBe(3);
    expect(range.hasCustomRange).toBe(true);
  });

  it("falls back to a safe preset when a custom interval is invalid", () => {
    const range = resolveAnalyticsRange(15, { startAt: now, endAt: now - 1 }, now);

    expect(range.hasCustomRange).toBe(false);
    expect(range.effectivePeriodDays).toBe(15);
    expect(range.cutoff).toBe(now - 15 * 24 * 60 * 60 * 1000);
  });
});

describe("fulfillment lifecycle", () => {
  it("exposes only the next operational action", () => {
    expect(getNextFulfillmentStatus("pending_packaging")).toBe("packed");
    expect(getNextFulfillmentStatus("packed")).toBe("shipped");
    expect(getNextFulfillmentStatus("shipped")).toBe("archived");
    expect(getNextFulfillmentStatus("archived")).toBeNull();
  });
});
