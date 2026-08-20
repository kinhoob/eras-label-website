import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Regression guard for the public dark theme.
 * The storefront primitives are intentionally CSS-driven, so this test keeps
 * the critical selectors and stacking contract from being removed accidentally.
 */
describe("public dark mode surfaces", () => {
  const stylesheet = readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");
  const sidebar = readFileSync(resolve(process.cwd(), "client/src/components/SidebarMenu.tsx"), "utf8");

  it("keeps the sidebar opaque and above the persistent public navbar", () => {
    expect(stylesheet).toContain("html.dark .lovable-menu-overlay");
    expect(stylesheet).toContain("z-index: 3200 !important");
    expect(stylesheet).toContain("background: #171514 !important");
    expect(stylesheet).toContain("position: fixed !important");
    expect(stylesheet).toContain("z-index: 3201 !important");
    expect(stylesheet).toContain("pointer-events: none");
    expect(sidebar).toContain('onClick={onClose} role="presentation"');
    expect(sidebar).toContain('aria-label="Fechar menu"');
    expect(sidebar).toContain('onClick={closeWithSound} className="close-button"');
  });

  it("keeps the official footer dark and covers its interactive descendants", () => {
    expect(stylesheet).toContain("html.dark .site-footer.official-footer");
    expect(stylesheet).toContain("background-color: #171514 !important");
    expect(stylesheet).toContain(".footer-whatsapp-link");
    expect(stylesheet).toContain(".footer-credit-link");
    expect(stylesheet).toContain(".footer-social-link");
  });
});
