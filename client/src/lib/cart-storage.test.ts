import { describe, expect, it } from "vitest";
import { CART_STORAGE_KEY, clearCart, loadCart, saveCart } from "./cart-storage";

function createMemoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  };
}

describe("cart storage", () => {
  it("saves and loads cart lines from a storage adapter", () => {
    const storage = createMemoryStorage();
    const cart = [{ id: 4, quantity: 2, size: "M" }];

    saveCart(cart, storage);

    expect(storage.getItem(CART_STORAGE_KEY)).toContain('"id":4');
    expect(loadCart(storage)).toEqual(cart);
  });

  it("clears the persisted cart after a completed order", () => {
    const storage = createMemoryStorage();
    saveCart([{ id: 9, quantity: 1 }], storage);

    clearCart(storage);

    expect(loadCart(storage)).toEqual([]);
    expect(storage.getItem(CART_STORAGE_KEY)).toBe("[]");
  });

  it("returns an empty cart for malformed or invalid stored data", () => {
    const storage = createMemoryStorage();
    storage.setItem(CART_STORAGE_KEY, "not-json");
    expect(loadCart(storage)).toEqual([]);

    storage.setItem(CART_STORAGE_KEY, JSON.stringify([{ id: 1, quantity: 0 }, { id: 2, quantity: 1 }]));
    expect(loadCart(storage)).toEqual([{ id: 2, quantity: 1 }]);
  });
});
