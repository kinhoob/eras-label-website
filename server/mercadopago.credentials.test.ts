import { describe, expect, it } from "vitest";

describe("Mercado Pago credentials", () => {
  it("accepts the configured production access token on a lightweight endpoint", async () => {
    const accessToken = process.env.MP_ACCESS_TOKEN?.trim();
    expect(accessToken, "MP_ACCESS_TOKEN must be configured").toBeTruthy();
    expect(accessToken, "MP_ACCESS_TOKEN must be a production token starting with APP_USR-").toMatch(/^APP_USR-/);

    const response = await fetch("https://api.mercadopago.com/v1/payment_methods", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    // Credenciais inválidas devem interromper a validação, em vez de serem
    // aceitas silenciosamente como acontecia no teste anterior.
    expect(response.status, `Mercado Pago rejeitou o Access Token com HTTP ${response.status}`).not.toBe(401);
    expect(response.status, `Mercado Pago proibiu o Access Token com HTTP ${response.status}`).not.toBe(403);

    expect(response.ok, `Endpoint de métodos de pagamento retornou HTTP ${response.status}`).toBe(true);
    const methods = await response.json();
    expect(Array.isArray(methods)).toBe(true);
  }, 20_000);
});
