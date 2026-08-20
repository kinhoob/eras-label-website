import { describe, expect, it } from "vitest";
import { buildShippingQuoteProducts } from "./routers";

describe("buildShippingQuoteProducts", () => {
  it("aplica as dimensões do pacote a cada linha e distribui o peso total pela quantidade", () => {
    const products = buildShippingQuoteProducts(
      [
        { id: "camiseta-1", price: 149.9, quantity: 2 },
        { id: "bone-1", price: 89.9, quantity: 1 },
      ],
      { widthCm: 20, heightCm: 5, lengthCm: 32, weightGrams: 900 },
    );

    expect(products).toEqual([
      {
        id: "camiseta-1",
        width: 20,
        height: 5,
        length: 32,
        weight: 0.3,
        insurance_value: 149.9,
        quantity: 2,
      },
      {
        id: "bone-1",
        width: 20,
        height: 5,
        length: 32,
        weight: 0.3,
        insurance_value: 89.9,
        quantity: 1,
      },
    ]);
  });

  it("mantém um padrão conservador quando a cotação pública não recebe pacote explícito", () => {
    const products = buildShippingQuoteProducts([{ id: "produto-1", price: 100, quantity: 1 }]);

    expect(products[0]).toMatchObject({
      width: 15,
      height: 5,
      length: 20,
      weight: 0.3,
      quantity: 1,
    });
  });
});
