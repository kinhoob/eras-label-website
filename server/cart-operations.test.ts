import { describe, expect, it } from "vitest";
import { removeCartLine, updateCartLineQuantity } from "../client/src/lib/cart-operations";

type TestLine = {
  id: number;
  size: string;
  quantity: number;
  name: string;
};

describe("cart variation identity", () => {
  it("updates every matching product-size line without using a color dimension", () => {
    const cart: TestLine[] = [
      { id: 10, size: "M", quantity: 1, name: "Camiseta" },
      { id: 10, size: "G", quantity: 2, name: "Camiseta" },
    ];

    expect(updateCartLineQuantity(cart, 10, "G", 1)).toEqual([
      cart[0],
      { ...cart[1], quantity: 3 },
    ]);
  });

  it("removes only the requested product-size line", () => {
    const cart: TestLine[] = [
      { id: 10, size: "G", quantity: 1, name: "Camiseta" },
      { id: 10, size: "M", quantity: 1, name: "Camiseta" },
    ];

    expect(removeCartLine(cart, 10, "G")).toEqual([cart[1]]);
    expect(removeCartLine(cart, 10, "M")).toEqual([cart[0]]);
  });
});
