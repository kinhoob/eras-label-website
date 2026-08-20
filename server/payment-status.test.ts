import { describe, expect, it } from "vitest";
import { mapMercadoPagoOrderStatus } from "./db";

describe("Mercado Pago payment status reconciliation", () => {
  it("maps an approved Pix payment to a processing order and marks it confirmed", () => {
    expect(mapMercadoPagoOrderStatus("approved")).toEqual({
      normalizedStatus: "approved",
      nextStatus: "Processando",
      isConfirmed: true,
    });
  });

  it("normalizes authorized payments as confirmed too", () => {
    expect(mapMercadoPagoOrderStatus("AUTHORIZED")).toEqual({
      normalizedStatus: "authorized",
      nextStatus: "Processando",
      isConfirmed: true,
    });
  });

  it("keeps a Pix waiting for transfer as awaiting payment", () => {
    expect(mapMercadoPagoOrderStatus("pending")).toEqual({
      normalizedStatus: "pending",
      nextStatus: "Aguardando pagamento",
      isConfirmed: false,
    });
  });

  it("keeps in-process payments under analysis", () => {
    expect(mapMercadoPagoOrderStatus("in_process")).toEqual({
      normalizedStatus: "in_process",
      nextStatus: "Em análise",
      isConfirmed: false,
    });
  });

  it("maps rejected and cancelled payments to a refusal state", () => {
    expect(mapMercadoPagoOrderStatus("rejected").nextStatus).toBe("Pagamento recusado");
    expect(mapMercadoPagoOrderStatus("cancelled").nextStatus).toBe("Pagamento recusado");
  });

  it("does not treat unknown statuses as approved", () => {
    expect(mapMercadoPagoOrderStatus("unknown").isConfirmed).toBe(false);
    expect(mapMercadoPagoOrderStatus("unknown").nextStatus).toBe("Aguardando pagamento");
  });
});
