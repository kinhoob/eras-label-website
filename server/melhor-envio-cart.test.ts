import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMelhorEnvioCartItem, MelhorEnvioApiError } from "./melhor-envio";

const basePayload = {
  serviceId: 7,
  order: { id: "42", order_number: "ER-2026-0042" },
  from: {
    name: "Eras Label Oficial",
    phone: "11999999999",
    email: "contato@eraslabel.com",
    document: "00000000000",
    address: "Rua Eras",
    number: "100",
    district: "Centro",
    city: "São Paulo",
    state_abbr: "SP",
    postal_code: "01001000",
  },
  to: {
    name: "Cliente Eras",
    phone: "11999999999",
    email: "cliente@example.com",
    document: "00000000000",
    address: "Rua do Cliente",
    number: "10",
    district: "Centro",
    city: "Olinda",
    state_abbr: "PE",
    postal_code: "53000000",
  },
  products: [{ name: "Camiseta Eras", quantity: 1, unitary_value: 154.9, weight: 0.3, width: 20, height: 8, length: 30 }],
  volumes: [{ height: 8, width: 20, length: 30, weight: 0.3 }],
};

describe("createMelhorEnvioCartItem", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubEnv("MELHOR_ENVIO_TOKEN", "test-token");
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ id: "shipment-123" }), { status: 200, headers: { "content-type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    fetchMock.mockReset();
  });

  it("envia o identificador como service no payload da API", async () => {
    await createMelhorEnvioCartItem(basePayload);

    const [, request] = fetchMock.mock.calls[0] as [string, RequestInit];
    const payload = JSON.parse(String(request.body));

    expect(payload.service).toBe(7);
    expect(payload).not.toHaveProperty("serviceId");
    expect(payload.order).toEqual({ id: "42", order_number: "ER-2026-0042" });
    expect(payload.options.tags).toEqual([{ tag: "ER-2026-0042", url: null }]);
    expect(payload.options.insurance_value).toBe(154.9);
  });

  it("rejeita um serviço inválido antes de chamar a API", async () => {
    await expect(createMelhorEnvioCartItem({ ...basePayload, serviceId: 0 })).rejects.toMatchObject<Partial<MelhorEnvioApiError>>({
      status: 422,
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejeita pedido sem order_number antes de chamar a API", async () => {
    await expect(createMelhorEnvioCartItem({ ...basePayload, order: { id: "42", order_number: "" } })).rejects.toMatchObject<Partial<MelhorEnvioApiError>>({
      status: 422,
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
