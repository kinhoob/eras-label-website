export type CartLineIdentity = {
  id: number;
  size: string;
  quantity: number;
};

export function updateCartLineQuantity<T extends CartLineIdentity>(cart: T[], productId: number, size: string, delta: number): T[] {
  if (!Number.isFinite(delta) || delta === 0) return cart;

  return cart
    .map((item) => item.id === productId && item.size === size ? { ...item, quantity: item.quantity + delta } : item)
    .filter((item) => item.quantity > 0);
}

export function removeCartLine<T extends CartLineIdentity>(cart: T[], productId: number, size: string): T[] {
  return cart.filter((item) => !(item.id === productId && item.size === size));
}
