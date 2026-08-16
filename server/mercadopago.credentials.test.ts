import { describe, expect, it } from "vitest";

describe("Mercado Pago credentials", () => {
  it("accepts the configured test access token on a lightweight endpoint", async () => {
    const accessToken = process.env.MP_ACCESS_TOKEN?.trim();
    expect(accessToken, "MP_ACCESS_TOKEN must be configured").toBeTruthy();

    const response = await fetch("https://api.mercadopago.com/v1/payment_methods", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    expect(response.ok, `Mercado Pago returned HTTP ${response.status}`).toBe(true);
    const methods = await response.json();
    expect(Array.isArray(methods)).toBe(true);
  }, 20_000);
});
