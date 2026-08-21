import { describe, expect, it } from "vitest";
import {
  createEmptyProductDraft,
  getProductDescriptionDraft,
  getProductSizeGuideDraft,
} from "../client/src/lib/product-editor";
import {
  getDefaultProductSizeGuide,
  normalizeProductSizeGuide,
  resolveProductSizeGuide,
} from "../shared/product-size-guide";

describe("editor de produto", () => {
  it("inicia novos produtos sem inventar descrição ou guia de tamanhos", () => {
    const draft = createEmptyProductDraft();

    expect(draft.description).toBe("");
    expect(draft.sizeGuide).toEqual([]);
  });

  it("mantém a descrição persistida ao reabrir o editor", () => {
    const description = "Descrição editorial real do produto, com medidas e características.";

    expect(getProductDescriptionDraft(description)).toBe(description);
    expect(getProductDescriptionDraft(null)).toBe("");
    expect(getProductDescriptionDraft({ text: description })).toBe("");
  });

  it("normaliza linhas da guia sem descartar medidas válidas", () => {
    const guide = getProductSizeGuideDraft([
      { size: " M ", width: " 54 cm ", length: " 70 cm " },
      { size: "", width: "ignorar", length: "ignorar" },
      null,
    ]);

    expect(guide).toEqual([{ size: "M", width: "54 cm", length: "70 cm" }]);
  });

  it("prioriza a guia personalizada e só usa a referência da categoria sem configuração salva", () => {
    const custom = [{ size: "M", width: "56 cm", length: "72 cm" }];

    expect(resolveProductSizeGuide(custom, "Camisetas", ["M"])).toEqual(custom);
    expect(resolveProductSizeGuide(null, "Camisetas", ["M"])).toEqual(
      getDefaultProductSizeGuide("Camisetas", ["M"]),
    );
  });
});

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const adminSource = readFileSync(
  fileURLToPath(new URL("../client/src/pages/Admin.tsx", import.meta.url)),
  "utf8",
);

describe("contrato do editor administrativo", () => {
  it("hidrata descrição e guia ao reabrir o produto e mantém os campos controlados", () => {
    expect(adminSource).toContain("description: getProductDescriptionDraft(product.description)");
    expect(adminSource).toContain("sizeGuide: getProductSizeGuideDraft(product.sizeGuide)");
    expect(adminSource).toContain("value={editingProduct.description}");
    expect(adminSource).toContain('aria-label="Guia de tamanhos do produto"');
    expect(adminSource).toContain("onClick={addEditingSizeGuideRow}");
  });

  it("envia descrição e guia normalizadas ao salvar a edição", () => {
    expect(adminSource).toContain('description: String(editingProduct.description ?? "")');
    expect(adminSource).toContain("sizeGuide: getProductSizeGuideDraft(editingProduct.sizeGuide)");
  });
});
