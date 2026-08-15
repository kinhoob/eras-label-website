import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";

function createTestContext() {
  const cookie = { value: "" };
  return {
    req: {
      headers: {},
      protocol: "https",
      secure: true,
      get: () => "https",
    } as never,
    res: {
      cookie: (_name: string, value: string) => {
        cookie.value = value;
        return undefined;
      },
      clearCookie: () => undefined,
    } as never,
    user: null,
    cookie,
  };
}

describe("admin authentication endpoint", () => {
  it("accepts the configured admin credentials and creates a session cookie", async () => {
    const context = createTestContext();
    const caller = appRouter.createCaller(context);

    const result = await caller.auth.adminLogin({
      email: "theeraslabel@gmail.com",
      password: "Erasl@bel2025",
    });

    expect(result.success).toBe(true);
    expect(result.user.email).toBe("theeraslabel@gmail.com");
    expect(result.user.role).toBe("admin");
    expect(context.cookie.value.length).toBeGreaterThan(20);
  });

  it("rejects an incorrect password without creating a session", async () => {
    const context = createTestContext();
    const caller = appRouter.createCaller(context);

    await expect(
      caller.auth.adminLogin({
        email: "theeraslabel@gmail.com",
        password: "senha-incorreta",
      }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });

    expect(context.cookie.value).toBe("");
  });

  it("blocks an authenticated non-admin from admin procedures", async () => {
    const context = createTestContext();
    const caller = appRouter.createCaller({
      ...context,
      user: {
        id: 7,
        openId: "customer-open-id",
        name: "Cliente",
        email: "cliente@example.com",
        loginMethod: "admin-password",
        role: "user",
        lastSignedIn: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    await expect(caller.admin.listProducts()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
