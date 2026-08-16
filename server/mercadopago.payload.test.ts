import { describe, expect, it, vi } from "vitest";
import { buildMercadoPagoPaymentPayload, createMercadoPagoPayment } from "./mercadopago";

describe("Mercado Pago payment payload", () => {
  const baseParams = {
    transaction_amount: 167.16,
    description: "Pedido ER-2026-1234 - Eras Label",
    payment_method_id: "pix",
    payer: {
      email: "test@testuser.com",
      first_name: "APRO",
      last_name: "APRO",
      identification: { type: "CPF", number: "12345678909" },
      address: {
        zip_code: "01310-100",
        street_name: "Avenida Paulista",
        street_number: "1000",
        neighborhood: "Bela Vista",
        city: "São Paulo",
        federal_unit: "sp",
      },
    },
    external_reference: "ER-2026-1234",
  } as const;

  it("normalizes address fields without dropping the payer data", () => {
    const payload = buildMercadoPagoPaymentPayload(baseParams);

    expect(payload.payment_method_id).toBe("pix");
    expect(payload.transaction_amount).toBe(167.16);
    expect(payload.payer.email).toBe("test@testuser.com");
    expect(payload.payer.address).toEqual({
      zip_code: "01310100",
      street_name: "Avenida Paulista",
      street_number: "1000",
      neighborhood: "Bela Vista",
      city: "São Paulo",
      federal_unit: "SP",
    });
  });

  it("uses one stable idempotency key across retries of the same order", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ id: 123, status: "pending" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await createMercadoPagoPayment(baseParams);
    await createMercadoPagoPayment(baseParams);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][1].headers["X-Idempotency-Key"]).toBe("ER-2026-1234-v1");
    expect(fetchMock.mock.calls[1][1].headers["X-Idempotency-Key"]).toBe("ER-2026-1234-v1");

    vi.unstubAllGlobals();
  });

  it("explica o erro 2034 quando as credenciais pertencem a contas sandbox diferentes", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        error: "bad_request",
        message: "Invalid users involved",
        cause: [{ code: 2034, description: "Invalid users involved" }],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(createMercadoPagoPayment(baseParams)).rejects.toThrow(
      "não pertencem à mesma conta vendedora",
    );

    vi.unstubAllGlobals();
  });
});
