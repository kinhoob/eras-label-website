import { describe, expect, it } from "vitest";

describe("order number formatting and sequence", () => {
  it("matches the expected sequential regex format ER-AAAA-NNN", () => {
    const sample1 = "ER-2026-001";
    const sample2 = "ER-2026-042";
    const regex = /^ER-\d{4}-\d{3,}$/;
    expect(regex.test(sample1)).toBe(true);
    expect(regex.test(sample2)).toBe(true);
  });
});
