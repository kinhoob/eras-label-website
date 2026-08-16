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

    // Helper para verificar se a opção de frete é permitida (Correios PAC/SEDEX, Jadlog Econômico/Rápido, Loggi)
    const isAllowedShippingOption = (name: string, companyName?: string) => {
      const text = `${name} ${companyName || ""}`.toLowerCase();
      const isCorreios = text.includes("correios") || text.includes("pac") || text.includes("sedex");
      const isJadlog = text.includes("jadlog");
      const isLoggi = text.includes("loggi");

      if (isCorreios) {
        return text.includes("pac") || text.includes("sedex");
      }
      if (isJadlog) {
        // Aceita Jadlog .Com / Econômico e .Package / Rápido
        return true;
      }
      if (isLoggi) {
        return true;
      }
      return false;
    };

    if (!token) {
      throw new Error("Token do Melhor Envio não configurado. Configure MELHOR_ENVIO_TOKEN para calcular o frete real.");
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
      const errText = await response.text();
      console.error("[Melhor Envio] Erro na cotação real:", errText);
      throw new Error(`Melhor Envio API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    if (!Array.isArray(data)) return [];

    // Filtra estritamente para manter apenas Correios, Jadlog e Loggi autorizados
    return data.filter((item: any) => {
      if (item.error) return false;
      return isAllowedShippingOption(item.name || "", item.company?.name);
    });
}
