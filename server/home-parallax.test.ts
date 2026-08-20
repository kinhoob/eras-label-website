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
    expect(home).toContain('data-parallax-speed="0.075"');
    expect(home).toContain('data-parallax-speed="0.055"');
  });

  it("throttles scroll work with requestAnimationFrame and passive listeners", () => {
    expect(home).toContain("window.requestAnimationFrame(applyParallax)");
    expect(home).toContain('window.addEventListener("scroll", scheduleParallax, { passive: true })');
    expect(home).toContain('element.style.setProperty("--parallax-y"');
    expect(home).toContain("window.cancelAnimationFrame(frameId)");
  });

  it("disables motion on reduced-motion preferences and compact screens", () => {
    expect(home).toContain('window.matchMedia("(prefers-reduced-motion: reduce)")');
    expect(home).toContain("window.innerWidth < 768");
    expect(stylesheet).toContain("@media (max-width: 767px)");
    expect(stylesheet).toContain("@media (prefers-reduced-motion: reduce)");
    expect(stylesheet).toContain("--parallax-y, 0px");
  });
});
