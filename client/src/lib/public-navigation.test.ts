import { describe, expect, it } from "vitest";
import {
  findPublicCategory,
  getExtraPublicCategories,
  normalizePublicLabel,
  publicCategoryHref,
  type PublicNavigationCategory,
} from "./public-navigation";

const categories: PublicNavigationCategory[] = [
  { id: 1, name: "Camisetas", slug: "camisetas" },
  { id: 2, name: "Bonés", slug: "bones" },
  { id: 3, name: "Paradox", slug: "paradox" },
  { id: 4, name: "Raízes", slug: "raizes" },
];

describe("public navigation categories", () => {
  it("normalizes accents and case for semantic matching", () => {
    expect(normalizePublicLabel("Bonés")).toBe("bones");
    expect(normalizePublicLabel(" CAMISETAS ")).toBe(" camisetas ");
  });

  it("finds the configured apparel categories", () => {
    expect(findPublicCategory(categories, "camiseta")?.slug).toBe("camisetas");
    expect(findPublicCategory(categories, "bone")?.slug).toBe("bones");
  });

  it("keeps configured collection/category links beyond the primary items", () => {
    expect(getExtraPublicCategories(categories).map((category) => category.name)).toEqual(["Paradox", "Raízes"]);
    expect(publicCategoryHref(categories[2], "/catalog")).toBe("/category/paradox");
    expect(publicCategoryHref(undefined, "/category/camisetas")).toBe("/category/camisetas");
  });
});
