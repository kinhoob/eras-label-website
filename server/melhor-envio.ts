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

    // Fallback com as 5 opções permitidas
    const getAllowedFallbacks = () => {
      const cepNum = parseInt(payload.to.postal_code.replace(/\D/g, ""), 10) || 50000000;
      const isSudesteOrNordeste = cepNum >= 20000000 && cepNum <= 69999999;
      const baseValue = isSudesteOrNordeste ? 24.90 : 38.50;

      return [
        {
          id: 1,
          name: "Correios SEDEX",
          company: { name: "Correios" },
          price: Number((baseValue * 1.45).toFixed(2)),
          custom_price: Number((baseValue * 1.45).toFixed(2)),
          discount: 0,
          delivery_time: 3,
          error: null,
        },
        {
          id: 2,
          name: "Correios PAC",
          company: { name: "Correios" },
          price: Number(baseValue.toFixed(2)),
          custom_price: Number(baseValue.toFixed(2)),
          discount: 0,
          delivery_time: 7,
          error: null,
        },
        {
          id: 3,
          name: "Jadlog .Com (Econômico)",
          company: { name: "Jadlog" },
          price: Number((baseValue * 0.92).toFixed(2)),
          custom_price: Number((baseValue * 0.92).toFixed(2)),
          discount: 0,
          delivery_time: 6,
          error: null,
        },
        {
          id: 4,
          name: "Jadlog .Package (Rápido)",
          company: { name: "Jadlog" },
          price: Number((baseValue * 1.15).toFixed(2)),
          custom_price: Number((baseValue * 1.15).toFixed(2)),
          discount: 0,
          delivery_time: 4,
          error: null,
        },
        {
          id: 5,
          name: "Loggi Expresso",
          company: { name: "Loggi" },
          price: Number((baseValue * 1.25).toFixed(2)),
          custom_price: Number((baseValue * 1.25).toFixed(2)),
          discount: 0,
          delivery_time: 4,
          error: null,
        },
      ];
    };

    if (!token) {
      return getAllowedFallbacks();
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
      if (!Array.isArray(data)) return [];

      // Filtra estritamente para manter apenas Correios, Jadlog e Loggi autorizados
      return data.filter((item: any) => {
        if (item.error) return false;
        return isAllowedShippingOption(item.name || "", item.company?.name);
      });
    } catch (err) {
      console.warn("[Melhor Envio] Falha na requisição, usando fallback permitido:", err);
      return getAllowedFallbacks();
    }
}
