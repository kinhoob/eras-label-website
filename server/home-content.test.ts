import { describe, expect, it } from "vitest";
import { defaultHomeContent } from "./db";

describe("home content defaults", () => {
  it("provides rotatable banners with editable links and images", () => {
    expect(defaultHomeContent.banners.length).toBeGreaterThanOrEqual(2);
    expect(defaultHomeContent.banners.every((banner) => banner.id && banner.title && banner.imageUrl && banner.href)).toBe(true);
  });

  it("provides an editable VIP banner with a destination", () => {
    expect(defaultHomeContent.vipBanner.title).toContain("VIP");
    expect(defaultHomeContent.vipBanner.imageUrl).toMatch(/^https?:\/\//);
    expect(defaultHomeContent.vipBanner.href).toBeTruthy();
  });

  it("provides editable highlight slots linked to products", () => {
    expect(defaultHomeContent.highlights.length).toBeGreaterThanOrEqual(3);
    expect(defaultHomeContent.highlights.every((highlight) => highlight.id && highlight.productId > 0 && highlight.label)).toBe(true);
  });
});
