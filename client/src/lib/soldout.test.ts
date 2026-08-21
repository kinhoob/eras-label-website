import { describe, expect, it } from "vitest";
import { getSoldOutCardState, isSoldOutProduct } from "./soldout";

describe("estado público de produto esgotado", () => {
  it("mantém o produto visível, mas bloqueia compra quando o estoque agregado é zero", () => {
    expect(isSoldOutProduct({ stock: 0 })).toBe(true);
    expect(getSoldOutCardState({ stock: 0 })).toEqual({ soldOut: true, canAddToCart: false, badge: "ESGOTADO" });
  });

  it("considera o status soldout autoritativo e não confunde estoque positivo com produto disponível", () => {
    expect(isSoldOutProduct({ status: "soldout", stock: 12 })).toBe(true);
    expect(getSoldOutCardState({ status: "active", stock: 12 })).toEqual({ soldOut: false, canAddToCart: true, badge: null });
  });

  it("só marca variações como esgotadas quando todas estão sem estoque", () => {
    expect(isSoldOutProduct({ variations: [{ stock: 0 }, { stock: 0 }] })).toBe(true);
    expect(isSoldOutProduct({ variations: [{ stock: 0 }, { stock: 1 }] })).toBe(false);
  });
});
