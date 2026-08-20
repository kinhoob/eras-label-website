import { describe, expect, it } from "vitest";
import { getProductDescription, hasSavedProductDescription } from "./product-content";

describe("conteúdo público do produto", () => {
  it("exibe a descrição salva exatamente como foi definida pelo admin", () => {
    expect(getProductDescription("  Corte amplo em algodão pesado.\nProdução local.  ")).toBe(
      "Corte amplo em algodão pesado.\nProdução local.",
    );
    expect(hasSavedProductDescription("  Corte amplo em algodão pesado.  ")).toBe(true);
  });

  it("não considera descrição vazia como conteúdo salvo", () => {
    expect(getProductDescription("   ")).toBe("Descrição ainda não informada pelo administrador.");
    expect(getProductDescription(null)).toBe("Descrição ainda não informada pelo administrador.");
    expect(hasSavedProductDescription("   ")).toBe(false);
    expect(hasSavedProductDescription(undefined)).toBe(false);
  });
});
