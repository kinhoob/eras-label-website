import { describe, expect, it } from "vitest";
import { aggregateVariationStock, resolveAnalyticsRange } from "./db";
import { isGroundedAiSummary } from "./analytics-grounding";

describe("analytics range resolution", () => {
  const day = 24 * 60 * 60 * 1000;
  const now = Date.parse("2026-08-20T12:00:00.000Z");

  it("resolves preset periods from the current timestamp", () => {
    const range = resolveAnalyticsRange(7, undefined, now);

    expect(range.cutoff).toBe(now - 7 * day);
    expect(range.rangeEnd).toBe(now);
    expect(range.effectivePeriodDays).toBe(7);
    expect(range.hasCustomRange).toBe(false);
  });

  it("clamps a custom period to now and calculates its effective days", () => {
    const range = resolveAnalyticsRange(30, {
      startAt: Date.parse("2026-08-15T00:00:00.000Z"),
      endAt: Date.parse("2026-08-25T00:00:00.000Z"),
    }, now);

    expect(range.cutoff).toBe(Date.parse("2026-08-15T00:00:00.000Z"));
    expect(range.rangeEnd).toBe(now);
    expect(range.effectivePeriodDays).toBe(6);
    expect(range.hasCustomRange).toBe(true);
  });

  it("falls back to a one-day period for invalid or non-positive preset values", () => {
    const invalid = resolveAnalyticsRange(0, undefined, now);
    const nonNumeric = resolveAnalyticsRange(Number.NaN, undefined, now);

    expect(invalid.effectivePeriodDays).toBe(1);
    expect(nonNumeric.effectivePeriodDays).toBe(7);
  });
});

describe("analytics inventory aggregation", () => {
  it("sums real stock by product and ignores invalid or negative quantities", () => {
    const stock = aggregateVariationStock([
      { productId: 12, stock: 3 },
      { productId: 12, stock: 2 },
      { productId: 18, stock: -4 },
      { productId: 18, stock: 1 },
      { productId: null, stock: 99 },
      { productId: 21, stock: undefined },
    ]);

    expect(stock.get(12)).toBe(5);
    expect(stock.get(18)).toBe(1);
    expect(stock.get(21)).toBe(0);
    expect(stock.has(0)).toBe(false);
  });
});

describe("grounded AI analytics", () => {
  it("accepts only numbers present in the real analytics payload", () => {
    expect(isGroundedAiSummary(
      "Foram registados 3 pedidos, receita de R$ 2,80 e conversão de 27,27%.",
      [0, 2, 3, 2.8, 27.27],
      [27.27],
    )).toBe(true);
  });

  it("rejects external benchmarks and unsupported projections", () => {
    expect(isGroundedAiSummary(
      "A média de mercado fica entre 1% e 3%; o estoque durará 13,3 dias.",
      [0, 2, 3, 2.8, 27.27],
      [27.27],
    )).toBe(false);
  });
});
