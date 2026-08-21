import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const routers = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");
const db = readFileSync(resolve(process.cwd(), "server/db.ts"), "utf8");
const checkout = readFileSync(resolve(process.cwd(), "client/src/pages/Checkout.tsx"), "utf8");
const home = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
const serverBoot = readFileSync(resolve(process.cwd(), "server/_core/index.ts"), "utf8");
const webhookParser = readFileSync(resolve(process.cwd(), "server/melhor-envio-webhook.ts"), "utf8");
const checkoutBlock = routers.slice(routers.indexOf("create: publicProcedure"), routers.indexOf("regeneratePix: publicProcedure"));

describe("contrato seguro do checkout Eras Label", () => {
  it("recalcula produtos, cupom e frete no servidor", () => {
    expect(checkoutBlock).toContain("const verifiedItems");
    expect(checkoutBlock).toContain("validateCoupon(input.couponCode, verifiedSubtotal, input.customerEmail)");
    expect(checkoutBlock).toContain("calculateMelhorEnvioShipping");
    expect(checkoutBlock).toContain("const serverTotal");
    expect(checkoutBlock).toContain("input.clientTotal");
    expect(checkoutBlock).toContain("Opção de frete inválida ou expirada");
  });

  it("não persiste valores de subtotal, desconto ou frete fornecidos pelo cliente", () => {
    expect(checkoutBlock).toContain("subtotal: verifiedSubtotal.toFixed(2)");
    expect(checkoutBlock).toContain("shippingCost: verifiedShippingCost.toFixed(2)");
    expect(checkoutBlock).toContain("discount: verifiedDiscount.toFixed(2)");
    expect(checkoutBlock).not.toContain("shippingCost: input.shippingCost.toFixed(2)");
    expect(checkoutBlock).not.toContain("discount: input.discount.toFixed(2)");
    expect(checkoutBlock).not.toContain("input.total.toFixed(2)");
  });

  it("mantém o número do pedido no servidor e sincronizado com o pagamento", () => {
    expect(db).toContain("createOrder(data: typeof orders.$inferInsert, trustedOrderNumber?: string)");
    expect(db).toContain("const orderNumber = trustedOrderNumber || await generateNextOrderNumber()");
    expect(db).toContain("nunca confiar no campo orderNumber do payload público");
    expect(routers).toContain("}, orderNumber);");
    expect(checkout).not.toContain("orderNumber: createOrderReference()");
  });

  it("envia ao backend somente a prévia necessária para conferência", () => {
    expect(checkout).toContain("couponCode: couponApplied && coupon.trim() ? coupon.trim() : undefined");
    expect(checkout).toContain("shippingOptionId: (selectedShippingOption?.id ?? shippingOptionId) || undefined");
    expect(checkout).toContain("clientTotal: Number(total.toFixed(2))");
    expect(home).toContain("couponCode: couponApplied && coupon.trim() ? coupon.trim() : undefined");
    expect(home).toContain("shippingOptionId: activeShippingOption?.id || undefined");
    expect(home).toContain("clientTotal: Number(total.toFixed(2))");
  });

  it("bloqueia o boot de produção sem credenciais e mantém o webhook resiliente", () => {
    expect(serverBoot).toContain('if (process.env.NODE_ENV === "production")');
    expect(serverBoot).toContain("process.env.MP_ACCESS_TOKEN?.trim()");
    expect(serverBoot).toContain("process.env.MP_PUBLIC_KEY?.trim()");
    expect(serverBoot).toContain('app.post("/api/melhor-envio/webhook"');
    expect(serverBoot).toContain("resolveMelhorEnvioWebhookUpdate(event)");
    expect(webhookParser).toContain('newStatus = "Falha na entrega"');
    expect(webhookParser.indexOf('newStatus = "Falha na entrega"')).toBeLessThan(webhookParser.indexOf('newStatus = "Entregue"'));
    expect(serverBoot).toContain('res.status(200).json({ received: true, status: "success" });');
  });
});
