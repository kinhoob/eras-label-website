import { describe, expect, it } from "vitest";
import { ENV } from "./_core/env";

describe("Mercado Pago configured credentials", () => {
  it("accepts the configured access token on the lightweight account endpoint", async () => {
    expect(ENV.mpAccessToken, "MP_ACCESS_TOKEN must be configured").toBeTruthy();

    const response = await fetch("https://api.mercadopago.com/users/me", {
      headers: { Authorization: `Bearer ${ENV.mpAccessToken}` },
      signal: AbortSignal.timeout(15_000),
    });
    const data = (await response.json()) as { id?: number; error?: string; message?: string };

    expect(response.ok, `${data.error ?? "Mercado Pago"}: ${data.message ?? "request failed"}`).toBe(true);
    expect(typeof data.id).toBe("number");
  });
});
