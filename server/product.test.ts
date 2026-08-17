import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createAdminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-user",
      email: "admin@eraslabel.com",
      name: "Admin Kinho",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as any,
    res: {} as any,
  };
}

describe("admin.saveProduct with multiple images", () => {
  it("persists product with gallery images and correct order", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const uniqueName = `Camiseta Paradox Oversized ${Date.now().toString(36)}`;

    const result = await caller.admin.saveProduct({
      name: uniqueName,
      collection: "PARADOX COLLECTION",
      category: "Camisetas",
      price: 154.90,
      pixPrice: 147.15,
      description: "Camiseta de alta gramatura com estampa em serigrafia de alta definição.",
      images: [
        "/manus-storage/admin-uploads/front.jpg",
        "/manus-storage/admin-uploads/back.jpg",
        "/manus-storage/admin-uploads/detail.jpg"
      ],
      status: "Publicado",
    });

    expect(result.success).toBe(true);
    expect(result.product.name).toBe(uniqueName);
    expect(result.product.images).toHaveLength(3);
    expect(result.product.images[0]).toBe("/manus-storage/admin-uploads/front.jpg");
  });
});


describe("admin.saveProduct visibility and link contract", () => {
  it("accepts a custom slug, unlisted visibility and multiple category IDs", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const uniqueSlug = `produto-link-privado-${Date.now().toString(36)}`;
    const result = await caller.admin.saveProduct({
      name: "Produto de contrato de visibilidade",

      collection: "TESTE",
      category: "Camisetas",
      price: 120,
      pixPrice: 114,
      description: "Produto utilizado apenas para validar o contrato administrativo.",
      images: [],
      status: "Rascunho",
      visibility: "unlisted",
      slug: uniqueSlug,
      categoryIds: [1, 2],
      variations: [],
    });

    expect(result.success).toBe(true);
    expect(result.product.visibility).toBe("unlisted");
    expect(result.product.slug).toBe(uniqueSlug);
    expect(result.product.categoryIds).toEqual([1, 2]);
  });

  it("rejects a visibility value outside the supported states", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    await expect(caller.admin.saveProduct({
      name: "Produto inválido de visibilidade",
      collection: "TESTE",
      category: "Camisetas",
      price: 120,
      pixPrice: 114,
      description: "Produto utilizado apenas para validar a rejeição.",
      images: [],
      status: "Rascunho",
      visibility: "public" as never,
      slug: "produto-invalido",
      categoryIds: [],
      variations: [],
    })).rejects.toThrow();
  });
});
