export const CART_STORAGE_KEY = "eras-label-cart";

type StorageLike = Pick<Storage, "getItem" | "setItem">;

function getStorage(storage?: StorageLike): StorageLike | undefined {
  if (storage) return storage;
  if (typeof window === "undefined") return undefined;
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

function isPersistableLine(value: unknown): value is { id: number; quantity: number } {
  if (!value || typeof value !== "object") return false;
  const line = value as { id?: unknown; quantity?: unknown };
  return typeof line.id === "number" && Number.isFinite(line.id) && typeof line.quantity === "number" && Number.isFinite(line.quantity) && line.quantity > 0;
}

export function loadCart<T>(storage?: StorageLike): T[] {
  const target = getStorage(storage);
  if (!target) return [];

  try {
    const raw = target.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isPersistableLine) as T[];
  } catch {
    return [];
  }
}

export function saveCart<T>(cart: T[], storage?: StorageLike) {
  const target = getStorage(storage);
  if (!target) return;

  try {
    target.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch {
    // Storage may be disabled or full; the in-memory cart remains usable.
  }
}

export function clearCart(storage?: StorageLike) {
  const target = getStorage(storage);
  if (!target) return;

  try {
    target.setItem(CART_STORAGE_KEY, "[]");
  } catch {
    // Storage may be disabled or full; checkout can still finish in-memory.
  }
}
