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
});
