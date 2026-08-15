import { describe, expect, it } from "vitest";
import { removeCartLine, updateCartLineQuantity } from "./cart-operations";

type TestLine = { id: number; size: string; quantity: number; name: string };

const cart: TestLine[] = [
  { id: 1, size: "M", quantity: 1, name: "Paradox" },
  { id: 1, size: "G", quantity: 2, name: "Paradox" },
  { id: 2, size: "Único", quantity: 1, name: "Boné" },
];

describe("cart operations", () => {
  it("updates only the selected product-size line and removes it at zero", () => {
    expect(updateCartLineQuantity(cart, 1, "G", 1)).toEqual([
      cart[0],
      { ...cart[1], quantity: 3 },
      cart[2],
    ]);
    expect(updateCartLineQuantity(cart, 1, "M", -1)).toEqual([cart[1], cart[2]]);
  });

  it("removes only the selected size variant", () => {
    expect(removeCartLine(cart, 1, "M")).toEqual([cart[1], cart[2]]);
    expect(removeCartLine(cart, 999, "M")).toEqual(cart);
  });

  it("ignores an invalid or zero quantity delta", () => {
    expect(updateCartLineQuantity(cart, 1, "M", 0)).toBe(cart);
    expect(updateCartLineQuantity(cart, 1, "M", Number.NaN)).toBe(cart);
  });
});
