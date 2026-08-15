import { describe, expect, it } from "vitest";
import { validateCoupon, getCommercialConfig } from "./db";

describe("backend commercial and coupon integration", () => {
  it("validates fallback and dynamic commercial config", async () => {
    const config = await getCommercialConfig();
    expect(config).toBeDefined();
    expect(typeof config.pixDiscountPercent).toBe("number");
    expect(typeof config.freeShippingThreshold).toBe("number");
  });

  it("validates ERAS10 coupon correctly", async () => {
    const result = await validateCoupon("ERAS10", 200);
    expect(result.valid).toBe(true);
    expect(result.discount).toBe(20);
    expect(result.code).toBe("ERAS10");
  });

  it("rejects invalid or expired coupons", async () => {
    const result = await validateCoupon("INEXISTENTE", 200);
    expect(result.valid).toBe(false);
    expect(result.discount).toBe(0);
  });
});
