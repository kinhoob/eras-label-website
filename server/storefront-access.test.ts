import { describe, expect, it } from "vitest";
import {
  createStorefrontAccessToken,
  hashStorefrontPassword,
  hasValidStorefrontAccess,
  verifyStorefrontPassword,
} from "./storefront-access";

describe("storefront access password", () => {
  it("stores a salted scrypt hash and validates only the original password", () => {
    const password = "vip-eras-2026";
    const storedHash = hashStorefrontPassword(password);

    expect(storedHash).toMatch(/^scrypt\$[a-f0-9]{32}\$[a-f0-9]{64}$/);
    expect(storedHash).not.toContain(password);
    expect(verifyStorefrontPassword(password, storedHash)).toBe(true);
    expect(verifyStorefrontPassword("outra-palavra-passe", storedHash)).toBe(false);
    expect(verifyStorefrontPassword(password, "00000000000000000000000000000000")).toBe(false);
  });

  it("binds the unlock token to the stored password hash", () => {
    const firstHash = hashStorefrontPassword("primeira-senha");
    const secondHash = hashStorefrontPassword("segunda-senha");
    const firstToken = createStorefrontAccessToken(firstHash);

    expect(firstToken).toMatch(/^[a-f0-9]{64}$/);
    expect(hasValidStorefrontAccess(firstToken, firstHash)).toBe(true);
    expect(hasValidStorefrontAccess(firstToken, secondHash)).toBe(false);
    expect(hasValidStorefrontAccess(undefined, firstHash)).toBe(false);
    expect(hasValidStorefrontAccess("token-invalido", firstHash)).toBe(false);
  });
});
