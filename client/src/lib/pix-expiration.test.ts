import { describe, expect, it } from "vitest";
import { PIX_EXPIRATION_MS, createPixExpirationDate, getPixRemainingMs, isPixExpired } from "@shared/pix";

describe("PIX expiration", () => {
  it("creates an expiration exactly 30 minutes after generation", () => {
    const generatedAt = new Date("2026-08-20T20:00:00.000Z");
    const expiresAt = createPixExpirationDate(generatedAt);

    expect(expiresAt.toISOString()).toBe("2026-08-20T20:30:00.000Z");
    expect(expiresAt.getTime() - generatedAt.getTime()).toBe(PIX_EXPIRATION_MS);
  });

  it("keeps the QR Code valid before 30 minutes and expires it at the deadline", () => {
    const expiresAt = "2026-08-20T20:30:00.000Z";
    const beforeExpiration = Date.parse("2026-08-20T20:29:59.000Z");
    const atExpiration = Date.parse("2026-08-20T20:30:00.000Z");

    expect(getPixRemainingMs(expiresAt, beforeExpiration)).toBe(1000);
    expect(isPixExpired(expiresAt, beforeExpiration)).toBe(false);
    expect(getPixRemainingMs(expiresAt, atExpiration)).toBe(0);
    expect(isPixExpired(expiresAt, atExpiration)).toBe(true);
  });

  it("treats missing or malformed expiration as expired instead of keeping a stale QR Code active", () => {
    expect(isPixExpired(null, Date.now())).toBe(true);
    expect(isPixExpired("not-a-date", Date.now())).toBe(true);
  });
});
