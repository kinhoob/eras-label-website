import { describe, expect, it } from "vitest";
import { getInventorySizeOptions, normalizeInventoryVariations, sumInventoryStock } from "../shared/inventory";

describe("inventory rules", () => {
  it("returns apparel sizes for shirts and tops", () => {
    expect(getInventorySizeOptions("Camisetas")).toEqual(["PP", "P", "M", "G", "GG"]);
  });

  it("returns numeric sizes for pants, bermudas and jeans", () => {
    expect(getInventorySizeOptions("Calças")).toEqual(["34", "36", "38", "40", "42", "44", "46"]);
    expect(getInventorySizeOptions("Bermuda Jeans")).toEqual(["34", "36", "38", "40", "42", "44", "46"]);
  });

  it("normalizes, clamps and deduplicates variation stock", () => {
    expect(normalizeInventoryVariations([
      { size: " p ", stock: 2.9 },
      { size: "GG", stock: -4 },
      { size: "P", stock: 7 },
      { size: "", stock: 3 },
    ])).toEqual([
      { size: "P", color: "Preto", stock: 7 },
      { size: "GG", color: "Preto", stock: 0 },
    ]);
  });

  it("calculates total stock from selected variations", () => {
    expect(sumInventoryStock([{ stock: 2 }, { stock: 0 }, { stock: 9 }])).toBe(11);
  });
});
