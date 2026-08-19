import { describe, expect, it } from "vitest";
import { buildInstallmentOptions, calculateInstallmentAmount, calculateInstallmentTotal } from "./installment-calculator";

describe("installment calculator", () => {
  it("keeps one installment without interest unchanged", () => {
    expect(calculateInstallmentTotal(100, 1, 2)).toBe(100);
    expect(calculateInstallmentAmount(100, 1)).toBe(100);
  });

  it("keeps installments within interest-free window without interest", () => {
    expect(calculateInstallmentTotal(100, 3, 10, 3)).toBe(100);
    expect(calculateInstallmentTotal(100, 4, 10, 3)).toBeCloseTo(110);
  });

  it("builds bounded installment options with interest-free threshold", () => {
    const options = buildInstallmentOptions(200, 30, 1, 3);
    expect(options).toHaveLength(24);
    expect(options[0]).toMatchObject({ installments: 1, total: 200, amount: 200, interest: 0 });
    expect(options[2]).toMatchObject({ installments: 3, total: 200, interest: 0, isInterestFree: true });
    expect(options[3].interest).toBeGreaterThan(0);
  });
});
