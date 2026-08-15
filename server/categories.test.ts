import { describe, expect, it } from "vitest";
import { normalizeCategoryName, slugifyCategory } from "../shared/categories";

describe("category utilities", () => {
  it("normalizes spaces without changing the visible category name", () => {
    expect(normalizeCategoryName("  Calças   e  Bermudas ")).toBe("Calças e Bermudas");
  });

  it("creates URL-safe slugs with accents removed", () => {
    expect(slugifyCategory("Calças e Bermudas")).toBe("calcas-e-bermudas");
    expect(slugifyCategory("Bonés / ERAS")).toBe("bones-eras");
  });

  it("does not leave separators at the edges", () => {
    expect(slugifyCategory("  — Camisetas — ")).toBe("camisetas");
  });
});
