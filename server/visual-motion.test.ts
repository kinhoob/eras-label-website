import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("Eras visual motion system", () => {
  const stylesheet = readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");

  it("includes premium background motion layers for the main storefront sections", () => {
    expect(stylesheet).toContain(".home-hero::before");
    expect(stylesheet).toContain(".highlights-section::before");
    expect(stylesheet).toContain(".shop-section::after");
    expect(stylesheet).toContain(".vip-home-banner > a::before");
    expect(stylesheet).toContain("@keyframes eras-hero-atmosphere");
    expect(stylesheet).toContain("@keyframes eras-grid-drift");
  });

  it("provides a reduced-motion fallback for every decorative layer", () => {
    const reducedMotionBlock = stylesheet.slice(stylesheet.indexOf("@media (prefers-reduced-motion: reduce)"));
    expect(reducedMotionBlock).toContain(".home-hero::before");
    expect(reducedMotionBlock).toContain(".vip-home-banner > a::after");
    expect(reducedMotionBlock).toContain("animation: none");
  });

  it("keeps the public side menu above the sticky navbar on desktop and mobile", () => {
    expect(stylesheet).toContain(".lovable-menu-overlay");
    expect(stylesheet).toContain("z-index: 1200");
    expect(stylesheet).toContain(".lovable-side-menu");
    expect(stylesheet).toContain("z-index: 1201");
    expect(stylesheet).toContain("min-height: 100dvh");
    expect(stylesheet).toContain("overscroll-behavior: contain");
    expect(stylesheet).toContain("@media (max-width: 720px)");
    expect(stylesheet).toContain("width: min(360px, 92vw)");
  });
});

describe("Eras checkout mobile layout", () => {
  const stylesheet = readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");

  it("keeps the full checkout bag summary visible on mobile", () => {
    expect(stylesheet).toContain(".checkout-page-summary {");
    expect(stylesheet).toContain("min-height: fit-content !important");
    expect(stylesheet).toContain("max-height: none !important");
    expect(stylesheet).toContain("overflow: visible !important");
    expect(stylesheet).toContain(".checkout-summary-lines {");
    expect(stylesheet).toContain("overflow-x: hidden !important");
    expect(stylesheet).toContain("@media (max-width: 540px)");
    expect(stylesheet).toContain("grid-template-columns: 48px minmax(0, 1fr) auto !important");
  });
});
