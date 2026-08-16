import { describe, expect, it } from "vitest";
import { DEFAULT_STOREFRONT_CONFIG } from "./storefront";
import { getDropRemainingTime, hasStorefrontAnnouncement, isStorefrontLocked } from "./storefront-logic";

describe("storefront logic", () => {
  it("identifica quando a loja está trancada", () => {
    expect(isStorefrontLocked(DEFAULT_STOREFRONT_CONFIG)).toBe(false);
    expect(isStorefrontLocked({ ...DEFAULT_STOREFRONT_CONFIG, maintenance: { ...DEFAULT_STOREFRONT_CONFIG.maintenance, enabled: true } })).toBe(true);
    expect(isStorefrontLocked(undefined)).toBe(false);
  });

  it("só exibe o anúncio quando ele está ativo e tem texto", () => {
    expect(hasStorefrontAnnouncement(DEFAULT_STOREFRONT_CONFIG)).toBe(true);
    expect(hasStorefrontAnnouncement({ ...DEFAULT_STOREFRONT_CONFIG, announcement: { ...DEFAULT_STOREFRONT_CONFIG.announcement, enabled: false } })).toBe(false);
    expect(hasStorefrontAnnouncement({ ...DEFAULT_STOREFRONT_CONFIG, announcement: { ...DEFAULT_STOREFRONT_CONFIG.announcement, text: "   " } })).toBe(false);
    expect(hasStorefrontAnnouncement(null)).toBe(false);
  });

  it("calcula dias, horas, minutos e segundos restantes de forma estável", () => {
    const now = Date.parse("2026-08-16T12:00:00.000Z");
    const target = "2026-08-18T15:32:45.000Z";
    expect(getDropRemainingTime(target, now)).toEqual({ total: 185_565_000, days: 2, hours: 3, minutes: 32, seconds: 45 });
    expect(getDropRemainingTime("2026-08-16T11:59:59.000Z", now).total).toBe(0);
    expect(getDropRemainingTime(null, now).total).toBe(0);
  });
});
