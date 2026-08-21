import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Regression test for the sold-out catalog presentation.
 * The status label must remain a small overlay while only the explicit
 * missing-image placeholder is allowed to occupy the complete media area.
 */
describe("sold-out product presentation", () => {
  const sourceRoot = resolve(process.cwd(), "client/src");
  const catalogSource = readFileSync(resolve(sourceRoot, "pages/CatalogView.tsx"), "utf8");
  const soldoutHelper = readFileSync(resolve(sourceRoot, "lib/soldout.ts"), "utf8");
  const mediaComponent = readFileSync(resolve(sourceRoot, "components/PublicProductCardMedia.tsx"), "utf8");
  const stylesheet = readFileSync(resolve(sourceRoot, "index.css"), "utf8");

  it("uses a dedicated placeholder class instead of styling every direct span as full media", () => {
    expect(mediaComponent).toContain('className="catalog-product-media-placeholder"');
    expect(stylesheet).toContain(".catalog-product-media-placeholder {");
    expect(stylesheet).not.toContain(".catalog-product-media > span {");
  });

  it("keeps the sold-out label as an absolutely positioned compact overlay", () => {
    expect(mediaComponent).toContain("absolute bottom-3 left-3");
    expect(soldoutHelper).toContain('badge: soldOut ? "ESGOTADO" : null');
    expect(stylesheet).toContain(".catalog-product-media {");
    expect(stylesheet).toContain("overflow: hidden;");
  });
});
