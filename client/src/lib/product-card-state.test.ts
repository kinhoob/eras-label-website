import { describe, expect, it } from "vitest";
import { getPublicProductCardState } from "./product-card-state";

describe("estado comportamental dos cards públicos", () => {
  it("mantém a segunda foto disponível para hover e focus mesmo quando o produto está esgotado", () => {
    const state = getPublicProductCardState({
      name: "Camiseta Drafts",
      status: "soldout",
      stock: 0,
      images: ["principal.jpg", "modelo.jpg"],
    });

    expect(state.soldOut).toBe(true);
    expect(state.hasImageSwap).toBe(true);
    expect(state.secondaryImage).toBe("modelo.jpg");
    expect(state.revealsSecondaryOnHover).toBe(true);
    expect(state.revealsSecondaryOnFocus).toBe(true);
    expect(state.ariaLabel).toBe("Ver Camiseta Drafts — esgotado");
  });

  it("mantém a compra bloqueada antes e depois de qualquer interação visual", () => {
    const stateBeforeInteraction = getPublicProductCardState({ stock: 0, images: ["principal.jpg", "modelo.jpg"] });
    const stateAfterHover = getPublicProductCardState({ stock: 0, images: ["principal.jpg", "modelo.jpg"] });
    const stateAfterFocus = getPublicProductCardState({ stock: 0, images: ["principal.jpg", "modelo.jpg"] });

    expect(stateBeforeInteraction.canAddToCart).toBe(false);
    expect(stateAfterHover.canAddToCart).toBe(false);
    expect(stateAfterFocus.canAddToCart).toBe(false);
    expect(stateAfterHover.badge).toBe("ESGOTADO");
    expect(stateAfterFocus.badge).toBe("ESGOTADO");
  });

  it("não cria swap quando não existe segunda imagem utilizável", () => {
    expect(getPublicProductCardState({ stock: 0, images: ["principal.jpg", ""] }).hasImageSwap).toBe(false);
    expect(getPublicProductCardState({ stock: 4, images: ["principal.jpg"] }).hasImageSwap).toBe(false);
  });
});
