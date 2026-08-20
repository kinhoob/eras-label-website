export const PIX_EXPIRATION_MINUTES = 30;
export const PIX_EXPIRATION_MS = PIX_EXPIRATION_MINUTES * 60 * 1000;

export function createPixExpirationDate(now = new Date()) {
  return new Date(now.getTime() + PIX_EXPIRATION_MS);
}

export function getPixRemainingMs(expiresAt: string | Date | null | undefined, now = Date.now()) {
  if (!expiresAt) return 0;
  const timestamp = expiresAt instanceof Date ? expiresAt.getTime() : Date.parse(expiresAt);
  if (!Number.isFinite(timestamp)) return 0;
  return Math.max(0, timestamp - now);
}

export function isPixExpired(expiresAt: string | Date | null | undefined, now = Date.now()) {
  return getPixRemainingMs(expiresAt, now) <= 0;
}
