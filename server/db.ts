export async function deleteProductData(productId: number) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  await db.delete(productVariations).where(eq(productVariations.productId, productId));
  await db.delete(productCategories).where(eq(productCategories.productId, productId));
  await db.delete(products).where(eq(products.id, productId));
  return { success: true, id: productId };
}
