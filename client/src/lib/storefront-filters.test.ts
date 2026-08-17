import { describe, expect, it } from "vitest";
import { filterStorefrontProducts, getStorefrontFilterOptions } from "./storefront-filters";

const products = [
  { category: "Camisetas", sizes: ["P", "M"], price: 154.9, id: 1 },
  { category: "Camisetas", sizes: ["G"], price: 220, id: 2 },
  { category: "Bonés", sizes: ["Único"], price: 117.5, id: 3 },
];

describe("storefront filters", () => {
  it("combina categoria, tamanho e faixa de preço", () => {
    const result = filterStorefrontProducts(products, {
      category: "Camisetas",
      size: "M",
      minPrice: 150,
      maxPrice: 200,
    });
    expect(result.map((product) => product.id)).toEqual([1]);
  });

  it("devolve opções únicas e ordena Único primeiro", () => {
    expect(getStorefrontFilterOptions(products)).toEqual({
      sizes: ["Único", "G", "M", "P"],
    });
  });

  it("permite limpar filtros usando os valores neutros", () => {
    expect(filterStorefrontProducts(products, { category: "Todos", size: "Todos" })).toHaveLength(3);
  });
});
