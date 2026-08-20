import { describe, expect, it } from "vitest";
import {
  getSearchSuggestionText,
  normalizeSearchText,
  scoreStorefrontProduct,
  searchStorefrontProducts,
  sortStorefrontProducts,
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
    price: 154.9,
    createdAt: "2026-08-12T04:23:32.000Z",
  },
  {
    id: 2,
    name: "Boné Lost Between Eras Marinho",
    collection: "LOST BETWEEN ERAS",
    category: "Bonés",
    color: "Marinho",
    sizes: ["Único"],
    detail: "Edição de arquivo.",
    price: 99.9,
    createdAt: "2026-08-15T01:06:00.000Z",
  },
  {
    id: 3,
    name: "T-Shirt Dissociação",
    collection: "PARADOX COLLECTION",
    category: "Camisetas",
    color: "Preto",
    sizes: ["P", "M", "G", "GG"],
    detail: "Uma peça escura de acabamento premium.",
    price: 220,
    createdAt: "2026-08-15T02:16:11.000Z",
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

  it("ordena por preço crescente, preço decrescente e novidade sem alterar a lista original", () => {
    expect(sortStorefrontProducts(products, "price-asc").map((product) => product.id)).toEqual([2, 1, 3]);
    expect(sortStorefrontProducts(products, "price-desc").map((product) => product.id)).toEqual([3, 1, 2]);
    expect(sortStorefrontProducts(products, "newest").map((product) => product.id)).toEqual([3, 2, 1]);
    expect(products.map((product) => product.id)).toEqual([1, 2, 3]);
  });

  it("mantém produtos esgotados visíveis e coloca-os no fim em qualquer ordenação", () => {
    const catalogWithSoldOut = [
      { ...products[0], status: "active", variations: [{ stock: 4 }] },
      { ...products[1], status: "soldout", variations: [{ stock: 0 }] },
      { ...products[2], status: "active", variations: [{ stock: 2 }] },
    ];

    expect(sortStorefrontProducts(catalogWithSoldOut, "price-asc").map((product) => product.id)).toEqual([1, 3, 2]);
    expect(sortStorefrontProducts(catalogWithSoldOut, "price-desc").map((product) => product.id)).toEqual([3, 1, 2]);
    expect(sortStorefrontProducts(catalogWithSoldOut, "newest").map((product) => product.id)).toEqual([3, 1, 2]);
    expect(sortStorefrontProducts(catalogWithSoldOut, "bestselling").map((product) => product.id)).toEqual([3, 1, 2]);
  });

  it("considera esgotado um produto sem stock em todas as variações, mesmo sem status soldout", () => {
    const catalogWithZeroStock = [
      { ...products[0], status: "active", variations: [{ stock: 0 }, { stock: 0 }] },
      { ...products[1], status: "active", variations: [{ stock: 2 }] },
    ];

    expect(sortStorefrontProducts(catalogWithZeroStock, "price-asc").map((product) => product.id)).toEqual([2, 1]);
  });

  it("gera texto de sugestão consistente para o dropdown", () => {
    expect(getSearchSuggestionText(products[0])).toBe("T-Shirt Travessia · PARADOX COLLECTION");
  });
});
