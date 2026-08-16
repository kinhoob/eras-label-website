import { describe, expect, it } from "vitest";
import {
  PRODUCT_IMAGE_MAX_HEIGHT,
  PRODUCT_IMAGE_MAX_WIDTH,
  constrainImageDimensions,
  getImageOptimizationPlan,
} from "./image-optimizer";

describe("image optimizer", () => {
  it("mantém imagens menores sem as ampliar", () => {
    expect(constrainImageDimensions({ width: 800, height: 1000 })).toEqual({
      width: 800,
      height: 1000,
      scale: 1,
    });
  });

  it("redimensiona proporcionalmente imagens grandes dentro do limite do catálogo", () => {
    const result = constrainImageDimensions({ width: 4000, height: 3000 });
    expect(result.width).toBe(PRODUCT_IMAGE_MAX_WIDTH);
    expect(result.height).toBe(1200);
    expect(result.scale).toBe(0.4);
  });

  it("respeita primeiro a altura máxima em fotografias verticais", () => {
    const result = constrainImageDimensions({ width: 3000, height: 5000 });
    expect(result.width).toBe(1200);
    expect(result.height).toBe(PRODUCT_IMAGE_MAX_HEIGHT);
  });

  it("escolhe WebP em navegadores modernos e JPEG como fallback", () => {
    expect(getImageOptimizationPlan({ width: 1600, height: 2000 }, true).targetType).toBe("image/webp");
    expect(getImageOptimizationPlan({ width: 1600, height: 2000 }, false).targetType).toBe("image/jpeg");
  });

  it("rejeita dimensões inválidas para evitar canvas inconsistente", () => {
    expect(() => constrainImageDimensions({ width: 0, height: 100 })).toThrow(/maiores que zero/);
    expect(() => constrainImageDimensions({ width: 100, height: -1 })).toThrow(/maiores que zero/);
  });
});
