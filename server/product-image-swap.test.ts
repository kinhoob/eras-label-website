import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const componentSource = readFileSync(resolve(projectRoot, "client/src/components/ProductImageSwap.tsx"), "utf8");
const homeSource = readFileSync(resolve(projectRoot, "client/src/pages/Home.tsx"), "utf8");
const catalogSource = readFileSync(resolve(projectRoot, "client/src/pages/CatalogView.tsx"), "utf8");
const cssSource = readFileSync(resolve(projectRoot, "client/src/index.css"), "utf8");

describe("troca editorial de imagem dos produtos", () => {
  it("renderiza a foto principal e só cria a camada secundária quando há uma segunda URL", () => {
    expect(componentSource).toContain("const hasSecondaryImage = Boolean(secondaryImage");
    expect(componentSource).toContain('className="product-image-swap-base"');
    expect(componentSource).toContain('className="product-image-swap-hover"');
    expect(componentSource).toContain('data-image-error');
  });

  it("integra a segunda imagem nos cards curados da Home e no catálogo", () => {
    expect(homeSource).toContain("secondaryImage={product.images?.[1]}");
    expect(homeSource).toContain("has-image-swap");
    expect(catalogSource).toContain("secondaryImage={images[1]}");
    expect(catalogSource).toContain("has-image-swap");
  });

  it("protege hover, foco de teclado e prefers-reduced-motion", () => {
    expect(cssSource).toContain(".catalog-product-card:hover .catalog-product-media.has-image-swap .product-image-swap-hover");
    expect(cssSource).toContain(":focus-visible .product-image-swap-hover");
    expect(cssSource).toContain("@media (prefers-reduced-motion: reduce)");
    expect(cssSource).toContain("data-image-error=\"true\"");
  });
});
