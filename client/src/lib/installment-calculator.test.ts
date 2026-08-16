import { describe, expect, it } from "vitest";
import { buildInstallmentOptions, calculateInstallmentAmount, calculateInstallmentTotal } from "./installment-calculator";

describe("installment calculator", () => {
  it("keeps one installment without interest unchanged", () => {
    expect(calculateInstallmentTotal(100, 1, 2)).toBe(100);
    expect(calculateInstallmentAmount(100, 1)).toBe(100);
  });

  it("applies compound monthly interest transparently", () => {
    expect(calculateInstallmentTotal(100, 2, 10)).toBeCloseTo(121);
    expect(calculateInstallmentAmount(100, 2)).toBe(50);
  });

  it("builds bounded installment options with interest values", () => {
    const options = buildInstallmentOptions(200, 30, 1);
    expect(options).toHaveLength(24);
    expect(options[0]).toMatchObject({ installments: 1, total: 200, amount: 200, interest: 0 });
    expect(options[2].interest).toBeGreaterThan(0);
  });
});
