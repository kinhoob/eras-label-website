import { afterEach, describe, it, expect, vi } from "vitest";
import { calculateMelhorEnvioShipping, MelhorEnvioApiError } from "./melhor-envio";

describe("Melhor Envio Shipping Integration & Sales", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const quotePayload = {
    from: { postal_code: "50000000" },
    to: { postal_code: "01001000" },
    products: [
      {
        id: "1",
        width: 15,
        height: 10,
        length: 20,
        weight: 0.5,
        insurance_value: 100,
        quantity: 1,
      },
    ],
  };

  it("exposes a typed unauthorized error when Melhor Envio rejects the token", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ message: "Unauthenticated" }), {
        status: 401,
        headers: { "content-type": "application/json" },
      }),
    );

    const result = calculateMelhorEnvioShipping(quotePayload);
    await expect(result).rejects.toBeInstanceOf(MelhorEnvioApiError);
    await expect(result).rejects.toMatchObject({
      status: 401,
      isUnauthorized: true,
      details: "Unauthenticated",
    });
  });

  it("keeps only Correios PAC/SEDEX and Jadlog options", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify([
        { id: 1, name: "PAC", company: { name: "Correios" }, price: 20 },
        { id: 2, name: "SEDEX", company: { name: "Correios" }, price: 30 },
        { id: 3, name: "Jadlog Econômico", company: { name: "Jadlog" }, price: 18 },
        { id: 19, name: "Loggi", company: { name: "Loggi" }, price: 12 },
        { id: 20, name: "Azul Cargo", company: { name: "Azul" }, price: 25 },
      ]), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    const quotes = await calculateMelhorEnvioShipping(quotePayload);
    expect(quotes.map((quote: { id: number }) => quote.id)).toEqual([1, 2, 3]);
  });
});
