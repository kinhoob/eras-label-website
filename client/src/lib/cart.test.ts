import { describe, expect, it } from "vitest";
import { getCartItemCount } from "./cart";

describe("getCartItemCount", () => {
  it("sums all units across cart lines", () => {
    expect(getCartItemCount([{ quantity: 1 }, { quantity: 2 }, { quantity: 3 }])).toBe(6);
  });

  it("returns zero for an empty cart", () => {
    expect(getCartItemCount([])).toBe(0);
  });

  it("does not count negative quantities", () => {
    expect(getCartItemCount([{ quantity: 2 }, { quantity: -4 }])).toBe(2);
  });
});
