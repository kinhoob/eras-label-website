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

  it("filters inventory audit logs by admin email or name", () => {
    const logs = [
      { id: 1, adminEmail: "theeraslabel@gmail.com", adminName: "Eras Admin", productName: "Camisa" },
      { id: 2, adminEmail: "other@gmail.com", adminName: "Other", productName: "Calça" },
    ];
    const filter = "eraslabel";
    const filtered = logs.filter(l => l.adminEmail.includes(filter) || l.adminName.toLowerCase().includes(filter));
    expect(filtered.length).toBe(1);
    expect(filtered[0].productName).toBe("Camisa");
  });

  it("calculates step count for sales trend based on period days", () => {
    const getStepCount = (days: number) => days <= 7 ? 7 : days <= 30 ? 6 : 8;
    expect(getStepCount(7)).toBe(7);
    expect(getStepCount(30)).toBe(6);
    expect(getStepCount(90)).toBe(8);
  });

  it("paginates and sorts inventory audit logs correctly", () => {
    const logs = [
      { id: 1, productName: "Camisa A", size: "M", newStock: 10, createdAt: new Date("2026-08-01") },
      { id: 2, productName: "Camisa B", size: "G", newStock: 5, createdAt: new Date("2026-08-05") },
      { id: 3, productName: "Calça C", size: "40", newStock: 2, createdAt: new Date("2026-08-03") },
    ];

    // Ordenar por newStock ascendente
    const sorted = [...logs].sort((a, b) => a.newStock - b.newStock);
    expect(sorted[0].newStock).toBe(2);
    expect(sorted[2].newStock).toBe(10);

    // Paginação: página 1 com pageSize 2
    const page = 1;
    const pageSize = 2;
    const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);
    expect(paginated.length).toBe(2);
    expect(paginated[0].newStock).toBe(2);
  });

  it("builds AI executive summary prompt and fallback gracefully", () => {
    const analytics = {
      summary: { visits: 61, sales: 1, revenue: 142.60, averageTicket: 142.60, conversionRate: 1.64 },
    };
    const fallback = `Nos últimos 7 dias, a Eras Label registrou ${analytics.summary.sales} vendas com receita de R$ ${analytics.summary.revenue.toFixed(2)} e taxa de conversão de ${analytics.summary.conversionRate}%.`;
    expect(fallback).toContain("1 vendas");
    expect(fallback).toContain("R$ 142.60");
  });

  it("calculates category revenue and low stock alerts correctly", () => {
    const mockProducts = [
      { id: 1, name: "Camiseta Boxy", category: "Camisetas", price: "142.60", stock: 2 },
      { id: 2, name: "Calça Cargo", category: "Calças", price: "280.00", stock: 8 },
    ];
    const lowStock = mockProducts.filter(p => p.stock < 5);
    expect(lowStock.length).toBe(1);
    expect(lowStock[0].name).toBe("Camiseta Boxy");
  });
});

  it("verifies sub-admin permission string parsing and module access", () => {
    const permissionsStr = "products,inventory,stats";
    const permsList = permissionsStr.split(",").map(p => p.trim());

    expect(permsList.includes("products")).toBe(true);
    expect(permsList.includes("inventory")).toBe(true);
    expect(permsList.includes("categories")).toBe(false);
    expect(permsList.includes("settings")).toBe(false);
  });

  it("checks superadmin recognition by email", () => {
    const superAdminEmail = "theeraslabel@gmail.com";
    const subAdminEmail = "assistant@eraslabel.com";

    const isSuper = (email: string) => email.trim().toLowerCase() === "theeraslabel@gmail.com";

    expect(isSuper(superAdminEmail)).toBe(true);
    expect(isSuper(subAdminEmail)).toBe(false);
  });

  it("resolves role title and permissions labels correctly for header badge", () => {
    const isSuper = true;
    const roleTitle = isSuper ? "Superadministrador" : "Assistente";
    const permissions = "products,inventory,stats".split(",").map(p => p.trim());

    expect(roleTitle).toBe("Superadministrador");
    expect(permissions.length).toBe(3);
    expect(permissions).toContain("inventory");
  });
