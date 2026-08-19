/**
 * Validação de assinatura (HMAC) das notificações de webhook do Mercado Pago.
 *
 * O Mercado Pago envia dois cabeçalhos nas notificações:
 *   x-signature:  "ts=1704908010,v1=618c85345248dd820d5fd456117c2ab2ef8eda45a0282ff693eac24131a5e839"
 *   x-request-id: identificador único da requisição
 *
 * O manifesto assinado é montado no formato:
 *   id:<data.id>;request-id:<x-request-id>;ts:<ts>;
 * e comparado com o HMAC-SHA256 do manifesto usando a chave secreta do webhook
 * (Painel do Mercado Pago > Suas integrações > Webhooks > Chave secreta).
 */

import crypto from "crypto";

export interface VerifySignatureInput {
  signatureHeader?: string | null;
  requestId?: string | null;
  dataId?: string | null;
  secret: string;
  /** Tolerância de tempo em milissegundos (proteção contra replay). Padrão: 5 minutos. */
  toleranceMs?: number;
  /** Injetável nos testes. */
  now?: number;
}

export type VerifySignatureResult =
  | { valid: true }
  | { valid: false; reason: string };

/** Extrai os campos ts e v1 do cabeçalho x-signature. */
export function parseSignatureHeader(header: string): { ts?: string; v1?: string } {
  const parts: { ts?: string; v1?: string } = {};
  for (const chunk of header.split(",")) {
    const [rawKey, ...rest] = chunk.split("=");
    const key = rawKey?.trim();
    const value = rest.join("=").trim();
    if (key === "ts") parts.ts = value;
    if (key === "v1") parts.v1 = value;
  }
  return parts;
}

/** Monta o manifesto exatamente como especificado pelo Mercado Pago. */
export function buildSignatureManifest(dataId: string, requestId: string, ts: string): string {
  // O Mercado Pago normaliza IDs alfanuméricos para minúsculas no manifesto.
  return `id:${dataId.toLowerCase()};request-id:${requestId};ts:${ts};`;
}

function safeEqualHex(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "hex");
  const bufB = Buffer.from(b, "hex");
  if (bufA.length === 0 || bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function verifyMercadoPagoSignature(input: VerifySignatureInput): VerifySignatureResult {
  const { signatureHeader, requestId, dataId, secret } = input;
  const toleranceMs = input.toleranceMs ?? 5 * 60 * 1000;
  const now = input.now ?? Date.now();

  if (!secret) return { valid: false, reason: "missing_secret" };
  if (!signatureHeader) return { valid: false, reason: "missing_signature_header" };
  if (!dataId) return { valid: false, reason: "missing_data_id" };

  const { ts, v1 } = parseSignatureHeader(signatureHeader);
  if (!ts || !v1) return { valid: false, reason: "malformed_signature_header" };

  // Proteção contra replay: o timestamp pode vir em segundos ou milissegundos.
  const tsNumber = Number(ts);
  if (Number.isFinite(tsNumber)) {
    const tsMs = ts.length > 10 ? tsNumber : tsNumber * 1000;
    if (Math.abs(now - tsMs) > toleranceMs) {
      return { valid: false, reason: "timestamp_out_of_tolerance" };
    }
  }

  const manifest = buildSignatureManifest(String(dataId), requestId ?? "", ts);
  const expected = crypto.createHmac("sha256", secret).update(manifest).digest("hex");

  if (!safeEqualHex(expected, v1)) {
    return { valid: false, reason: "signature_mismatch" };
  }
  return { valid: true };
}
