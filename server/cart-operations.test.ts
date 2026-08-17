import { describe, expect, it } from "vitest";
import { removeCartLine, updateCartLineQuantity } from "../client/src/lib/cart-operations";

type TestLine = {
  id: number;
  size: string;
  color?: string;
  quantity: number;
  name: string;
};

describe("cart variation identity", () => {
  it("updates only the selected size and color combination", () => {
    const cart: TestLine[] = [
      { id: 10, size: "M", color: "Preto", quantity: 1, name: "Camiseta" },
      { id: 10, size: "M", color: "Branco", quantity: 2, name: "Camiseta" },
    ];

    expect(updateCartLineQuantity(cart, 10, "M", 1, "Branco")).toEqual([
      cart[0],
      { ...cart[1], quantity: 3 },
    ]);
  });

  it("removes only the requested variation and preserves legacy no-color lines", () => {
    const cart: TestLine[] = [
      { id: 10, size: "G", quantity: 1, name: "Camiseta legada" },
      { id: 10, size: "G", color: "Branco", quantity: 1, name: "Camiseta" },
    ];

    expect(removeCartLine(cart, 10, "G", "Branco")).toEqual([cart[0]]);
    expect(removeCartLine(cart, 10, "G")).toEqual([cart[1]]);
  });
});
