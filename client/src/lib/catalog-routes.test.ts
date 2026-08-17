import { describe, expect, it } from "vitest";
import { categoryPath, collectionPath, slugifyCatalogLabel, uniqueCatalogLabels } from "./catalog-routes";

describe("catalog public routes", () => {
  it("normalizes accents and punctuation into stable slugs", () => {
    expect(slugifyCatalogLabel("Bonés — Verão 2026")).toBe("bones-verao-2026");
  });

  it("builds category and collection routes", () => {
    expect(categoryPath("Camisetas")).toBe("/category/camisetas");
    expect(collectionPath("Paradox Collection")).toBe("/collection/paradox-collection");
  });

  it("deduplicates labels by slug while preserving a readable label", () => {
    expect(uniqueCatalogLabels(["Camisetas", "camisetas", "Bonés", "", null])).toEqual(["Bonés", "Camisetas"]);
  });
});
