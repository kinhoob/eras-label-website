import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { ENV } from "./_core/env";
import type { TrpcContext } from "./_core/context";

function createContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("store procedures", () => {
  const originalResendApiKey = ENV.resendApiKey;
  const originalResendFromEmail = ENV.resendFromEmail;
  const originalMpAccessToken = ENV.mpAccessToken;

  beforeEach(() => {
    ENV.resendApiKey = "";
    ENV.resendFromEmail = "";
    ENV.mpAccessToken = "";
  });

  afterEach(() => {
    ENV.resendApiKey = originalResendApiKey;
    ENV.resendFromEmail = originalResendFromEmail;
    ENV.mpAccessToken = originalMpAccessToken;
  });

  it("generates a unique subscriber coupon", async () => {
    const caller = appRouter.createCaller(createContext());
    const result = await caller.newsletter.subscribe({ name: "Pessoa Teste", email: "teste@example.com" });
    expect(result.email).toBe("teste@example.com");
    expect(result.couponCode).toMatch(/^ERAS10/);
  });

  it("validates the fallback newsletter coupon", async () => {
    const caller = appRouter.createCaller(createContext());
    const result = await caller.coupons.validate({ code: "ERAS10", subtotal: 100 });
    expect(result.valid).toBe(true);
    expect(result.discount).toBe(10);
  });

  it("creates an approved checkout order payload", async () => {
    const caller = appRouter.createCaller(createContext());
    const result = await caller.checkout.create({
      customerName: "Pessoa Teste",
      customerEmail: "teste@example.com",
      customerCpf: "12345678901",
      phone: "81999999999",
      address: { cep: "50000000", street: "Rua Teste", number: "10", city: "Recife", state: "PE" },
      items: [{ productId: 1, size: "M", quantity: 1, price: 154.9 }],
      subtotal: 154.9,
      shippingCost: 0,
      discount: 0,
      total: 154.9,
      paymentMethod: "pix",
    });
    expect(result.success).toBe(true);
    expect(["approved", "pending"]).toContain(result.paymentStatus);
    expect(result.orderNumber).toMatch(/^ER-\d{4}-\d{4}$/);
  });

  it("fetches authenticated user orders history", async () => {
    const userContext: TrpcContext = {
      user: {
        id: 999,
        openId: "test-openid-999",
        email: "colecionador@eraslabel.com",
        name: "Colecionador Eras",
        loginMethod: "manus",
        role: "user",
        createdAt: new Date(),
        lastSignedIn: new Date(),
      },
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: { clearCookie: () => undefined } as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(userContext);
    const myOrders = await caller.orders.myOrders();
    expect(Array.isArray(myOrders)).toBe(true);
  });
});
