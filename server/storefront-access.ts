import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { ENV } from "./_core/env";

export const STOREFRONT_ACCESS_COOKIE = "eras_storefront_access";

function hashPassword(password: string, salt: string) {
  return scryptSync(password, salt, 32).toString("hex");
}

export function hashStorefrontPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `scrypt$${salt}$${hashPassword(password, salt)}`;
}

export function verifyStorefrontPassword(password: string, storedHash: string) {
  const [algorithm, salt, digest] = storedHash.split("$");
  if (algorithm !== "scrypt" || !salt || !digest || !/^[a-f0-9]{64}$/i.test(digest)) return false;
  const expected = Buffer.from(digest, "hex");
  const actual = Buffer.from(hashPassword(password, salt), "hex");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function createStorefrontAccessToken(storedHash: string) {
  const secret = ENV.cookieSecret;
  if (!secret || !storedHash) return "";
  return createHmac("sha256", secret).update(`eras-storefront-access:${storedHash}`).digest("hex");
}

export function hasValidStorefrontAccess(cookieValue: string | undefined, storedHash: string | null) {
  if (!cookieValue || !storedHash) return false;
  const expected = createStorefrontAccessToken(storedHash);
  if (!expected || cookieValue.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(cookieValue), Buffer.from(expected));
}

export function hashLegacyStorefrontPassword(password: string) {
  return createHash("sha256").update(password).digest("hex");
}
