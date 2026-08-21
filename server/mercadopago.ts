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
  /** Validade da cobrança offline/Pix em formato ISO 8601. */
  date_of_expiration?: string;
  /** Chave estável por tentativa de cobrança para impedir duplicações acidentais. */
  idempotencyKey?: string;
}

/**
 * Converte o endereço interno do checkout para os nomes esperados pela API do Mercado Pago.
 * Os campos são enviados quando disponíveis para manter compatibilidade com validações
 * regionais do Pix e de outros meios de pagamento.
 */
export function buildMercadoPagoPaymentPayload(params: CreatePaymentParams) {
  const { idempotencyKey: _idempotencyKey, ...paymentParams } = params;
  const address = params.payer.address;
  return {
    ...paymentParams,
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

  // Mapeamento de recusas e códigos de erro detalhados do Mercado Pago
  const statusDetail = String(data?.status_detail || "").toLowerCase();
  const errorCode = String(data?.error || "").toLowerCase();

  if (statusDetail === "cc_rejected_bad_filled_date" || hasCauseCode(301)) {
    return "A data de validade do cartão está incorreta. Verifique o mês e o ano informados.";
  }
  if (statusDetail === "cc_rejected_bad_filled_other" || hasCauseCode(302)) {
    return "Alguns dados do cartão foram preenchidos incorretamente. Verifique o número e os dados informados.";
  }
  if (statusDetail === "cc_rejected_bad_filled_security_code" || hasCauseCode(303)) {
    return "O código de segurança (CVV) do cartão está incorreto. Verifique os 3 ou 4 dígitos no verso do cartão.";
  }
  if (statusDetail === "cc_rejected_call_for_authorize" || hasCauseCode(109)) {
    return "O pagamento com cartão exigiu autorização prévia do banco emissor. Entre em contato com o seu banco para autorizar a transação.";
  }
  if (statusDetail === "cc_rejected_card_disabled" || hasCauseCode(150)) {
    return "O cartão informado está desativado ou bloqueado. Utilize outro cartão ou entre em contato com o seu banco.";
  }
  if (statusDetail === "cc_rejected_card_error" || hasCauseCode(300)) {
    return "Não foi possível processar o pagamento com este cartão. Verifique os dados ou utilize outro cartão.";
  }
  if (statusDetail === "cc_rejected_duplicated_payment" || hasCauseCode(205)) {
    return "Já existe um pagamento idêntico processado recentemente com este cartão.";
  }
  if (statusDetail === "cc_rejected_high_risk" || hasCauseCode(206)) {
    return "O pagamento foi recusado por motivos de segurança. Recomendamos utilizar outro cartão ou pagar via Pix.";
  }
  if (statusDetail === "cc_rejected_insufficient_amount" || hasCauseCode(107)) {
    return "O cartão não possui saldo ou limite suficiente para concluir esta compra.";
  }
  if (statusDetail === "cc_rejected_invalid_installments" || hasCauseCode(126)) {
    return "O número de parcelas escolhido não é suportado por este cartão ou banco emissor.";
  }
  if (statusDetail === "cc_rejected_max_attempts" || hasCauseCode(207)) {
    return "Você atingiu o limite de tentativas permitidas com este cartão. Utilize outro cartão ou método de pagamento.";
  }
  if (statusDetail === "cc_rejected_other_reason" || errorCode.includes("rejected")) {
    return "O pagamento com cartão foi recusado pelo banco emissor. Verifique o limite ou utilize outro cartão de crédito.";
  }

  return rawMessage || `Erro ao processar pagamento no Mercado Pago (HTTP ${status}).`;
}

/**
 * Função responsável por enviar a requisição de pagamento transparente para o Mercado Pago.
 */
export async function createMercadoPagoPayment(params: CreatePaymentParams) {
  const accessToken = ENV.mpAccessToken;

  // Se o token de acesso não estiver configurado, em produção aplicamos fail-fast para evitar aprovações falsas
  if (!accessToken || accessToken.trim() === "") {
    if (ENV.isProduction) {
      console.error("[MercadoPago CRITICAL] Erro de configuração: MP_ACCESS_TOKEN não está definido no ambiente de produção.");
      throw new Error("Configuração de pagamento incompleta em produção: credenciais do Mercado Pago não fornecidas.");
    }
    console.warn("[MercadoPago] ATENÇÃO: MP_ACCESS_TOKEN não configurado. Utilizando modo simulado (sandbox/mock) em desenvolvimento.");
    
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
        external_reference: params.external_reference,
        date_of_expiration: params.date_of_expiration,
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
  const idempotencyKey = params.idempotencyKey || `${params.external_reference || "eras-payment"}-v1`;
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
    signal: AbortSignal.timeout(20_000),
  });
  const data = (await response.json()) as any;
  if (!response.ok) {
    console.error("[MercadoPago] Erro ao consultar pagamento:", data);
    throw new Error(data.message || data.error || "Não foi possível consultar o pagamento no Mercado Pago.");
  }
  return data;
}

/**
 * Procura pagamentos pelo external_reference do pedido. É usado para
 * conciliação manual no admin quando o webhook foi perdido ou chegou antes
 * de a chave secreta estar configurada. A operação é somente leitura.
 */
export async function searchMercadoPagoPayments(externalReference: string) {
  const accessToken = ENV.mpAccessToken;
  if (!accessToken || accessToken.trim() === "") return [];

  const url = new URL(`${MP_API_BASE}/v1/payments/search`);
  url.searchParams.set("external_reference", externalReference);
  url.searchParams.set("limit", "20");

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(20_000),
  });
  const data = (await response.json()) as any;
  if (!response.ok) {
    console.error("[MercadoPago] Erro ao procurar pagamentos por referência:", data);
    throw new Error(data.message || data.error || "Não foi possível localizar o pagamento no Mercado Pago.");
  }

  return (Array.isArray(data?.results) ? data.results : [])
    .filter((payment: any) => String(payment?.external_reference ?? "") === externalReference)
    .sort((a: any, b: any) => {
      const aTime = Date.parse(String(a?.date_last_updated ?? a?.date_created ?? "")) || 0;
      const bTime = Date.parse(String(b?.date_last_updated ?? b?.date_created ?? "")) || 0;
      return bTime - aTime;
    });
}
