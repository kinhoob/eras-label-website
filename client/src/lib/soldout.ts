export type SoldOutProductLike = {
  status?: unknown;
  stock?: unknown;
  totalStock?: unknown;
  variations?: unknown;
};

function numericStock(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * A product remains visible in the storefront when it is sold out, but its
 * purchase action must be disabled. Explicit status is authoritative; when
 * variations are present, the item is sold out only when every variation has
 * zero stock.
 */
export function isSoldOutProduct(product: SoldOutProductLike | null | undefined) {
  if (!product) return false;
  if (String(product.status ?? "").toLowerCase() === "soldout") return true;

  if (Array.isArray(product.variations) && product.variations.length > 0) {
    return product.variations.every((variation) => {
      const stock = variation && typeof variation === "object" && "stock" in variation
        ? (variation as { stock?: unknown }).stock
        : 0;
      return numericStock(stock) <= 0;
    });
  }

  const stockValue = product.stock ?? product.totalStock;
  return stockValue !== undefined && numericStock(stockValue) <= 0;
}

export function getSoldOutCardState(product: SoldOutProductLike | null | undefined) {
  const soldOut = isSoldOutProduct(product);
  return {
    soldOut,
    canAddToCart: !soldOut,
    badge: soldOut ? "ESGOTADO" : null,
  } as const;
}
