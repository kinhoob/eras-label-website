/**
 * Módulo de Integração com Mercado Pago (Checkout Transparente)
 * Responsável por criar pagamentos Pix e Cartão de Crédito via API oficial do Mercado Pago.
 * Inclui comentários detalhados explicando cada etapa conforme as preferências da marca Eras Label.
 */

import { ENV } from "./_core/env";

// URL base da API do Mercado Pago
const MP_API_BASE = "https://api.mercadopago.com";

export interface CreatePaymentParams {
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
    address?: {
      zip_code?: string;
      street_name?: string;
      street_number?: string;
      neighborhood?: string;
      city?: string;
      federal_unit?: string;
    };
  };
  external_reference?: string; // ID do pedido na Eras Label
}

/**
 * Converte o endereço interno do checkout para os nomes esperados pela API do Mercado Pago.
 * Os campos são enviados quando disponíveis para manter compatibilidade com validações
 * regionais do Pix e de outros meios de pagamento.
 */
export function buildMercadoPagoPaymentPayload(params: CreatePaymentParams) {
  const address = params.payer.address;
  return {
    ...params,
    payer: {
      ...params.payer,
      ...(address ? {
        address: {
          ...address,
          zip_code: address.zip_code?.replace(/\D/g, ""),
          street_name: address.street_name?.trim(),
          street_number: address.street_number?.trim(),
          neighborhood: address.neighborhood?.trim(),
          city: address.city?.trim(),
          federal_unit: address.federal_unit?.trim().toUpperCase(),
        },
      } : {}),
    },
  };
}

export function getMercadoPagoErrorMessage(data: any, status: number) {
  const rawMessage = String(data?.message || data?.error || "").trim();
  const causes = Array.isArray(data?.cause) ? data.cause : [];
  const hasCauseCode = (code: number) => causes.some((cause: any) => Number(cause?.code) === code);

  // Código 2034 indica que o token do cartão e o Access Token não pertencem
  // ao mesmo utilizador vendedor. Isso costuma acontecer quando MP_PUBLIC_KEY
  // e MP_ACCESS_TOKEN foram copiados de contas sandbox diferentes.
  if (hasCauseCode(2034) || rawMessage.toLowerCase().includes("invalid users involved")) {
    return "As credenciais sandbox do Mercado Pago não pertencem à mesma conta vendedora. Gere MP_PUBLIC_KEY e MP_ACCESS_TOKEN no mesmo utilizador de teste e atualize ambos nas Secrets do projeto.";
  }

  if (rawMessage.includes("communication_error")) {
    return "O Mercado Pago não conseguiu comunicar com o meio de pagamento. No sandbox, confirme que a conta vendedora tem uma chave Pix registada e que o MP_ACCESS_TOKEN é a credencial APP_USR dessa mesma conta.";
  }
  if (rawMessage.includes("bin_not_found")) {
    return "O BIN do cartão não foi reconhecido pelo Mercado Pago. Utilize um cartão de teste válido do Mercado Pago (ex: cartão Mastercard ou Visa de teste do ambiente sandbox).";
  }
  return rawMessage || `Erro ao processar pagamento no Mercado Pago (HTTP ${status}).`;
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
  const payload = buildMercadoPagoPaymentPayload(params);
  const idempotencyKey = `${params.external_reference || "eras-payment"}-v1`;
  const response = await fetch(`${MP_API_BASE}/v1/payments`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      // A chave precisa ser estável para que um retry do mesmo pedido não crie uma cobrança duplicada.
      "X-Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(20_000),
  });

  const data = (await response.json()) as any;

  if (!response.ok) {
    console.error("[MercadoPago] Erro na API do Mercado Pago:", {
      status: response.status,
      error: data?.error,
      message: data?.message,
      cause: data?.cause,
      externalReference: params.external_reference,
      paymentMethodId: params.payment_method_id,
    });
    throw new Error(getMercadoPagoErrorMessage(data, response.status));
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
