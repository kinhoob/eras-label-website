import { describe, it, expect } from "vitest";
import { getDb } from "./db";
import { products } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("fluxo ponta a ponta de persistência de descrição e guia de tamanhos", () => {
  it("salva, atualiza e recupera corretamente descrição e sizeGuide na base de dados", async () => {
    const db = await getDb();
    expect(db).toBeDefined();
    if (!db) return;

    const testSlug = `e2e-test-product-${Date.now()}`;
    const testSizeGuide = [
      { size: "P", width: "50 cm", length: "70 cm" },
      { size: "G", width: "56 cm", length: "74 cm" },
    ];
    const testDescription = "Descrição oficial de teste E2E para a peça Eras Label.";

    // 1. Inserir produto com descrição e sizeGuide
    const [inserted] = await db.insert(products).values({
      name: "Produto Teste E2E",
      collection: "DRAFTS",
      category: "Camisetas",
      price: "100.00",
      pixPrice: "90.00",
      slug: testSlug,
      description: testDescription,
      sizeGuide: testSizeGuide,
      status: "Publicado",
      images: ["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80"],
    });

    const productId = Number(inserted.insertId);
    expect(productId).toBeGreaterThan(0);

    // 2. Ler do banco (simulando reabertura no Admin / Carregamento público)
    const [fetched] = await db.select().from(products).where(eq(products.id, productId));
    expect(fetched).toBeDefined();
    expect(fetched.description).toBe(testDescription);
    expect(fetched.sizeGuide).toEqual(testSizeGuide);

    // 3. Atualizar descrição e guia (simulando nova edição no Admin)
    const updatedDescription = "Descrição atualizada via teste E2E.";
    const updatedSizeGuide = [{ size: "M", width: "52 cm", length: "72 cm" }];

    await db.update(products).set({
      description: updatedDescription,
      sizeGuide: updatedSizeGuide,
    }).where(eq(products.id, productId));

    // 4. Ler novamente e confirmar valores atualizados
    const [refetched] = await db.select().from(products).where(eq(products.id, productId));
    expect(refetched.description).toBe(updatedDescription);
    expect(refetched.sizeGuide).toEqual(updatedSizeGuide);

    // Limpeza do registro de teste
    await db.delete(products).where(eq(products.id, productId));
  });
});
