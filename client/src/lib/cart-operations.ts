export type CartLineIdentity = {
  id: number;
  size: string;
  color?: string;
  quantity: number;
};

export function updateCartLineQuantity<T extends CartLineIdentity>(cart: T[], productId: number, size: string, delta: number, _legacyColor?: string): T[] {
  if (!Number.isFinite(delta) || delta === 0) return cart;

  return cart
    .map((item) => {
      const match = item.id === productId && item.size === size;
      return match ? { ...item, quantity: item.quantity + delta } : item;
    })
    .filter((item) => item.quantity > 0);
}

export function removeCartLine<T extends CartLineIdentity>(cart: T[], productId: number, size: string, _legacyColor?: string): T[] {
  return cart.filter((item) => !(item.id === productId && item.size === size));
}
