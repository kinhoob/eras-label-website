import { describe, expect, it } from "vitest";
import {
  getSearchSuggestionText,
  normalizeSearchText,
  scoreStorefrontProduct,
  searchStorefrontProducts,
} from "../client/src/lib/storefront-search";

const products = [
  {
    id: 1,
    name: "T-Shirt Travessia",
    collection: "PARADOX COLLECTION",
    category: "Camisetas",
    color: "Branco",
    sizes: ["P", "M", "G"],
    detail: "Peça branca de algodão para atravessar o tempo.",
  },
  {
    id: 2,
    name: "Boné Lost Between Eras Marinho",
    collection: "LOST BETWEEN ERAS",
    category: "Bonés",
    color: "Marinho",
    sizes: ["Único"],
    detail: "Edição de arquivo.",
  },
  {
    id: 3,
    name: "T-Shirt Dissociação",
    collection: "PARADOX COLLECTION",
    category: "Camisetas",
    color: "Preto",
    sizes: ["P", "M", "G", "GG"],
    detail: "Uma peça escura de acabamento premium.",
  },
];

describe("pesquisa inteligente do storefront", () => {
  it("normaliza acentos e diferenças de caixa", () => {
    expect(normalizeSearchText("Boné Marinho")).toBe("bone marinho");
  });

  it("encontra produtos por nome, coleção, categoria, cor e tamanho", () => {
    expect(searchStorefrontProducts(products, "travessia").map((product) => product.id)).toEqual([1]);
    expect(searchStorefrontProducts(products, "paradox").map((product) => product.id)).toEqual([1, 3]);
    expect(searchStorefrontProducts(products, "camisetas").map((product) => product.id)).toEqual([1, 3]);
    expect(searchStorefrontProducts(products, "bone marinho").map((product) => product.id)).toEqual([2]);
    expect(searchStorefrontProducts(products, "gg").map((product) => product.id)).toEqual([3]);
  });

  it("prioriza correspondências fortes no nome", () => {
    const result = searchStorefrontProducts(products, "t-shirt");
    expect(result.map((product) => product.id)).toEqual([1, 3]);
    expect(scoreStorefrontProduct(products[0], "travessia")).toBeGreaterThan(scoreStorefrontProduct(products[0], "algodao"));
  });

  it("devolve a lista original para consulta vazia e lista vazia para consulta sem correspondência", () => {
    expect(searchStorefrontProducts(products, " ")).toBe(products);
    expect(searchStorefrontProducts(products, "jaqueta vermelha")).toEqual([]);
  });

  it("gera texto de sugestão consistente para o dropdown", () => {
    expect(getSearchSuggestionText(products[0])).toBe("T-Shirt Travessia · PARADOX COLLECTION");
  });
});
