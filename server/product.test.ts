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

    const result = await caller.admin.saveProduct({
      name: "Camiseta Paradox Oversized",
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
    expect(result.product.name).toBe("Camiseta Paradox Oversized");
    expect(result.product.images).toHaveLength(3);
    expect(result.product.images[0]).toBe("/manus-storage/admin-uploads/front.jpg");
  });
});
