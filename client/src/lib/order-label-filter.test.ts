import { describe, expect, it } from "vitest";
import { filterOrdersWithReadyLabels, hasReadyShippingLabel } from "./order-label-filter";

describe("order-label-filter", () => {
  it("considera pronto um pedido com PDF persistido ou ID de envio", () => {
    expect(hasReadyShippingLabel({ labelPdfUrl: "/manus-storage/label.pdf" })).toBe(true);
    expect(hasReadyShippingLabel({ shippingOrderId: "shipment-123" })).toBe(true);
    expect(hasReadyShippingLabel({ labelPdfUrl: "  " })).toBe(false);
    expect(hasReadyShippingLabel({})).toBe(false);
  });

  it("mantém a ordem e remove apenas pedidos sem etiqueta pronta", () => {
    const orders = [
      { id: 1, labelPdfUrl: "/manus-storage/one.pdf" },
      { id: 2 },
      { id: 3, shippingOrderId: "shipment-3" },
    ];

    expect(filterOrdersWithReadyLabels(orders).map((order) => order.id)).toEqual([1, 3]);
  });
});
