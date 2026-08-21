import { describe, expect, it, vi } from "vitest";
import { createManualOrder } from "./db";
import { orders, productVariations, products } from "../drizzle/schema";

const manualInput = {
  customerName: "Cliente Manual",
  customerEmail: "manual-retry@example.com",
  customerCpf: "12345678909",
  phone: "81999999999",
  shippingAddress: {
    street: "Rua Herculano Bandeira",
    number: "74",
    neighborhood: "Sítio Novo",
    city: "Olinda",
    state: "PE",
    postalCode: "53110380",
  },
  items: [{ productId: 1, name: "Camisa Oficial", size: "M", quantity: 1, price: 100 }],
  shippingMethod: "PAC",
  paymentMethod: "pix",
  shippingCost: "20.00",
  discount: "0.00",
  subtotal: "100.00",
  total: "120.00",
  status: "Aguardando pagamento",
  paymentStatus: "pending",
} as any;

describe("createManualOrder e retry de orderNumber", () => {
  it("retorna o mesmo número persistido quando o trustedOrderNumber colide", async () => {
    const persistedOrder = {
      ...manualInput,
      id: 44,
      orderNumber: "ER-2026-044",
      createdAt: new Date(),
      updatedAt: new Date(),
      items: manualInput.items,
      shippingAddress: manualInput.shippingAddress,
    };
    let insertAttempts = 0;

    const fakeDb = {
      select: () => ({
        from: (table: unknown) => ({
          where: () => ({
            limit: async () => {
              if (table === products) return [{ id: 1, name: "Camisa Oficial", status: "active", visibility: "visible" }];
              if (table === productVariations) return [{ id: 9, productId: 1, size: "M", stock: 5 }];
              return [persistedOrder];
            },
          }),
        }),
      }),
      update: () => ({
        set: () => ({
          where: async () => undefined,
        }),
      }),
      insert: (table: unknown) => ({
        values: async () => {
          if (table !== orders) return undefined;
          insertAttempts += 1;
          if (insertAttempts === 1) {
            const error = new Error("Duplicate entry 'ER-2026-043' for key orders.order_number_unique") as Error & { code: string };
            error.code = "ER_DUP_ENTRY";
            throw error;
          }
          return undefined;
        },
      }),
    };

    const nextOrderNumber = vi.fn().mockResolvedValue("ER-2026-044");
    const result = await createManualOrder(manualInput, "ER-2026-043", fakeDb, nextOrderNumber);

    expect(insertAttempts).toBe(2);
    expect(nextOrderNumber).toHaveBeenCalledTimes(1);
    expect(result?.orderNumber).toBe("ER-2026-044");
    expect(result?.orderNumber).toBe(persistedOrder.orderNumber);
  });
});

