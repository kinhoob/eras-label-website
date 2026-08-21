import { describe, expect, it } from "vitest";
import { resolveMelhorEnvioWebhookUpdate } from "./melhor-envio-webhook";

describe("mapeamento do webhook Melhor Envio", () => {
  it("atualiza por trackingCode quando o envio entra em trânsito", () => {
    expect(resolveMelhorEnvioWebhookUpdate({ tracking_code: "BR123", status: "shipped" })).toEqual({
      trackingCode: "BR123",
      shippingOrderId: null,
      newStatus: "Em trânsito",
      newFulfillment: "shipped",
    });
  });

  it("aceita shippingOrderId aninhado e marca entrega concluída", () => {
    expect(resolveMelhorEnvioWebhookUpdate({ data: { id: "ME-55", status: "delivered" } })).toEqual({
      trackingCode: null,
      shippingOrderId: "ME-55",
      newStatus: "Entregue",
      newFulfillment: "shipped",
    });
  });

  it("não confunde undelivered com delivered", () => {
    expect(resolveMelhorEnvioWebhookUpdate({ tracking: "BR999", event: "undelivered" })).toEqual({
      trackingCode: "BR999",
      shippingOrderId: null,
      newStatus: "Falha na entrega",
      newFulfillment: null,
    });
  });
});
