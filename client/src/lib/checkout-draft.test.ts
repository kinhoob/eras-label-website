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
  it("persiste e recupera cupão, método de pagamento e CEP", () => {
    const storage = createStorage();
    saveCheckoutDraft({ coupon: "ERAS10", couponApplied: true, selectedPaymentMethod: "credit_card", shippingCep: "50.010-000" }, storage);
    expect(storage.getItem(CHECKOUT_DRAFT_STORAGE_KEY)).toContain("ERAS10");
    expect(loadCheckoutDraft(storage)).toEqual({ coupon: "ERAS10", couponApplied: true, selectedPaymentMethod: "credit_card", shippingCep: "50010000" });
  });

  it("normaliza dados inválidos sem quebrar a navegação", () => {
    const storage = createStorage();
    storage.setItem(CHECKOUT_DRAFT_STORAGE_KEY, JSON.stringify({ coupon: 42, couponApplied: "yes", selectedPaymentMethod: "unknown", shippingCep: { value: 1 } }));
    expect(loadCheckoutDraft(storage)).toEqual({ coupon: "", couponApplied: false, selectedPaymentMethod: "pix", shippingCep: "" });
  });

  it("limpa o rascunho após uma compra concluída", () => {
    const storage = createStorage();
    saveCheckoutDraft({ coupon: "ERAS10", couponApplied: true, selectedPaymentMethod: "pix", shippingCep: "50010000" }, storage);
    clearCheckoutDraft(storage);
    expect(loadCheckoutDraft(storage)).toEqual({});
  });
});
