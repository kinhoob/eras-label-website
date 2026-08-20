import { describe, expect, it } from "vitest";
import { CHECKOUT_DRAFT_STORAGE_KEY, clearCheckoutDraft, loadCheckoutDraft, saveCheckoutDraft } from "./checkout-draft";

function createStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

describe("checkout draft", () => {
  it("persiste e recupera cupão, método de pagamento, CEP e referência válida", () => {
    const storage = createStorage();
    saveCheckoutDraft({ coupon: "ERAS10", couponApplied: true, couponDiscount: 24.9, couponFreeShipping: true, selectedPaymentMethod: "credit_card", shippingCep: "50.010-000", shippingMethod: "PAC", shippingOptionId: "pac-1", shippingCost: 0, shippingDeadline: "6 dias úteis", orderNumber: "ER-2026-1234" }, storage);
    expect(storage.getItem(CHECKOUT_DRAFT_STORAGE_KEY)).toContain("ERAS10");
    expect(loadCheckoutDraft(storage)).toEqual({ coupon: "ERAS10", couponApplied: true, couponDiscount: 24.9, couponFreeShipping: true, selectedPaymentMethod: "credit_card", shippingCep: "50010000", shippingMethod: "PAC", shippingOptionId: "pac-1", shippingCost: 0, shippingDeadline: "6 dias úteis", orderNumber: "ER-2026-1234" });
  });

  it("normaliza dados inválidos sem quebrar a navegação", () => {
    const storage = createStorage();
    storage.setItem(CHECKOUT_DRAFT_STORAGE_KEY, JSON.stringify({ coupon: 42, couponApplied: "yes", couponDiscount: -4, couponFreeShipping: "yes", selectedPaymentMethod: "unknown", shippingCep: { value: 1 }, shippingMethod: 5, shippingOptionId: 6, shippingCost: -2, shippingDeadline: 8, orderNumber: "PAYMENT-123" }));
    expect(loadCheckoutDraft(storage)).toEqual({ coupon: "", couponApplied: false, selectedPaymentMethod: "pix", shippingCep: "", orderNumber: "" });
  });

  it("limpa o rascunho após uma compra concluída", () => {
    const storage = createStorage();
    saveCheckoutDraft({ coupon: "ERAS10", couponApplied: true, selectedPaymentMethod: "pix", shippingCep: "50010000" }, storage);
    clearCheckoutDraft(storage);
    expect(loadCheckoutDraft(storage)).toEqual({});
  });
});
