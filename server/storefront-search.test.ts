import { describe, expect, it } from "vitest";
import { sortSoldOutLast, sortStorefrontProducts } from "../client/src/lib/storefront-search";

type FixtureProduct = {
  id: number;
  name: string;
  collection: string;
  category: string;
  sizes: string[];
  detail: string;
  price: number;
  stock: number;
  status: string;
  createdAt: string;
  salesCount: number;
};

const products: FixtureProduct[] = [
  {
    id: 1,
    name: "Peça disponível",
    collection: "Paradox",
    category: "Camisetas",
    sizes: ["M"],
    detail: "Produto disponível",
    price: 180,
    stock: 4,
    status: "active",
    createdAt: "2026-08-10T00:00:00.000Z",
    salesCount: 2,
  },
  {
    id: 2,
    name: "Peça esgotada",
    collection: "Paradox",
    category: "Camisetas",
    sizes: ["M"],
    detail: "Produto esgotado",
    price: 40,
    stock: 0,
    status: "active",
    createdAt: "2026-08-20T00:00:00.000Z",
    salesCount: 99,
  },
  {
    id: 3,
    name: "Peça disponível 2",
    collection: "Archive",
    category: "Bones",
    sizes: ["Único"],
    detail: "Produto disponível",
    price: 90,
    stock: 2,
    status: "active",
    createdAt: "2026-08-15T00:00:00.000Z",
    salesCount: 8,
  },
];

describe("ordenação pública de produtos", () => {
  it("mantém a curadoria estável e desloca produtos esgotados para o fim", () => {
    const result = sortSoldOutLast([products[1], products[0], products[2]]);
    expect(result.map((product) => product.id)).toEqual([1, 3, 2]);
  });

  it.each(["newest", "price-asc", "price-desc", "bestselling"] as const)(
    "mantém esgotados no fim no modo %s",
    (sort) => {
      const result = sortStorefrontProducts(products, sort);
      expect(result.at(-1)?.id).toBe(2);
      expect(result.slice(0, -1).every((product) => product.stock > 0)).toBe(true);
    },
  );
});
