import { describe, expect, it } from "vitest";
import { createEmptyProductDraft, getProductDescriptionDraft, validateProductDraft } from "./product-editor";

describe("product editor draft", () => {
  it("starts without commercial text or prices pre-filled", () => {
    const draft = createEmptyProductDraft();

    expect(draft.name).toBe("");
    expect(draft.collection).toBe("");
    expect(draft.category).toBe("");
    expect(draft.description).toBe("");
    expect(draft.price).toBe("");
    expect(draft.pixPrice).toBe("");
    expect(draft.promotionalPrice).toBeNull();
    expect(draft.status).toBe("");
  });

  it("preserves an existing product description when opening the editor", () => {
    const savedDescription = "Descrição definida pelo administrador para esta peça.";

    expect(getProductDescriptionDraft(savedDescription)).toBe(savedDescription);
    expect(getProductDescriptionDraft(null)).toBe("");
    expect(getProductDescriptionDraft(undefined)).toBe("");
  });

  it("rejects an empty draft before any backend mutation", () => {
    expect(validateProductDraft(createEmptyProductDraft())).toBe("Informe o nome do produto antes de guardar.");
  });

  it("requires administrator-defined positive prices and status", () => {
    expect(validateProductDraft({ name: "Camiseta Eras", price: "", pixPrice: "", status: "Rascunho" }))
      .toBe("Defina um preço normal e um preço Pix válidos antes de guardar.");
    expect(validateProductDraft({ name: "Camiseta Eras", price: 120, pixPrice: 114, status: "" }))
      .toBe("Escolha o status do produto antes de guardar.");
  });

  it("accepts a complete draft chosen by the administrator", () => {
    expect(validateProductDraft({
      name: "Camiseta Eras",
      collection: "",
      category: "",
      description: "",
      price: 120,
      pixPrice: 114,
      status: "Rascunho",
    })).toBeNull();
  });
});
