/**
 * Módulo de Integração com Mercado Pago (Checkout Transparente)
 * Responsável por criar pagamentos Pix e Cartão de Crédito via API oficial do Mercado Pago.
 * Inclui comentários detalhados explicando cada etapa conforme as preferências da marca Eras Label.
 */

import { ENV } from "./_core/env";

// URL base da API do Mercado Pago
const MP_API_BASE = "https://api.mercadopago.com";

interface CreatePaymentParams {
  transaction_amount: number;
  description: string;
  payment_method_id: string; // 'pix', 'visa', 'master', etc.
  token?: string; // Token do cartão gerado no frontend (SDK do Mercado Pago)
  installments?: number;
  payer: {
    email: string;
    first_name: string;
    last_name?: string;
    identification: {
      type: string; // 'CPF' ou 'CNPJ'
      number: string;
    };
  };
  external_reference?: string; // ID do pedido na Eras Label
}

/**
 * Função responsável por enviar a requisição de pagamento transparente para o Mercado Pago.
 */
export async function createMercadoPagoPayment(params: CreatePaymentParams) {
  const accessToken = ENV.mpAccessToken;

  // Se o token de acesso não estiver configurado, retornamos um mock simulado para testes e desenvolvimento local
  if (!accessToken || accessToken.trim() === "") {
    console.warn("[MercadoPago] ATENÇÃO: MP_ACCESS_TOKEN não configurado. Utilizando modo simulado (sandbox/mock).");
    
    if (params.payment_method_id === "pix") {
      return {
        id: Math.floor(Math.random() * 1000000000),
        status: "pending",
        status_detail: "pending_waiting_transfer",
        payment_method_id: "pix",
        point_of_interaction: {
          transaction_data: {
            qr_code: "00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-4266141740005204000053039865802BR5925Eras Label E-commerce6009Sao Paulo62070303***63041D3C",
            qr_code_base64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
            ticket_url: "https://www.mercadopago.com.br/payments/mock/ticket"
          }
        },
        external_reference: params.external_reference
      };
    } else {
      // Cartão aprovado no mock
      return {
        id: Math.floor(Math.random() * 1000000000),
        status: "approved",
        status_detail: "accredited",
        payment_method_id: params.payment_method_id,
        external_reference: params.external_reference
      };
    }
  }

  // Requisição real à API do Mercado Pago
  const response = await fetch(`${MP_API_BASE}/v1/payments`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": `${params.external_reference}-${Date.now()}`
    },
    body: JSON.stringify(params)
  });

  const data = (await response.json()) as any;

  if (!response.ok) {
    console.error("[MercadoPago] Erro na API do Mercado Pago:", data);
    throw new Error(data.message || data.error || "Erro ao processar pagamento no Mercado Pago");
  }

  return data;
}

export async function getMercadoPagoPayment(paymentId: string | number) {
  const accessToken = ENV.mpAccessToken;
  if (!accessToken || accessToken.trim() === "") return null;

  const response = await fetch(`${MP_API_BASE}/v1/payments/${encodeURIComponent(String(paymentId))}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = (await response.json()) as any;
  if (!response.ok) {
    console.error("[MercadoPago] Erro ao consultar pagamento:", data);
    throw new Error(data.message || data.error || "Não foi possível consultar o pagamento no Mercado Pago.");
  }
  return data;
}
