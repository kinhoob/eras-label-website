import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const componentSource = readFileSync(resolve(projectRoot, "client/src/components/ProductImageSwap.tsx"), "utf8");
const homeSource = readFileSync(resolve(projectRoot, "client/src/pages/Home.tsx"), "utf8");
const catalogSource = readFileSync(resolve(projectRoot, "client/src/pages/CatalogView.tsx"), "utf8");
const mediaSource = readFileSync(resolve(projectRoot, "client/src/components/PublicProductCardMedia.tsx"), "utf8");
const cardSource = readFileSync(resolve(projectRoot, "client/src/components/PublicProductCard.tsx"), "utf8");
const purchaseSource = readFileSync(resolve(projectRoot, "client/src/components/PublicProductPurchaseButton.tsx"), "utf8");
const cssSource = readFileSync(resolve(projectRoot, "client/src/index.css"), "utf8");

describe("troca editorial de imagem dos produtos", () => {
  it("renderiza a foto principal e só cria a camada secundária quando há uma segunda URL", () => {
    expect(componentSource).toContain("const hasSecondaryImage = Boolean(secondaryImage");
    expect(componentSource).toContain('className="product-image-swap-base"');
    expect(componentSource).toContain('className="product-image-swap-hover"');
    expect(componentSource).toContain('data-image-error');
  });

  it("integra o componente DOM compartilhado nos cards curados da Home e no catálogo", () => {
    expect(homeSource).toContain("<PublicProductCard");
    expect(homeSource).toContain("secondaryImage={cardState.secondaryImage}");
    expect(catalogSource).toContain("<PublicProductCard");
    expect(catalogSource).toContain("secondaryImage={cardState.secondaryImage}");
    expect(mediaSource).toContain("data-sold-out={state.soldOut ? \"true\" : \"false\"}");
    expect(mediaSource).toContain("className={mediaClassName}");
  });

  it("protege hover, foco de teclado e prefers-reduced-motion", () => {
    expect(cssSource).toContain(".catalog-product-card:hover .catalog-product-media.has-image-swap .product-image-swap-hover");
    expect(cssSource).toContain(".product-image-button.has-image-swap:focus-visible .product-image-swap-hover");
    expect(cssSource).toContain(".catalog-product-media.has-image-swap:focus-visible .product-image-swap-hover");
    expect(cssSource).toContain("@media (prefers-reduced-motion: reduce)");
    expect(cssSource).toContain('data-image-error="true"');
  });

  it("mantém cards esgotados acessíveis para consulta, mas sem reativar a compra", () => {
    expect(homeSource).toContain('const cardState = getPublicProductCardState(product);');
    expect(cardSource).toContain('data-sold-out={state.soldOut ? "true" : "false"}');
    expect(mediaSource).toContain("aria-label={state.ariaLabel}");
    expect(purchaseSource).toContain("disabled={disabled}");
    expect(purchaseSource).toContain("if (!disabled) onPurchase();");
    expect(purchaseSource).toContain('!canAddToCart ? "ESGOTADO"');
  });
});
