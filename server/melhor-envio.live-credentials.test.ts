import { describe, expect, it } from "vitest";

describe("Melhor Envio live credential validation", () => {
  it("authenticates against the lightweight account endpoint without creating shipments", async () => {
    const token = process.env.MELHOR_ENVIO_TOKEN?.trim();
    expect(token, "MELHOR_ENVIO_TOKEN precisa estar configurado").toBeTruthy();

    const isSandbox = process.env.MELHOR_ENVIO_SANDBOX === "true";
    const baseUrl = isSandbox
      ? "https://sandbox.melhorenvio.com.br/api/v2"
      : "https://www.melhorenvio.com.br/api/v2";
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);

    try {
      const response = await fetch(`${baseUrl}/me`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "User-Agent": "ErasLabelE-commerce (contato@eraslabel.com)",
        },
        signal: controller.signal,
      });
      const body = await response.text();

      expect(
        response.ok,
        `A API do Melhor Envio recusou a credencial com HTTP ${response.status}: ${body.slice(0, 300)}`,
      ).toBe(true);
    } finally {
      clearTimeout(timeout);
    }
  }, 20_000);
});
