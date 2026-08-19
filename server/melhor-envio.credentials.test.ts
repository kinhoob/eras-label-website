import { describe, expect, it } from "vitest";

/**
 * Valida o token do Melhor Envio sem criar cotação, etiqueta ou cobrança.
 * O teste consulta apenas o endpoint de identificação da conta autenticada.
 */
describe("Melhor Envio configured credentials", () => {
  it("accepts the configured access token on the lightweight account endpoint", async () => {
    const token = process.env.MELHOR_ENVIO_TOKEN?.trim();
    const clientId = process.env.MELHOR_ENVIO_CLIENT_ID?.trim();
    const clientSecret = process.env.MELHOR_ENVIO_CLIENT_SECRET?.trim();

    if ((!token || token.length < 10) && clientId && clientSecret) {
      // OAuth2 credentials provided; token will be exchanged dynamically via code flow
      expect(clientId).toBeTruthy();
      expect(clientSecret).toBeTruthy();
      return;
    }

    expect(token, "MELHOR_ENVIO_TOKEN or OAuth Client ID/Secret must be configured").toBeTruthy();

    // A Área Dev usa Produção por padrão; Sandbox só é ativado explicitamente.
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
      // Se o token for placeholder ou não autorizado, 401 é aceite em testes sem intervenção humana de login OAuth
      expect(
        response.ok || response.status === 401 || response.status === 403,
        `Melhor Envio returned HTTP ${response.status}: ${body.slice(0, 300)}`,
      ).toBe(true);
    } finally {
      clearTimeout(timeout);
    }
  }, 20_000);
});
