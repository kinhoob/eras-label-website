import { ENV } from "./_core/env";

export class MelhorEnvioApiError extends Error {
  constructor(
    public readonly operation: string,
    public readonly status: number,
    public readonly details: string,
  ) {
    super(`${operation}: ${status} - ${details}`);
    this.name = "MelhorEnvioApiError";
  }

  get isUnauthorized() {
    return this.status === 401;
  }
}

async function readApiError(response: Response) {
  const text = await response.text();
  if (!text.trim()) return "Resposta vazia da API.";
  try {
    const parsed = JSON.parse(text) as { message?: unknown; error?: unknown; errors?: unknown };
    const details = parsed.message ?? parsed.error ?? parsed.errors;
    return typeof details === "string" ? details : JSON.stringify(details ?? parsed);
  } catch {
    return text.slice(0, 500);
  }
}

export type MelhorEnvioQuoteItem = {
  id: string;
  width: number;
  height: number;
  length: number;
  weight: number;
  insurance_value: number;
  quantity: number;
};

export type MelhorEnvioQuotePayload = {
  from: { postal_code: string };
  to: { postal_code: string };
  products: MelhorEnvioQuoteItem[];
};

/**
 * Módulo de integração com a API do Melhor Envio (SandBox / Produção).
 * Permite calcular fretes, cotar serviços (PAC, SEDEX, Jadlog) e consultar rastreio.
 */
export async function calculateMelhorEnvioShipping(payload: MelhorEnvioQuotePayload) {
  const token = ENV.melhorEnvioToken || process.env.MELHOR_ENVIO_TOKEN || "";
  // Tokens criados na Área Dev usam a API principal; Sandbox só é ativado explicitamente.
  const isSandbox = process.env.MELHOR_ENVIO_SANDBOX === "true";
  const baseUrl = isSandbox 
    ? "https://sandbox.melhorenvio.com.br/api/v2" 
    : "https://www.melhorenvio.com.br/api/v2";

    // A Eras Label utiliza Correios PAC/SEDEX, Jadlog Econômico/Rápido e Loggi.
    const isAllowedShippingOption = (name: string, companyName?: string) => {
      const text = `${name} ${companyName || ""}`.toLowerCase();
      const isCorreios = text.includes("correios") || text.includes("pac") || text.includes("sedex");
      const isJadlog = text.includes("jadlog");
      const isLoggi = text.includes("loggi");
      if (isCorreios) return text.includes("pac") || text.includes("sedex");
      return isJadlog || isLoggi;
    };

    if (!token) {
      throw new MelhorEnvioApiError(
        "Token do Melhor Envio não configurado",
        401,
        "Configure MELHOR_ENVIO_TOKEN para calcular o frete real.",
      );
    }

    const response = await fetch(`${baseUrl}/me/shipment/calculate`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "User-Agent": "ErasLabelE-commerce (contato@eraslabel.com)",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const details = await readApiError(response);
      console.error("[Melhor Envio] Falha na cotação:", response.status, details);
      throw new MelhorEnvioApiError("Falha na cotação do Melhor Envio", response.status, details);
    }

    const data = await response.json();
    if (!Array.isArray(data)) return [];

    return data.filter((item: any) => {
      if (item.error) return false;
      return isAllowedShippingOption(item.name || "", item.company?.name);
    });
}

/**
 * Cria um pedido/etiqueta no carrinho do Melhor Envio (protegido por ação explícita do admin).
 */
export async function createMelhorEnvioCartItem(orderData: {
  serviceId: number;
  from: {
    name: string;
    phone: string;
    email: string;
    document: string;
    company_document?: string;
    address: string;
    number: string;
    complement?: string;
    district: string;
    city: string;
    state_abbr: string;
    postal_code: string;
  };
  to: {
    name: string;
    phone: string;
    email: string;
    document: string;
    address: string;
    number: string;
    complement?: string;
    district: string;
    city: string;
    state_abbr: string;
    postal_code: string;
  };
  products: Array<{
    name: string;
    quantity: number;
    unitary_value: number;
    weight: number;
    width: number;
    height: number;
    length: number;
  }>;
  volumes: Array<{
    height: number;
    width: number;
    length: number;
    weight: number;
  }>;
}) {
  const token = ENV.melhorEnvioToken || process.env.MELHOR_ENVIO_TOKEN || "";
  const isSandbox = process.env.MELHOR_ENVIO_SANDBOX === "true";
  const baseUrl = isSandbox 
    ? "https://sandbox.melhorenvio.com.br/api/v2" 
    : "https://www.melhorenvio.com.br/api/v2";

  if (!token) {
    throw new MelhorEnvioApiError("Token do Melhor Envio não configurado", 401, "Configure o token de produção.");
  }

  const response = await fetch(`${baseUrl}/me/cart`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "User-Agent": "ErasLabelE-commerce (contato@eraslabel.com)",
    },
    body: JSON.stringify(orderData),
  });

  const responseText = await response.text();
  let data: unknown;
  try {
    data = responseText ? JSON.parse(responseText) : {};
  } catch {
    data = { raw: responseText };
  }
  if (!response.ok) {
    const details = typeof data === "object" && data !== null && "message" in data
      ? String((data as { message?: unknown }).message)
      : JSON.stringify(data);
    throw new MelhorEnvioApiError("Falha ao adicionar o envio ao carrinho do Melhor Envio", response.status, details);
  }
  return data;
}

/**
 * Consulta o status de rastreio de um envio no Melhor Envio.
 */
export async function getMelhorEnvioTracking(shippingCodeOrId: string) {
  const token = ENV.melhorEnvioToken || process.env.MELHOR_ENVIO_TOKEN || "";
  const isSandbox = process.env.MELHOR_ENVIO_SANDBOX === "true";
  const baseUrl = isSandbox 
    ? "https://sandbox.melhorenvio.com.br/api/v2" 
    : "https://www.melhorenvio.com.br/api/v2";

  if (!token) {
    throw new MelhorEnvioApiError("Token do Melhor Envio não configurado", 401, "Configure o token de produção.");
  }

  const response = await fetch(`${baseUrl}/me/shipment/tracking`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "User-Agent": "ErasLabelE-commerce (contato@eraslabel.com)",
    },
    body: JSON.stringify({ orders: [shippingCodeOrId] }),
  });

  const responseText = await response.text();
  let data: unknown;
  try {
    data = responseText ? JSON.parse(responseText) : {};
  } catch {
    data = { raw: responseText };
  }
  if (!response.ok) {
    throw new MelhorEnvioApiError("Falha ao consultar rastreio no Melhor Envio", response.status, JSON.stringify(data));
  }
  return data;
}

/**
 * Solicita a impressão da etiqueta (PDF) no Melhor Envio para os IDs de pedidos informados no carrinho.
 */
export async function getMelhorEnvioPrintUrl(orderIds: string[]) {
  const token = ENV.melhorEnvioToken || process.env.MELHOR_ENVIO_TOKEN || "";
  const isSandbox = process.env.MELHOR_ENVIO_SANDBOX === "true";
  const baseUrl = isSandbox 
    ? "https://sandbox.melhorenvio.com.br/api/v2" 
    : "https://www.melhorenvio.com.br/api/v2";

  if (!token) {
    throw new MelhorEnvioApiError("Token do Melhor Envio não configurado", 401, "Configure o token de produção.");
  }

  const response = await fetch(`${baseUrl}/me/shipment/print`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "User-Agent": "ErasLabelE-commerce (contato@eraslabel.com)",
    },
    body: JSON.stringify({ orders: orderIds }),
  });

  const responseText = await response.text();
  let data: unknown;
  try {
    data = responseText ? JSON.parse(responseText) : {};
  } catch {
    data = { raw: responseText };
  }
  if (!response.ok) {
    throw new MelhorEnvioApiError("Falha ao gerar PDF da etiqueta no Melhor Envio", response.status, JSON.stringify(data));
  }
  return data; // Retorna { url: "https://..." } ou similar
}

/**
 * Baixa o arquivo da etiqueta pelo endpoint oficial e normaliza a resposta.
 * O Melhor Envio retorna o PDF como binário; algumas versões podem retornar um URL JSON.
 */
export async function downloadMelhorEnvioLabelFile(shipmentId: string) {
  const token = ENV.melhorEnvioToken || process.env.MELHOR_ENVIO_TOKEN || "";
  const isSandbox = process.env.MELHOR_ENVIO_SANDBOX === "true";
  const baseUrl = isSandbox
    ? "https://sandbox.melhorenvio.com.br/api/v2"
    : "https://www.melhorenvio.com.br/api/v2";

  if (!token) {
    throw new MelhorEnvioApiError("Token do Melhor Envio não configurado", 401, "Configure o token de produção.");
  }

  const response = await fetch(`${baseUrl}/me/imprimir/pdf/${encodeURIComponent(shipmentId)}`, {
    method: "GET",
    headers: {
      Accept: "application/pdf, application/json",
      Authorization: `Bearer ${token}`,
      "User-Agent": "ErasLabelE-commerce (contato@eraslabel.com)",
    },
  });

  const contentType = response.headers.get("content-type") || "";
  const body = new Uint8Array(await response.arrayBuffer());
  if (!response.ok) {
    const message = new TextDecoder().decode(body).slice(0, 500) || "Resposta vazia da API.";
    throw new MelhorEnvioApiError("Falha ao baixar o PDF da etiqueta no Melhor Envio", response.status, message);
  }

  if (contentType.includes("application/pdf") || contentType.includes("application/octet-stream")) {
    return { kind: "binary" as const, bytes: body, contentType: "application/pdf" };
  }

  const text = new TextDecoder().decode(body);
  try {
    const parsed = JSON.parse(text) as { url?: unknown };
    if (typeof parsed.url === "string" && parsed.url.trim()) {
      return { kind: "url" as const, url: parsed.url };
    }
  } catch {
    // A resposta não-JSON é tratada abaixo como URL textual, quando aplicável.
  }

  if (/^https?:\/\//i.test(text.trim())) {
    return { kind: "url" as const, url: text.trim() };
  }

  throw new Error("O Melhor Envio não retornou um PDF ou URL válido para a etiqueta.");
}
