import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  LOW_STOCK_THRESHOLD,
  getProductSizeAvailabilityLabel,
  getProductStockAlertLabel,
} from "../shared/product-stock-alert";
import { ProductStockAlert } from "../client/src/components/ProductStockAlert";

const productPageSource = readFileSync(
  fileURLToPath(new URL("../client/src/pages/ProductPage.tsx", import.meta.url)),
  "utf8",
);

const productStyles = readFileSync(
  fileURLToPath(new URL("../client/src/index.css", import.meta.url)),
  "utf8",
);

const productStockAlertSource = readFileSync(
  fileURLToPath(new URL("../client/src/components/ProductStockAlert.tsx", import.meta.url)),
  "utf8",
);

const themeContextSource = readFileSync(
  fileURLToPath(new URL("../client/src/contexts/ThemeContext.tsx", import.meta.url)),
  "utf8",
);

describe("alerta editorial de estoque por tamanho", () => {
  it("mostra poucas unidades apenas dentro do limite editorial", () => {
    expect(LOW_STOCK_THRESHOLD).toBe(5);
    expect(getProductStockAlertLabel(5)).toBe("POUCAS UNIDADES");
    expect(getProductStockAlertLabel(2)).toBe("POUCAS UNIDADES");
    expect(getProductStockAlertLabel(1)).toBe("ÚLTIMA PEÇA");
    expect(getProductStockAlertLabel(6)).toBeNull();
    expect(getProductStockAlertLabel(0)).toBeNull();
  });

  it("não expõe o número exato no texto público de disponibilidade", () => {
    expect(getProductSizeAvailabilityLabel(true)).toBe("Tamanho disponível");
    expect(getProductSizeAvailabilityLabel(false)).toBe("Selecione o tamanho para continuar");
    expect(productPageSource).not.toContain("${selectedStock} ${selectedStock");
    expect(productPageSource).toContain("<ProductStockAlert stock={selectedStock} />");
    expect(productStockAlertSource).toContain("getProductStockAlertLabel(stock)");
  });

  it("renderiza a etiqueta dentro da moldura da foto no canto superior esquerdo", () => {
    expect(productStockAlertSource).toContain('className="product-stock-alert"');
    expect(productStockAlertSource).toContain('role="status" aria-live="polite"');
    expect(productStyles).toContain(".product-stock-alert {");
    expect(productStyles).toContain("top: 16px;");
    expect(productStyles).toContain("left: 16px;");
    expect(productStyles).toContain("background: #b22222;");
  });

  it("mantém a tag responsiva sem alterar o bloqueio de compra", () => {
    expect(productStyles).toContain(".product-stock-alert { top: 12px; left: 12px;");
    expect(productPageSource).toContain("disabled={isAdding || isSoldOut}");
    expect(productPageSource).toContain('isSoldOut ? "ESGOTADO"');
  });

  it("renderiza o componente real do alerta nos temas claro e escuro", () => {
    const alertMarkup = renderToStaticMarkup(createElement(ProductStockAlert, { stock: 1 }));
    const renderedMarkupByTheme = ["light", "dark"].map((theme) => {
      const rootClass = theme === "dark" ? "dark" : "";
      return `<html class="${rootClass}">${alertMarkup}</html>`;
    });

    for (const markup of renderedMarkupByTheme) {
      expect(markup).toContain('class="product-stock-alert"');
      expect(markup).toContain('role="status"');
      expect(markup).toContain("ÚLTIMA PEÇA");
    }

    expect(themeContextSource).toContain('root.classList.add("dark")');
    expect(themeContextSource).toContain('root.classList.remove("dark")');
    expect(productStyles).toContain("pointer-events: none;");
    expect(productStyles).not.toMatch(/html\.dark\s+\.product-stock-alert\s*\{[^}]*display:\s*none/);
    expect(productPageSource).toContain("disabled={isAdding || isSoldOut}");
    expect(productPageSource).toContain('isSoldOut ? "ESGOTADO"');
  });
});
