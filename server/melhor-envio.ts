import { ENV } from "./_core/env";

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

  // Se o token não estiver configurado, retorna estimativas calculadas de fallback realistas
  if (!token) {
    const cepNum = parseInt(payload.to.postal_code.replace(/\D/g, ""), 10) || 50000000;
    const isSudesteOrNordeste = cepNum >= 20000000 && cepNum <= 69999999;
    const baseValue = isSudesteOrNordeste ? 24.90 : 38.50;

    return [
      {
        id: 1,
        name: "SEDEX (Melhor Envio)",
        company: { name: "Correios" },
        price: Number((baseValue * 1.45).toFixed(2)),
        custom_price: Number((baseValue * 1.45).toFixed(2)),
        discount: 0,
        delivery_time: 3,
        error: null,
      },
      {
        id: 2,
        name: "PAC (Melhor Envio)",
        company: { name: "Correios" },
        price: Number(baseValue.toFixed(2)),
        custom_price: Number(baseValue.toFixed(2)),
        discount: 0,
        delivery_time: 7,
        error: null,
      },
      {
        id: 3,
        name: "Jadlog Package",
        company: { name: "Jadlog" },
        price: Number((baseValue * 0.95).toFixed(2)),
        custom_price: Number((baseValue * 0.95).toFixed(2)),
        discount: 0,
        delivery_time: 5,
        error: null,
      },
    ];
  }

  try {
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
      const errText = await response.text();
      console.warn("[Melhor Envio] Erro na cotação:", errText);
      throw new Error(`Melhor Envio API error: ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data.filter((item: any) => !item.error) : [];
  } catch (err) {
    console.warn("[Melhor Envio] Falha na requisição, usando fallback:", err);
    return [
      {
        id: 1,
        name: "SEDEX (Melhor Envio)",
        company: { name: "Correios" },
        price: 35.00,
        custom_price: 35.00,
        discount: 0,
        delivery_time: 3,
        error: null,
      },
      {
        id: 2,
        name: "PAC (Melhor Envio)",
        company: { name: "Correios" },
        price: 22.00,
        custom_price: 22.00,
        discount: 0,
        delivery_time: 7,
        error: null,
      },
    ];
  }
}
