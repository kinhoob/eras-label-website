import { ENV } from "./_core/env";

/**
 * Utilitário OAuth2 para o Melhor Envio.
 * Permite gerar a URL de autorização e trocar o authorization code por access_token.
 */
export function getMelhorEnvioAuthUrl(redirectUri: string, state = "eras_auth"): string {
  const clientId = ENV.melhorEnvioClientId || process.env.MELHOR_ENVIO_CLIENT_ID || "";
  const isSandbox = process.env.MELHOR_ENVIO_SANDBOX === "true";
  const baseUrl = isSandbox
    ? "https://sandbox.melhorenvio.com.br"
    : "https://melhorenvio.com.br";

  const scopes = [
    "shipping-calculate",
    "ecommerce-shipping",
    "shipping-generate",
    "shipping-preview",
    "shipping-print",
    "shipping-tracking",
  ].join(" ");

  return `${baseUrl}/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri,
  )}&response_type=code&state=${state}&scope=${encodeURIComponent(scopes)}`;
}

export async function exchangeCodeForToken(code: string, redirectUri: string) {
  const clientId = ENV.melhorEnvioClientId || process.env.MELHOR_ENVIO_CLIENT_ID || "";
  const clientSecret = ENV.melhorEnvioClientSecret || process.env.MELHOR_ENVIO_CLIENT_SECRET || "";
  const isSandbox = process.env.MELHOR_ENVIO_SANDBOX === "true";
  const baseUrl = isSandbox
    ? "https://sandbox.melhorenvio.com.br"
    : "https://melhorenvio.com.br";

  const response = await fetch(`${baseUrl}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": "ErasLabelE-commerce (contato@eraslabel.com)",
    },
    body: JSON.stringify({
      grant_type: "authorization_code",
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code,
    }),
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(`Falha ao obter token do Melhor Envio: ${JSON.stringify(body)}`);
  }

  return body as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
  };
}
