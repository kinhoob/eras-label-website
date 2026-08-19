import { describe, expect, it } from "vitest";
import { sortStorefrontProducts } from "./storefront-search";

type TestProduct = {
  name: string;
  collection: string;
  category: string;
  sizes: string[];
  detail: string;
  price: number;
  salesCount?: number;
  createdAt?: string;
};

function product(overrides: Partial<TestProduct>): TestProduct {
  return {
    name: "Peça Eras",
    collection: "Coleção",
    category: "Camisetas",
    sizes: ["M"],
    detail: "",
    price: 100,
    ...overrides,
  };
}

describe("storefront product sorting", () => {
  it("orders products from the lowest to the highest price", () => {
    const result = sortStorefrontProducts([
      product({ name: "Caro", price: 240 }),
      product({ name: "Barato", price: 90 }),
      product({ name: "Médio", price: 140 }),
    ], "price-asc");

    expect(result.map((item) => item.name)).toEqual(["Barato", "Médio", "Caro"]);
  });

  it("orders products from the highest to the lowest price", () => {
    const result = sortStorefrontProducts([
      product({ name: "Barato", price: 90 }),
      product({ name: "Caro", price: 240 }),
      product({ name: "Médio", price: 140 }),
    ], "price-desc");

    expect(result.map((item) => item.name)).toEqual(["Caro", "Médio", "Barato"]);
  });

  it("uses real units sold for the bestselling order and keeps ties stable", () => {
    const result = sortStorefrontProducts([
      product({ name: "Mais vendido", salesCount: 12 }),
      product({ name: "Empatado", salesCount: 12 }),
      product({ name: "Menos vendido", salesCount: 2 }),
    ], "bestselling");

    expect(result.map((item) => item.name)).toEqual(["Mais vendido", "Empatado", "Menos vendido"]);
  });

  it("falls back to recent products when popularity is tied", () => {
    const result = sortStorefrontProducts([
      product({ name: "Antigo", salesCount: 0, createdAt: "2026-01-01T00:00:00.000Z" }),
      product({ name: "Novo", salesCount: 0, createdAt: "2026-08-01T00:00:00.000Z" }),
    ], "bestselling");

    expect(result.map((item) => item.name)).toEqual(["Novo", "Antigo"]);
  });
});


describe("storefront sort compatibility", () => {
  it("supports the legacy sales aliases when a catalog response has them", () => {
    const result = sortStorefrontProducts([
      product({ name: "Pedidos", salesCount: undefined, ordersCount: 3 } as TestProduct & { ordersCount: number }),
      product({ name: "Unidades", salesCount: undefined, sales: 9 } as TestProduct & { sales: number }),
    ], "bestselling");

    expect(result[0]?.name).toBe("Unidades");
  });
});
