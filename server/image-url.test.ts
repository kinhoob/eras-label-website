import { describe, expect, it } from "vitest";
import { isValidImageUrl } from "./routers";

describe("image URL validation", () => {
  it("accepts URLs produced by the persistent upload storage", () => {
    expect(isValidImageUrl("/manus-storage/admin-uploads/home-banner.webp")).toBe(true);
    expect(isValidImageUrl("/manus-storage/admin-uploads/product-front.jpg")).toBe(true);
  });

  it("accepts external HTTPS image URLs used by configured defaults", () => {
    expect(isValidImageUrl("https://cdn.example.com/eras-banner.webp")).toBe(true);
  });

  it("rejects malformed or unsafe image references", () => {
    expect(isValidImageUrl("data:image/png;base64,abc")).toBe(false);
    expect(isValidImageUrl("javascript:alert(1)")).toBe(false);
    expect(isValidImageUrl("not-an-image-url")).toBe(false);
  });
});
