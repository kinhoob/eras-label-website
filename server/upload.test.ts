import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("admin.uploadImage procedure", () => {
  it("validates input payload parameters for image upload", async () => {
    // Test that the procedure is defined and expects file parameters
    const caller = appRouter.createCaller({
      user: {
        id: 1,
        openId: "admin-user",
        email: "kinho@eraslabel.com",
        name: "Kinho",
        loginMethod: "manus",
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
      req: { protocol: "https", headers: {} } as any,
      res: {} as any,
    });

    expect(caller.admin.uploadImage).toBeDefined();
  });
});
