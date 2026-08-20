import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Regression guard for the editorial parallax on the public Home page.
 * The motion is intentionally implemented without React state updates per pixel.
 */
describe("home editorial parallax", () => {
  const home = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
  const stylesheet = readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");

  it("targets only the hero and VIP media layers", () => {
    expect(home).toContain('data-parallax="hero"');
    expect(home).toContain('data-parallax="vip"');
    expect(home).toContain('data-parallax-speed="0.18"');
    expect(home).toContain('data-parallax-speed="0.13"');
    expect(home).toContain('data-parallax-mobile-speed="0.045"');
    expect(home).toContain('data-parallax-mobile-speed="0.035"');
  });

  it("throttles scroll work with requestAnimationFrame and passive listeners", () => {
    expect(home).toContain("window.requestAnimationFrame(applyParallax)");
    expect(home).toContain('window.addEventListener("scroll", scheduleParallax, { passive: true })');
    expect(home).toContain('element.style.setProperty("--parallax-y"');
    expect(home).toContain("element.parentElement?.getBoundingClientRect()");
    expect(home).toContain("window.scrollY * speed");
    expect(home).toContain("const limit = isCompactViewport ? 26 : 88");
    expect(home).toContain("window.cancelAnimationFrame(frameId)");
  });

  it("keeps a reduced but visible motion on compact screens and disables only for reduced motion", () => {
    expect(home).toContain('window.matchMedia("(prefers-reduced-motion: reduce)")');
    expect(home).toContain("const isCompactViewport = window.innerWidth < 768");
    expect(home).toContain("const mobileSpeed = Number(element.dataset.parallaxMobileSpeed ?? \"0.04\")");
    expect(stylesheet).toContain("@media (max-width: 767px)");
    expect(stylesheet).toContain("translate3d(0, var(--parallax-y, 0px), 0) scale(1.025)");
    expect(stylesheet).toContain("@media (prefers-reduced-motion: reduce)");
    expect(stylesheet).toContain("transform: none !important");
  });
});
