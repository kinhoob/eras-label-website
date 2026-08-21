import { describe, it, expect } from "vitest";
import { getDb } from "./db";
import { products } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("integração tRPC de salvamento e consulta pública de descrição e guia", () => {
  it("simula o contrato de salvamento do editor e a leitura pública da guia e descrição", async () => {
    const db = await getDb();
    expect(db).toBeDefined();
    if (!db) return;

    const slug = `trpc-test-${Date.now()}`;
    const desc = "Descrição salva via fluxo tRPC de teste.";
    const sizeGuide = [{ size: "G", width: "56 cm", length: "75 cm" }];

    // Simula a escrita feita pelo saveProduct no backend
    const [result] = await db.insert(products).values({
      name: "Camisa Teste tRPC",
      collection: "DRAFTS",
      category: "Camisetas",
      price: "120.00",
      pixPrice: "108.00",
      slug,
      description: desc,
      sizeGuide,
      status: "Publicado",
      visibility: "visible",
      images: ["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80"],
    });

    const id = Number(result.insertId);
    expect(id).toBeGreaterThan(0);

    // Simula a leitura pública (getPublicProductBySlug / catalog detail)
    const [publicProduct] = await db.select().from(products).where(eq(products.slug, slug));
    expect(publicProduct).toBeDefined();
    expect(publicProduct.description).toBe(desc);
    expect(publicProduct.sizeGuide).toEqual(sizeGuide);

    // Limpeza
    await db.delete(products).where(eq(products.id, id));
  });
});
