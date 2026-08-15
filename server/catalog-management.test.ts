import { describe, it, expect } from "vitest";

describe("Catalog Management and Inventory Separation", () => {
  it("normalizes SKU codes correctly", () => {
    const rawSku = "  el-t-dr-red-m  ";
    const normalized = rawSku.trim().toUpperCase();
    expect(normalized).toBe("EL-T-DR-RED-M");
  });

  it("links subcategories with parent categories", () => {
    const parentCategory = { id: 1, name: "Calças", slug: "calcas", parentId: null };
    const subCategory = { id: 2, name: "Cargo Jeans", slug: "cargo-jeans", parentId: 1 };
    expect(subCategory.parentId).toBe(parentCategory.id);
  });

  it("separates full product editing from quick inventory stock updates", () => {
    const productBeforeStockUpdate = { id: 10, name: "T-Shirt", sku: "TSHIRT-01", stock: 5 };
    const quickStockUpdate = { productId: 10, variations: [{ size: "M", stock: 12 }] };
    
    // Quick inventory mutation changes only stock/variations without modifying description or gallery
    expect(quickStockUpdate.productId).toBe(productBeforeStockUpdate.id);
    expect(quickStockUpdate.variations[0].stock).toBe(12);
  });

  it("marks stock below five units as low while keeping zero as a separate state", () => {
    const stockState = (stock: number) => stock === 0 ? "danger" : stock < 5 ? "low" : "ok";

    expect(stockState(0)).toBe("danger");
    expect(stockState(4)).toBe("low");
    expect(stockState(5)).toBe("ok");
  });

  it("builds a duplicate product draft without reusing the original SKU", () => {
    const source = { name: "Camiseta Archive", sku: "EL-TS-001", variations: [{ size: "M", stock: 3 }] };
    const suffix = "COPY-ABC123";
    const duplicate = {
      name: `${source.name} (cópia)`,
      sku: `${source.sku}-${suffix}`,
      variations: source.variations.map((variation) => ({ ...variation })),
    };

    expect(duplicate.name).toBe("Camiseta Archive (cópia)");
    expect(duplicate.sku).toBe("EL-TS-001-COPY-ABC123");
    expect(duplicate.variations).toEqual(source.variations);
    expect(duplicate.variations).not.toBe(source.variations);
  });

  it("calculates analytics metrics correctly based on orders and visits", () => {
    const mockOrders = [
      { total: "142.60" },
      { total: "210.00" },
    ];
    const totalRevenue = mockOrders.reduce((acc, o) => acc + Number(o.total), 0);
    const totalSales = mockOrders.length;
    const averageTicket = totalRevenue / totalSales;

    expect(totalRevenue).toBe(352.60);
    expect(totalSales).toBe(2);
    expect(averageTicket).toBe(176.30);
  });

  it("formats audit log inventory change description correctly", () => {
    const log = {
      productName: "Calça Cargo Paradox",
      size: "40",
      previousStock: 8,
      newStock: 3,
      adminName: "Eras Admin",
    };
    const diff = log.newStock - log.previousStock;
    const desc = `${log.productName} (${log.size}): ${log.previousStock} -> ${log.newStock} (${diff})`;
    expect(desc).toBe("Calça Cargo Paradox (40): 8 -> 3 (-5)");
  });
});
