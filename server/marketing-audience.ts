export type CollectionProduct = { id: number; collection: string };
export type CollectionOrder = { customerEmail: string; customerName: string | null; items: unknown };
export type MarketingRecipient = { email: string; name: string | null };

export function collectCollectionRecipients(
  collection: string,
  collectionProducts: CollectionProduct[],
  orderRows: CollectionOrder[],
): MarketingRecipient[] {
  const requestedCollection = collection.trim().toLocaleLowerCase();
  if (!requestedCollection) return [];

  const productIds = new Set(
    collectionProducts
      .filter((product) => product.collection.trim().toLocaleLowerCase() === requestedCollection)
      .map((product) => product.id),
  );
  if (productIds.size === 0) return [];

  const recipients = new Map<string, MarketingRecipient>();
  for (const order of orderRows) {
    const items = Array.isArray(order.items) ? order.items : [];
    const purchasedCollectionProduct = items.some((item) => {
      if (!item || typeof item !== "object") return false;
      const productId = Number((item as { productId?: unknown }).productId);
      return Number.isInteger(productId) && productIds.has(productId);
    });
    const email = order.customerEmail.trim().toLocaleLowerCase();
    if (purchasedCollectionProduct && email) {
      recipients.set(email, { email, name: order.customerName ?? null });
    }
  }

  return Array.from(recipients.values());
}
