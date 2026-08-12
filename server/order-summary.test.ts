import { describe, expect, it } from "vitest";
import { createOrderSummary } from "../client/src/lib/order-summary";

describe("createOrderSummary", () => {
  const item = {
    id: 7,
    name: "Camiseta Paradoxo",
    size: "M",
    quantity: 2,
    price: 189,
    image: "/product.jpg",
    alt: "Camiseta Paradoxo",
  };

  it("preserves items and calculates total quantity", () => {
    const summary = createOrderSummary({
      items: [item],
      subtotal: 378,
      discount: 37.8,
      shippingCost: 0,
      total: 340.2,
      paymentMethod: "pix",
      estimatedDelivery: "3 a 5 dias uteis",
    });

    expect(summary.items).toEqual([item]);
    expect(summary.totalItems).toBe(2);
    expect(summary.total).toBe(340.2);
    expect(summary.paymentMethod).toBe("pix");
    expect(summary.estimatedDelivery).toBe("3 a 5 dias uteis");
  });

  it("uses a default estimate when the carrier returns no deadline", () => {
    const summary = createOrderSummary({
      items: [],
      subtotal: 0,
      discount: 0,
      shippingCost: 0,
      total: 0,
      paymentMethod: "credit_card",
      estimatedDelivery: "   ",
    });

    expect(summary.totalItems).toBe(0);
    expect(summary.estimatedDelivery).toMatch(/^4 a 8 dias/);
  });
});
